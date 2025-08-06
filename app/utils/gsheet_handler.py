import os
import gspread
from google.oauth2.service_account import Credentials
from typing import Dict, Any

# 1. Initialize client once
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
CREDS = Credentials.from_service_account_file(
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"], scopes=SCOPES
)
GS_CLIENT = gspread.authorize(CREDS)

# 2. Open your spreadsheet (by name or ID)
SPREADSHEET_ID = os.getenv("LOG_SPREADSHEET_ID")  # set this in env
SHEET_GEN = "GenerationLogs"
SHEET_FB  = "FeedbackLogs"

def append_generation_log(row: Dict[str, Any]) -> int:
    """
    Appends a new row to the GenerationLogs sheet.
    Returns the 1-based index of the new row in the sheet.
    """
    sheet = GS_CLIENT.open_by_key(SPREADSHEET_ID).worksheet(SHEET_GEN)
    # Ensure header exists only once; then append
    sheet.append_row(list(row.values()), value_input_option="USER_ENTERED")
    return sheet.row_count  # or use len(sheet.get_all_values())

def update_generation_log_feedback_row(request_id: str, feedback_row_id: int):
    """
    Finds the row with given request_id in GenerationLogs
    and sets its 'feedback_row_id' column to the provided value.
    """
    sheet = GS_CLIENT.open_by_key(SPREADSHEET_ID).worksheet(SHEET_GEN)
    # Assuming 'request_id' is in column A and 'feedback_row_id' is in the last column
    col_request_id = sheet.row_values(1).index("request_id") + 1
    col_feedback   = sheet.row_values(1).index("feedback_row_id") + 1

    cell = sheet.find(request_id, in_column=col_request_id)
    if cell:
        sheet.update_cell(cell.row, col_feedback, feedback_row_id)
    else:
        raise ValueError(f"request_id {request_id} not found in GenerationLogs")
