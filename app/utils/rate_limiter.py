# app/core/rate_limiter.py
from slowapi import Limiter
from slowapi.util import get_remote_address
from datetime import datetime, timedelta, timezone
import os


RESET_HOUR = int(os.getenv("RESET_HOUR", 0))
RESET_MINUTE = int(os.getenv("RESET_MINUTE", 5))

def fixed_reset_key(request):
    """Generate a key that changes every day at RESET_HOUR:RESET_MINUTE"""
    now = datetime.now(timezone.utc)
    
    # determine today's reset anchor
    reset_time = now.replace(hour=RESET_HOUR, minute=RESET_MINUTE, second=0, microsecond=0)
    
    # if current time is before today's reset anchor, use yesterday’s
    if now < reset_time:
        reset_time = reset_time - timedelta(days=1)
    
    # create a "bucket id" based on reset anchor datetime
    bucket_id = reset_time.strftime("%Y-%m-%d-%H%M")
    
    # combine client address with bucket_id
    return f"{get_remote_address(request)}:{bucket_id}"




def get_seconds_until_reset() -> int:
    """Return seconds until the next reset window."""
    now = datetime.now(timezone.utc)
    reset_time = now.replace(
        hour=RESET_HOUR,
        minute=RESET_MINUTE,
        second=0,
        microsecond=0
    )
    if now >= reset_time:  # if today’s reset time has passed, schedule tomorrow
        reset_time += timedelta(days=1)
    return int((reset_time - now).total_seconds())

def format_seconds_to_human(seconds: int) -> str:
    hours, remainder = divmod(seconds, 3600)
    minutes, _ = divmod(remainder, 60)
    parts = []
    if hours:
        parts.append(f"{hours}h")
    if minutes or not parts:  # always show minutes if no hours
        parts.append(f"{minutes}m")
    return " ".join(parts)

    
limiter = Limiter(key_func=fixed_reset_key)
