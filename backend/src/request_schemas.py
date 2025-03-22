from pydantic import BaseModel


class ResumeDataRequest(BaseModel):
    resumeData: str
    jobUrl: str
    companyName: str

