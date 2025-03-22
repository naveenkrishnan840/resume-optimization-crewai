import os

from fastapi import FastAPI, HTTPException, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import validators
import pdfkit
import base64
from dotenv import load_dotenv
from pathlib import Path

from src.request_schemas import ResumeDataRequest
from src.crew import ResumeCrew

app = FastAPI(name="Resume Optimization FLow")

api_router = APIRouter()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()


@api_router.post("/processingCrewAI")
def processing_input_to_crewai(request: Request, resume_data_request: ResumeDataRequest):
    try:
        resume_data = resume_data_request.resumeData
        job_url = resume_data_request.jobUrl
        company_name = resume_data_request.companyName
        if validators.url(job_url):
            return HTTPException(detail="url invalid", status_code=200)
        os.makedirs("knowledge", exist_ok=True)
        with open("knowledge/input_pdf.pdf", "wb") as file:
            file.write(base64.b64decode(resume_data.split(",")[1]))

        [os.remove(os.path.join("output", i)) for i in os.listdir("output")]

        crewai_task = ResumeCrew("input_pdf.pdf").crew()
        crewai_task.kickoff(inputs={"job_url": job_url, "company_name": company_name})

        with open("output/refined_resume_report.html", encoding="utf-8") as file:
            content = file.read()[8:-5]

        pdfkit.from_string(content, "output/pdf1.pdf", cover_first=True)
        with open("output/pdf1.pdf", mode="rb") as file:
            content = file.read()
        pdf_data = "data:application/pdf;base64," + base64.b64encode(content).decode("utf-8")
        with open("output/final_report.md", encoding="utf-8") as file:
            final_report_data = file.read()
        with open("output/refined_resume.md", encoding="utf-8") as file:
            refined_resume_data = file.read()
        return HTTPException(detail={"pdf_data": pdf_data, "final_report_data": final_report_data,
                                     "refined_resume_data": refined_resume_data}, status_code=200,
                             headers={"Content-Type": "application/json"})
    except Exception as e:
        raise e


app.include_router(router=api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app=app, host="127.0.0.1", port=8000)

