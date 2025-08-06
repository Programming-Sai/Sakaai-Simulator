import json
from datetime import datetime
from typing import Any, Dict

def log_event(event_type: str, request_id: str, **fields: Any):
    entry = {
        "timestamp":   datetime.utcnow().isoformat(),
        "event_type":  event_type,
        "request_id":  request_id,
        **fields,
    }
    print("-" * 60)
    print(json.dumps(entry, indent=2, ensure_ascii=False))
    print("-" * 60)

def append_to_gsheets(sheet_name: str, row: Dict[str, Any]):
    # Hook your Google Sheets client here, e.g. gspread or Google API
    # sheet = gspread_client.open(sheet_name).sheet1
    # sheet.append_row(list(row.values()))
    pass
