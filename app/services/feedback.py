
from fastapi import HTTPException
from app.models.schema import FeedbackRequest
from datetime import datetime, timezone
import os
import json
import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv

# Load .env file
load_dotenv()

service_account_info = json.loads(os.getenv("GOOGLE_SERVICE_ACCOUNT_INFO"))
scopes = ["https://www.googleapis.com/auth/spreadsheets"]


cred = Credentials.from_service_account_info(service_account_info, scopes=scopes)
client = gspread.authorize(cred)

sheet_id = os.getenv("FEEDBACK_SHEET_ID")
sheet = client.open_by_key(sheet_id)



QUESTIONS = [
    "What frustrated you the most while using this?",
    "Was anything confusing, broken, or just... not it?",
    "Was there anything that worked well for you?",
    "If you could change one thing about this app, what would it be?",
    "Any final thoughts, rants, or feedback you wish we'd asked for?"
]


HEADERS = ["Timestamp", "Request ID"] + QUESTIONS



def initialize_feedback_sheet(sheet):
    worksheets = sheet.worksheets()
    
    if not worksheets:
        # No sheet at all — create one
        sheet = sheet.add_worksheet(title="Feedback Responses", rows="100", cols="10")
    else:
        sheet = worksheets[0]
        if sheet.title != "Feedback Responses":
            sheet.update_title("Feedback Responses")
    
    # Check if headers are already set
    existing_values = sheet.row_values(1)
    if existing_values == HEADERS:
        return sheet  # Already initialized

    # Otherwise, write headers
    sheet.update(values=[HEADERS], range_name="A1")
    
    # Bold formatting (row 1)
    fmt = {
        "requests": [{
            "repeatCell": {
                "range": {
                    "sheetId": sheet._properties['sheetId'],
                    "startRowIndex": 0,
                    "endRowIndex": 1
                },
                "cell": {
                    "userEnteredFormat": {
                        "textFormat": {
                            "bold": True
                        }
                    }
                },
                "fields": "userEnteredFormat.textFormat.bold"
            }
        }]
    }
    sheet.spreadsheet.batch_update(fmt)
    return sheet


def append_feedback_response(sheet, request_id: str, answers: list[str]):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    row = [now, request_id] + answers
    sheet.append_row(row, value_input_option="USER_ENTERED")




sheet = initialize_feedback_sheet(sheet)


def process_feedback(feedback: FeedbackRequest):
    # TODO: Replace this with actual Google Sheets call
    try:
        print("Received feedback:")
        print("User ID:", feedback.requestId)
        for i, ans in enumerate(feedback.answers, start=1):
            print(f"Q{i}: {ans}")
        append_feedback_response(sheet, feedback.requestId, feedback.answers)
        return {"message": "Thanks! Your feedback has been recorded."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not process feedback: {str(e)}")



