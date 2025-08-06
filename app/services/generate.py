from app.utils.file_validator import validate_file
from app.utils.file_parser import get_text_from_file
from app.utils.quiz_engine import generate_quiz
from app.utils.request_context import RequestContext
from app.utils.logger        import log_event


async def generate_quizzes_from_text_or_file(request_id: str, prompt: str, file=None, extra_data={}, ctx=None):
    ctx = RequestContext(request_id=request_id)
    ctx.set_input(**extra_data)
    file_text = ""
    
    if file:
        validate_file(file)
        try:
            file_text = await get_text_from_file(file, ctx)
        except Exception as e:
            # file‐level failure already logged inside get_text_from_file
            raise

    if not prompt.strip() and not file_text:
        raise ValueError("No content to generate from.")
    
    
    input_data = {
        "user_additional_instructions": prompt.strip(),  
        "source_material": file_text,
        **extra_data
    }
    print(input_data)
    return generate_quiz(input_data, ctx)

