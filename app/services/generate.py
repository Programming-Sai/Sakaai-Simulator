from app.utils.file_validator import validate_file
from app.utils.file_parser import get_text_from_file
from app.utils.quiz_engine import generate_quiz

async def generate_quizzes_from_text_or_file(prompt: str, file=None, extra_data={}):
    file_text = ""
    
    if file:
        validate_file(file)
        file_text = await get_text_from_file(file) 


    if not prompt.strip() and not file_text:
        raise ValueError("No content to generate from.")
    
    
    input_data = {
        "user_additional_instructions": prompt.strip(),  # you could pass more metadata later
        "source_material": file_text,
        **extra_data
    }
    print(input_data)
    return generate_quiz(input_data)

