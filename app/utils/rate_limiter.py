# app/core/rate_limiter.py
from slowapi import Limiter
from slowapi.util import get_remote_address

# Single shared limiter instance — configure key_func once
limiter = Limiter(key_func=get_remote_address)
