import os
import tempfile
from fastapi import UploadFile, HTTPException
from langchain_community.document_loaders import UnstructuredFileLoader
from langchain_community.document_loaders import TextLoader
import tiktoken

MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "2"))
MAX_TOKENS      = int(os.getenv("MAX_TOKENS", "10000"))

def estimate_tokens(text: str) -> int:
    enc = tiktoken.get_encoding("cl100k_base")
    try:
        enc = tiktoken.encoding_for_model("deepseek-llm")
    except Exception:
        pass
    return len(enc.encode(text))

async def get_text_from_file(file: UploadFile) -> str:
    # 1) Read upload into memory, enforce size limit
    file_bytes = await file.read()
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(413, f"File too large: {size_mb:.2f}MB (max {MAX_FILE_SIZE_MB}MB).")

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
        if token_count > MAX_TOKENS:
            raise HTTPException(
                413,
                f"Extracted text too long: {token_count} tokens (max {MAX_TOKENS})."
            )
        print("\n\nSource Material.\n", text, "\n\n")
        return text

    finally:
        # 5) Always clean up the temp file
        try:
            os.remove(tmp_path)
        except OSError:
            pass
