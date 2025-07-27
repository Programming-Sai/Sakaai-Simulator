from app.utils.file_validator import validate_file
from app.utils.file_parser import get_text_from_file
from app.utils.quiz_engine import generate_quiz

async def generate_quizzes_from_text_or_file(prompt: str, file=None):
    file_text = ""
    
    if file:
        validate_file(file)
        file_text = get_text_from_file(file)

    # text_to_generate_from = prompt.strip() if not file_text else prompt.strip() + "\n\n" +file_text

    if not prompt.strip() and not file_text:
        raise ValueError("No content to generate from.")
    
    # # Now for the actual implementation of the llm logic.
    # quizzes = generate_quiz()

    # # Placeholder - Replace with actual generation later
    # return [{
    #     "type": "mcq",
    #     "question": f"What is based on: {text_to_generate_from}...?",
    #     "choices": ["Option A", "Option B", "Option C", "Option D"],
    #     "answer": "Option A",
    #     "explanation": "This is just a placeholder explanation."
    # }]
    input_data = {
        "user_additional_instructions": prompt.strip(),  # you could pass more metadata later
        "source_material": file_text
    }

    return generate_quiz(input_data)

