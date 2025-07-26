import os
import tempfile
from fastapi import UploadFile
from langchain.document_loaders import UnstructuredFileLoader

def get_text_from_file(file: UploadFile) -> str:
    # Save to a temporary file
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(file.file.read())
        temp_filepath = temp_file.name

    try:
        loader = UnstructuredFileLoader(temp_filepath)
        docs = loader.load()
        return "\n".join([doc.page_content for doc in docs])
    finally:
        os.remove(temp_filepath)  # Clean up temp file
