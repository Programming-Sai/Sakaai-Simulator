import os
import tempfile
from fastapi import UploadFile, HTTPException
from langchain_community.document_loaders import UnstructuredFileLoader
from langchain_community.document_loaders import TextLoader
# import tiktoken
from app.utils.request_context import RequestContext
from app.utils.logger          import log_event, append_to_gsheets

MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "2"))
MAX_TOKENS      = int(os.getenv("MAX_TOKENS", "10000"))

def estimate_tokens(text: str) -> int:
    # enc = tiktoken.get_encoding("cl100k_base") 
    # try:
    #     enc = tiktoken.encoding_for_model("deepseek-llm")
    # except Exception:
    #     pass
    # print(len(enc.encode(text)))
    # return len(enc.encode(text))
    return 0

async def get_text_from_file(file: UploadFile, ctx: RequestContext) -> str:
    # 1) Read upload into memory, enforce size limit
    file_bytes = await file.read()
    size_mb = len(file_bytes) / (1024 * 1024)
    ctx.set_log(file_size_kb=size_mb*1024)
    if size_mb > MAX_FILE_SIZE_MB:
        msg = f"File too large: {size_mb:.2f}MB"
        log_event("file_parse_error", request_id=ctx.request_id, error_message=msg, **ctx.logs)
        append_to_gsheets("generation", {**ctx.inputs, **ctx.logs, "status":"failure", "error_message":msg})
        raise HTTPException(413, msg)

    # 2) Dump to a real temp file, so Unstructured can operate on it
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        # 3) Attempt Unstructured partition
        try:
            loader = UnstructuredFileLoader(tmp_path)
            docs   = loader.load()
        except ValueError as e:
            if "not a ZIP archive" in str(e):
                # fall back to plain-text loader
                text_loader = TextLoader(tmp_path, encoding="utf-8")
                docs = text_loader.load()
            else:
                raise

        # 4) Concatenate pages and enforce token limit
        text = "\n\n".join(doc.page_content for doc in docs)
        token_count = estimate_tokens(text)
        ctx.set_log(tokens_extracted=token_count)
        if token_count > MAX_TOKENS:
            msg = f"Extracted text too long: {token_count} tokens"
            log_event("file_parse_error", request_id=ctx.request_id, error_message=msg, **ctx.logs)
            append_to_gsheets("generation", {**ctx.inputs, **ctx.logs, "status":"failure", "error_message":msg})
            raise HTTPException(413, msg)
        # print("\n\nSource Material.\n", text, "\n\n")
        return text

    finally:
        # 5) Always clean up the temp file
        try:
            os.remove(tmp_path)
        except OSError:
            pass
