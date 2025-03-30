import React, { use, useRef, useState, useEffect } from "react";
import {Fab, Input, Snackbar, TextareaAutosize} from "@mui/material";
import {Formik, Form, Field} from "formik";
import {RequestService} from "./request";
import parse from 'html-react-parser';
import * as yup from "yup";
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import { Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ReactMarkdown from 'react-markdown';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import remarkGfm from 'remark-gfm'; 
import rehypeRaw from 'rehype-raw';
import rehypeStarryNight from 'rehype-starry-night';
import rehypeHighlight from "rehype-highlight";
import LinearProgress from '@mui/material/LinearProgress';
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";


const formValidationSchema = yup.object().shape({
    resumeData: yup.string().required("Upload Resume is Required"),
    jobUrl: yup.string().required("jobUrl is Required"),
    campanyName: yup.string().required("Company Name is Required"),
});

export default function ChatBotBody () {
    const [resumeData, setResumeData] = useState("");
    const [jobUrl, setJobUrl] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [isDisabled, setIsDisabled] = useState(false);
    const [isError, setIsError] = useState(false);
    const [rescompleted, setRescompleted] = useState(false);
    const[open, setOpen] = useState(true);
    const heightRef = useRef(null);
    const [resFinalMd, setResFinalMd] = useState("");
    const [resRefindMd, setResRefindMd] = useState("");
    const [resPdf, setResPdf] = useState("");
    const [urlInvalid, setUrlInvalid] = useState(false);
    const [isDataSend, setIsDataSend] = useState(false);

    useEffect(()=>{
        if (isDataSend == true) {
            setUrlInvalid(false)
            const data = {"resumeData": resumeData, "jobUrl": jobUrl, "companyName": companyName};
            setIsDisabled(true);
            const response = RequestService("/processingCrewAI", data);
            response.then((response) => {
                if (typeof response.detail == "string") {
                    setUrlInvalid(true);
                    setOpen(true);
                } else if(response.detail) {
                    setResFinalMd(response["detail"]["final_report_data"])
                    setResRefindMd(response["detail"]["refined_resume_data"])
                    setResPdf(response["detail"]["pdf_data"]);
                    setJobUrl("");
                    setResumeData("");
                    setCompanyName("");
                    setRescompleted(true);
                    setOpen(true);
                }
                setIsDisabled(false);
                setIsDataSend(false);
            });
        }
    }, [isDataSend]);

    const onSubmitForm = async (values) => {
        const file = values.resumeData;
        if(file){
            const reader = new FileReader();
            reader.onload = () => {
                setResumeData(reader.result)
            }
            reader.readAsDataURL(file)
        }
        setJobUrl(values.jobUrl)
        setCompanyName(values.campanyName)
        setIsDataSend(true);
      };

    return (
        <>
            {rescompleted == true && <Snackbar className="w-96" anchorOrigin={{ vertical: "top", horizontal: "center" }} open={open} autoHideDuration={5000} onClose={() => setOpen(false)}>
                <Alert onClose={() => setOpen(false)} severity="info"    style={{backgroundColor: "#151b23"}}>
                    Resume Report Gerneration Completed...
                </Alert>
            </Snackbar>}
            {urlInvalid == true && <Snackbar className="w-96" anchorOrigin={{ vertical: "top", horizontal: "center" }} open={open} autoHideDuration={5000} onClose={() => setOpen(false)}>
                <Alert onClose={() => setOpen(false)} severity="error"  style={{backgroundColor: "#151b23"}}>
                    Job Url In Valid
                </Alert>
            </Snackbar>}
            {isError && <Alert onClose={()=>{setIsError(false)}} severity="error">Youtube Url is not valid. Can you check the url</Alert>}
            <div className="h-auto w-auto">
                <div style={{backgroundColor: "#151b23"}} className="w-auto h-14 shadow-md rounded-md p-2 text-wrap text-center font-mono font-extrabold size-4 text-lg text-blue-800">
                AI-Powered Resume Review & ATS Optimization with CrewAI
                </div>
                <Formik
                    validateOnBlur={false}
                    validateOnChange={false}
                        initialValues={{resumeData: null, campanyName: "", jobUrl: ""}}
                        onSubmit={async (values, { resetForm }) => {
                            onSubmitForm(values)
                            setRescompleted(false);
                        }}
                        validationSchema={formValidationSchema}
                    >
                        {({ setFieldValue, values, submitForm, errors }) => (
                            <Form>
                                <div className="border-gray-700 mx-48 border-2 rounded-lg p-2 mt-10 grid grid-flow-row gap-4">
                                    <div className="flex items-center justify-center">
                                        <Field name="resume">
                                        {({ field }) => (
                                            <>
                                                <div class="flex items-center justify-center w-96">
                                                    <label style={{backgroundColor: "#151b23"}} for="dropzone-file" class="flex flex-col items-center justify-center w-full h-30 border-2 p-2 border-gray-300 border-dashed rounded-lg cursor-pointer  hover:bg-gray-100">
                                                        <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <svg class="h-8 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                                            </svg>
                                                            <p class="mb-2 text-sm text-blue-800 dark:text-blue-800"><span class="font-semibold">Click to upload the Resume</span> or drag and drop</p>
                                                            <p class="text-xs text-blue-800 dark:text-blue-800">PDF Extension Only</p>
                                                        </div>
                                                        <input {...field} id="dropzone-file" type="file" class="hidden" disabled={isDisabled} onChange={(event)=>{
                                                            setFieldValue("resumeData", event.currentTarget.files[0])
                                                        }} />
                                                        {values.resumeData && <p className="border p-2 rounded-md dark:text-gray-400">{values.resumeData.name}</p>}
                                                    </label>
                                                </div>
                                                {/* {errors.resumeData == null && <div>upload Resume Required</div>} */}
                                            </>
                                        )}
                                        </Field>
                                    </div>
                                    <div className="flex items-center justify-center gap-x-2">
                                        <Field name="jobUrl">
                                            {({ field }) => (
                                            <div class="w-96">
                                                {/* <label for="success" class="block text-sm font-medium text-green-700 dark:text-green-500">Job Url</label> */}
                                                <input value={jobUrl} disabled={isDisabled} style={{backgroundColor: "#151b23"}} {...field} type="text" id="success" class="bg-gray-500 border border-gray-500 text-gray-900 dark:text-gray-400 placeholder-gray-700 dark:placeholder-blue-800 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5 dark:border-gray-500" placeholder="Jon Url: https://"/>
                                            </div>
                                            )}
                                        </Field>
                                        <Field name="campanyName">
                                            {({ field }) => (
                                                <>
                                                    <div class="w-96">
                                                        {/* <label for="success" class="block mb-2 text-sm font-medium text-green-700 dark:text-green-500">Company Name</label> */}
                                                        <input value={companyName} disabled={isDisabled} style={{backgroundColor: "#151b23"}} {...field} type="text" id="success" class=" bg-gray-50 border border-gray-500 text-gray-900 dark:text-gray-400 placeholder-gray-700 dark:placeholder-blue-800 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-500" placeholder="Company Name"/>
                                                    </div>
                                                </>
                                            )}
                                        </Field>
                                    </div>
                                    <div className="flex items-center justify-center text-blue-800">
                                        <Button type="submit" disabled={isDisabled} loadingPosition={"center"} className="rounded-lg" sx={{width: "768px", backgroundColor: "#151b23", cursor: "pointer"}} variant="contained" onSubmit={submitForm}>
                                        Submit
                                        </Button>
                                    </div>
                                </div>
                            </Form>)}
                </Formik>

                <hr className="my-10"/>
                {/* <a href={pdf} target="_blank" download={"download.pdf"}> Download</a> */}

                {isDisabled && <div className="text-lg mx-40 border-2 p-5 rounded-lg text-blue-800" style={{backgroundColor: "#151b23"}}>
                    <LinearProgress color="info"/>
                    Fetching Resume analysis report...
                </div>}
                {rescompleted == true && 
                <>
                    <div style={{backgroundColor: "#151b23"}} className="border-4 p-2 rounded-lg text-blue-800 mx-40 flex items-center justify-center font-bold text-xl">
                        Resume Analysis Report
                    </div>
                    <div className="text-white overflow-y-auto mx-40 mt-8 border-4 rounded-lg p-4 text-sm" style={{backgroundColor: "#151b23"}}>
                    <ReactMarkdown
                        children={resFinalMd}
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            return match ? (
                            <SyntaxHighlighter style={dracula} language={match[1]} PreTag="div" {...props}>
                                {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                            ) : (
                            <code className="bg-gray-700 px-1 py-0.5 rounded text-sm">{children}</code>
                            );
                        },
                        }}
                    />
                    </div>

                    <div style={{backgroundColor: "#151b23"}} className="border-4 p-2 rounded-lg text-blue-800 mt-10 mx-40 flex items-center justify-center font-bold text-xl">
                        Refined Resume 
                    </div>
                    <div className="text-white overflow-y-auto mx-40 mt-8 border-4 rounded-lg p-4 text-sm" style={{backgroundColor: "#151b23"}}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{resRefindMd}</ReactMarkdown>
                    </div>
                    <a href={resPdf} download>
                        <button style={{backgroundColor: "#151b23"}} class="fixed bottom-5 right-5 p-3 rounded-full shadow-lg hover:text-white group">
                            <svg xmlns="http://www.w3.org/2000/svg" class="text-blue-800 w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 5v14"></path>
                                <path d="M19 12l-7 7-7-7"></path>
                                <path d="M5 19h14"></path>
                            </svg>
                            <div class="absolute right-14 bottom-1/2 translate-y-1/2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                Refind Resume.pdf 
                                <div class="absolute left-full top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-gray-900"></div>
                            </div>
                        </button>
                    </a>
                </>}
            </div>
        </>
    )
}
