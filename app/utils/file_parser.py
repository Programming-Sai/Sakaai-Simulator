import os
import tempfile
from fastapi import UploadFile
from langchain_community.document_loaders import UnstructuredFileLoader
import os


MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "2"))
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "10000"))


def estimate_tokens(text: str) -> int:
    import tiktoken
    enc = tiktoken.get_encoding("cl100k_base")  # Safe fallback
    try:
        enc = tiktoken.encoding_for_model("deepseek-llm")  # Assuming tiktoken knows this
    except:
        pass  # fallback remains
    print(len(enc.encode(text)))
    return len(enc.encode(text))






def get_text_from_file(file: UploadFile) -> str:
    # Save to a temporary file
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        file_bytes = file.file.read()
        temp_file.write(file.file.read())
        temp_filepath = temp_file.name

    try:
        file_size_mb = len(file_bytes) / (1024 * 1024)
        if file_size_mb > MAX_FILE_SIZE_MB:
            raise ValueError(f"File too large: {file_size_mb:.2f}MB (Limit: {MAX_FILE_SIZE_MB}MB)")
        
        loader = UnstructuredFileLoader(temp_filepath)
        docs = loader.load()
        text = "\n".join([doc.page_content for doc in docs])

        token_count = estimate_tokens(text)
        if token_count > MAX_TOKENS:
            raise ValueError(f"Text too long: {token_count} tokens (Limit: {MAX_TOKENS})")

        return text
    finally:
        os.remove(temp_filepath)  # Clean up temp file
