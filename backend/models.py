from pydantic import BaseModel, Field
from typing import List, Optional

class OptimizeRequest(BaseModel):
    start_time: str = Field(..., pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    end_time: str = Field(..., pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    number_of_windows: int = Field(ge=1, le=10)
    appliances: Optional[List[str]] = None

class TimeWindow(BaseModel):
    start_time: str
    end_time: str
    carbon_intensity: float
    renewable_percentage: float
    appliances: List[str]
    energy_savings_kg: float

class OptimizeResponse(BaseModel):
    success: bool
    data: dict
    message: str

class TimeRange(BaseModel):
    label: str
    start: str
    end: str

class AvailableTimeRangesResponse(BaseModel):
    success: bool
    data: dict

class ApplianceSchedule(BaseModel):
    appliance: str
    window_start: str
    window_end: str
    duration_minutes: int

class UserPreferences(BaseModel):
    allow_overnight: bool
    max_carbon_intensity: float

class ScheduleAppliancesRequest(BaseModel):
    schedule: List[ApplianceSchedule]
    user_preferences: UserPreferences

class ScheduleAppliancesResponse(BaseModel):
    success: bool
    data: dict
    message: str

class GreenWindowRequest(BaseModel):
    start_time: Optional[str] = Field(None, pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    end_time: Optional[str] = Field(None, pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    number_of_windows: Optional[int] = Field(None, ge=1, le=24)

class GreenWindow(BaseModel):
    start_time: str
    end_time: str
    carbon_intensity: float
    renewable_percentage: float
    window_type: str

class GreenWindowsResponse(BaseModel):
    success: bool
    data: dict
    message: str

class PredictDemandResponse(BaseModel):
    success: bool
    data: dict
    message: str
