import os

from crewai import Agent, Task, Crew, Process, LLM
from crewai_tools import SerperDevTool, ScrapeWebsiteTool
from crewai.project import crew, task, agent, CrewBase
from crewai.knowledge.source.pdf_knowledge_source import PDFKnowledgeSource

from src.models.models import CompanyResearch, JobRequirements, ResumeOptimization


@CrewBase
class ResumeCrew:
    """ResumeCrew for resume optimization and interview preparation """
    agents_config: str = "config/agents.yaml"
    tasks_config: str = "config/tasks.yaml"

    def __init__(self, knowledge_path):
        self.resume_pdf = PDFKnowledgeSource(file_paths=knowledge_path,
                                             embedder={"provider": "google",
                                                       "config": {
                                                           "model": "models/text-embedding-004",
                                                           "api_key": "AIzaSyDE5Dj_vpdBAYfzit1oJo_KgA4sy5Ikdn4"}
                                                       })

    @agent
    def resume_analyzer(self) -> Agent:
        resume_analyzer_agent = Agent(config=self.agents_config["resume_analyzer"], verbose=True,
                                      llm=LLM(os.getenv("GOOGLE_MODEL"), api_key=os.getenv("GOOGLE_API_KEY")),
                                      knowledge_sources=[self.resume_pdf],
                                      embedder={"provider": "google", "config": {
                                        "model": "models/text-embedding-004",
                                        "api_key": "AIzaSyDE5Dj_vpdBAYfzit1oJo_KgA4sy5Ikdn4"}
                                              })
        return resume_analyzer_agent

    @agent
    def job_analyzer(self) -> Agent:
        job_analyzer_agent = Agent(config=self.agents_config["job_analyzer"], verbose=True,
                                   llm=LLM(os.getenv("GOOGLE_MODEL"), api_key="AIzaSyDE5Dj_vpdBAYfzit1oJo_KgA4sy5Ikdn4"),
                                   tools=[ScrapeWebsiteTool()])
        return job_analyzer_agent

    @agent
    def company_researcher(self) -> Agent:
        company_researcher_agent = Agent(config=self.agents_config["company_researcher"], verbose=True,
                                         llm=LLM(os.getenv("GOOGLE_MODEL"), api_key=os.getenv("GOOGLE_API_KEY")),
                                         tools=[SerperDevTool()], knowledge_sources=[self.resume_pdf],
                                         embedder={"provider": "google", "config":
                                                {"model": "models/text-embedding-004",
                                                 "api_key": "AIzaSyDE5Dj_vpdBAYfzit1oJo_KgA4sy5Ikdn4",
                                                 }})
        return company_researcher_agent

    @agent
    def resume_writer(self) -> Agent:
        resume_writer_agent = Agent(config=self.agents_config["resume_writer"], verbose=True,
                                    llm=LLM(os.getenv("GOOGLE_MODEL"), api_key="AIzaSyDE5Dj_vpdBAYfzit1oJo_KgA4sy5Ikdn4"))
        return resume_writer_agent

    @agent
    def report_generator(self) -> Agent:
        report_generator_agent = Agent(config=self.agents_config["report_generator"], verbose=True,
                                       llm=LLM(os.getenv("GOOGLE_MODEL"), api_key="AIzaSyDE5Dj_vpdBAYfzit1oJo_KgA4sy5Ikdn4"))
        return report_generator_agent

    @agent
    def pdf_generator(self) -> Agent:
        pdf_generator_agent = Agent(config=self.agents_config["pdf_generator"], verbose=True,
                                    llm=LLM(os.getenv("GOOGLE_MODEL"), api_key="AIzaSyDE5Dj_vpdBAYfzit1oJo_KgA4sy5Ikdn4"))
        return pdf_generator_agent

    @task
    def analyze_job_task(self) -> Task:
        job_task = Task(config=self.tasks_config["analyze_job_task"],
                        output_pydantic=JobRequirements, output_file="output/job_analysis.json")
        return job_task

    @task
    def optimize_resume_task(self) -> Task:
        resume_task = Task(config=self.tasks_config["optimize_resume_task"],
                           output_pydantic=ResumeOptimization, output_file="output/resume_optimization.json")
        return resume_task

    @task
    def research_company_task(self) -> Task:
        company_task = Task(config=self.tasks_config["research_company_task"],
                            output_pydantic=CompanyResearch, output_file="output/research_company.json")
        return company_task

    @task
    def generate_resume_task(self) -> Task:
        resume_task = Task(config=self.tasks_config["generate_resume_task"], output_file="output/refined_resume.md")
        return resume_task

    @task
    def generate_report_task(self) -> Task:
        report_task = Task(config=self.tasks_config["generate_report_task"], output_file="output/final_report.md")
        return report_task

    @task
    def generate_pdf_task(self) -> Task:
        pdf_task = Task(config=self.tasks_config["generate_pdf_task"], output_file="output/refined_resume_report.html")
        return pdf_task

    @crew
    def crew(self) -> Crew:
        return Crew(name="Resume Optimization", agents=self.agents, tasks=self.tasks,
                    process=Process.sequential, knowledge_sources=[self.resume_pdf], verbose=True)

