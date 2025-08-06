from dataclasses import dataclass, field
from typing import Any, Dict

@dataclass
class RequestContext:
    request_id: str
    inputs:  Dict[str, Any] = field(default_factory=dict)
    logs:    Dict[str, Any] = field(default_factory=dict)

    def set_input(self, **kwargs: Any):
        self.inputs.update(kwargs)

    def set_log(self, **kwargs: Any):
        self.logs.update(kwargs)
