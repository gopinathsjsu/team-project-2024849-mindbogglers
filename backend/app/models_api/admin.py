# app/models_api/admin.py

from enum import Enum
from pydantic import BaseModel
from typing import Optional

class ApprovalStatusEnum(str, Enum):
    approved = "approved"
    rejected = "rejected"

class ApprovalUpdateRequest(BaseModel):
    status: ApprovalStatusEnum
    notes: Optional[str] = None
