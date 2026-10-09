import os
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE

def add_heading(doc, text, level=1):
    heading = doc.add_heading(text, level=level)
    heading.alignment = WD_ALIGN_PARAGRAPH.CENTER
    return heading

def main():
    doc = Document()
    
    # Customize styles
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(12)

    # ---------------------------------------------------------
    # PAGE 1: TITLE PAGE
    # ---------------------------------------------------------
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run("CAREERSYNC AI - MULTI-FIELD EDITION")
    run.bold = True
    run.font.size = Pt(16)
    
    doc.add_paragraph("\n\n")
    p = doc.add_paragraph("By")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    doc.add_paragraph("\n")
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("HARI PRIYA . V")
    run.bold = True
    
    doc.add_paragraph("\n\n")
    p = doc.add_paragraph("Submitted to the faculty of")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    p = doc.add_paragraph("INFORMATION TECHNOLOGY")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    p = doc.add_paragraph("\nIn partial fulfilment of the requirements for the course")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.runs[0].italic = True
    
    p = doc.add_paragraph("23IT54C– SIMULATION USING MODERN TOOLS")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.runs[0].bold = True
    
    p = doc.add_paragraph("of\nBACHELOR OF TECHNOLOGY\nin\nINFORMATION TECHNOLOGY")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    doc.add_paragraph("\n\nNATIONAL ENGINEERING COLLEGE, KOVILPATTI")
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    doc.add_paragraph("(An Autonomous Institution affiliated to\nAnna University, Chennai)")
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    doc.add_paragraph("\nNOVEMBER 2025")
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_page_break()

    # ---------------------------------------------------------
    # PAGE 2: BONAFIDE CERTIFICATE
    # ---------------------------------------------------------
    p = doc.add_paragraph("NATIONAL ENGINEERING COLLEGE\nK.R.NAGAR, KOVILPATTI - 628503\n")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.runs[0].bold = True

    p = doc.add_paragraph("BONAFIDE CERTIFICATE")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.runs[0].bold = True

    doc.add_paragraph("\n")
    p = doc.add_paragraph("Bonafide record of work done for the course 23IT54C – Simulation Using Modern Tools at the NATIONAL ENGINEERING COLLEGE, K.R. NAGAR, during the academic year 2025 – 2026.")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    
    doc.add_paragraph("\n\n\n\n")
    p = doc.add_paragraph("                                                                 Course Instructor/Guide")
    
    doc.add_paragraph("\n\nSubmitted to the 23IT54C - Simulation Using Modern Tools Viva-voce examination held at National Engineering College, K.R.Nagar, Kovilpatti on ___________")
    
    doc.add_paragraph("\n\nInternal Examiner                                                          Co Examiner")
    doc.add_page_break()

    # ---------------------------------------------------------
    # PAGE 3: ABSTRACT
    # ---------------------------------------------------------
    add_heading(doc, 'ABSTRACT', level=1)
    abs_text = (
        "CareerSync AI (Multi-Field Edition) is a comprehensive, technology-driven digital platform "
        "designed to support job seekers across 29 diverse career fields. With job searching becoming "
        "increasingly competitive, this application leverages sophisticated matching algorithms and natural "
        "language processing to provide users with an accessible, highly personalized career management system. "
        "At its core, the platform allows users to maintain multi-field profiles, offering targeted skills, "
        "experiences, and preferences for distinct professions. The application features a dynamic resume builder "
        "capable of generating unlimited ATS-friendly resumes using 17 tailored templates with live previews and "
        "PDF export capabilities. "
        "\n\nBeyond resume generation, the app integrates a powerful job tracking and matching system that interfaces "
        "with external APIs like Adzuna and Remotive. It scores job matches based on a weighted mathematical model "
        "that considers skills, job title, field, experience, location, and education. The system extends its capabilities "
        "with a Skill Gap Analysis module to guide continuous learning. Technologically, the platform is powered by a "
        "React.js frontend (Vite) for a responsive, modern UI, a Node.js/Express backend for robust API handling, and a "
        "MongoDB database (via Mongoose) to ensure efficient data persistence. By combining multi-field adaptability, "
        "intelligent scoring algorithms, and an intuitive design, CareerSync AI empowers users to take control of their "
        "career trajectories in a scalable, efficient manner."
    )
    p = doc.add_paragraph(abs_text)
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    doc.add_page_break()

    # ---------------------------------------------------------
    # PAGE 4: TABLE OF CONTENTS (Mocked)
    # ---------------------------------------------------------
    add_heading(doc, 'TABLE OF CONTENTS', level=1)
    toc = [
        "1 INTRODUCTION",
        "  1.1 INTRODUCTION",
        "  1.2 PROBLEM STATEMENT",
        "  1.3 OBJECTIVES",
        "2 CAREERSYNC AI APP",
        "  2.1 TECHNOLOGY/ALGORITHM",
        "  2.2 MODULE’S DESCRIPTION",
        "  2.3 SYSTEM REQUIREMENTS",
        "3 APP DIAGRAMS",
        "  3.1 WORK FLOW DIAGRAM",
        "4 MATHEMATICAL MODEL",
        "  4.1 EQUATIONS AND DERIVATIONS",
        "5 SIMULATION AND EXECUTION OF MODEL",
        "  5.1 APPLICATION OF MODELLING TECHNIQUES",
        "  5.2 USE OF MODERN TOOLS/SOFTWARE",
        "  5.3 EXECUTION OF MODEL",
        "  5.4 IMPLEMENTATION RESULTS",
        "6 INTERPRETATIONS OF RESULT",
        "  6.1 RESULT AND DISCUSSION",
        "7 REFERENCES"
    ]
    for line in toc:
        doc.add_paragraph(line)
    doc.add_page_break()

    # ---------------------------------------------------------
    # CHAPTER 1
    # ---------------------------------------------------------
    add_heading(doc, 'CHAPTER 1\nINTRODUCTION', level=1)
    
    doc.add_heading('1.1 INTRODUCTION', level=2)
    p = doc.add_paragraph(
        "Job hunting in the modern era can be fragmented and highly specific to individual fields. "
        "CareerSync AI addresses these challenges by integrating an intelligent job matching engine into a "
        "user-friendly web application. The platform serves as a personalized career companion capable of "
        "managing multiple career paths simultaneously, generating targeted resumes, and scoring job opportunities based on user inputs.\n"
        "The application encompasses a suite of features tailored to holistic career management:\n"
        "• Multi-Field Profiles: Users can manage distinct profiles for up to 29 different fields.\n"
        "• Resume Builder: 17 ATS-friendly templates with live preview and PDF export.\n"
        "• Job Matching & Tracker: Fetches live jobs from Adzuna/Remotive and scores matches.\n"
        "• Skill Gap Analysis: Recommends missing skills based on target roles."
    )
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    
    doc.add_heading('1.2 PROBLEM STATEMENT', level=2)
    p = doc.add_paragraph(
        "Traditional job search platforms often restrict users to a single generic profile, failing to accommodate individuals "
        "transitioning between careers or holding multidisciplinary skills. Furthermore, formatting resumes for Applicant Tracking Systems (ATS) "
        "is a tedious process, and manually determining how well one matches a job description is subjective and error-prone.\n"
        "CareerSync AI addresses:\n"
        "• Lack of Flexibility: By offering multi-field profiles.\n"
        "• Resume Formatting: Automating ATS-friendly PDF generation.\n"
        "• Subjective Matching: Introducing a deterministic algorithmic job-match scoring system."
    )
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    doc.add_heading('1.3 OBJECTIVES', level=2)
    p = doc.add_paragraph(
        "1. Develop a Multi-Field Career Hub: Allow users to track distinct skills and experiences.\n"
        "2. Implement Comprehensive Resume Generation: 17 customizable templates.\n"
        "3. Facilitate Intelligent Job Matching: Calculate match percentages using weighted mathematical models.\n"
        "4. Ensure Data Privacy: Implement secure Google OAuth and JWT authentication.\n"
        "5. Promote Engagement: Intuitive React.js frontend with dark mode and smooth animations."
    )
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    doc.add_page_break()

    # ---------------------------------------------------------
    # CHAPTER 2
    # ---------------------------------------------------------
    add_heading(doc, 'CHAPTER 2\nCAREERSYNC AI APP', level=1)
    
    doc.add_heading('2.1 TECHNOLOGY/ALGORITHM', level=2)
    doc.add_paragraph("Frontend: React.js (Vite), React Router, Google OAuth\nBackend: Node.js, Express.js\nDatabase: MongoDB with Mongoose\nJob Sources: Adzuna API, Remotive API")

    doc.add_heading('2.2 MODULE’S DESCRIPTION', level=2)
    doc.add_paragraph("2.2.1 AUTHENTICATION MODULE\nHandles user registration via email/password (bcryptjs) and Google OAuth, utilizing JWT for session management.")
    doc.add_paragraph("2.2.2 PROFILE MODULE\nAllows users to select multiple career fields and maintain independent sets of skills, education, and target roles for each field.")
    doc.add_paragraph("2.2.3 RESUME BUILDER MODULE\nGenerates limitless tailored resumes using 17 templates, enabling section reordering, real-time preview, and PDF export.")
    doc.add_paragraph("2.2.4 JOB MATCHING MODULE\nFetches remote and local jobs, applying an algorithmic scoring model to evaluate the match percentage between a user's profile and the job description.")
    
    doc.add_heading('2.3 SYSTEM REQUIREMENTS', level=2)
    doc.add_paragraph("Software: Node.js v18+, MongoDB locally or Atlas cluster, Modern Web Browser.\nHardware: Minimum 4GB RAM, 2-core CPU.")
    doc.add_page_break()

    # ---------------------------------------------------------
    # CHAPTER 3
    # ---------------------------------------------------------
    add_heading(doc, 'CHAPTER 3\nAPP DIAGRAMS', level=1)
    doc.add_heading('3.1 WORK FLOW DIAGRAM', level=2)
    doc.add_paragraph("[A workflow diagram goes here representing: User Auth -> Profile Setup -> Select Fields -> Build Resumes -> Search & Match Jobs -> Track Applications]")
    doc.add_page_break()

    # ---------------------------------------------------------
    # CHAPTER 4
    # ---------------------------------------------------------
    add_heading(doc, 'CHAPTER 4\nMATHEMATICAL MODEL', level=1)
    
    doc.add_heading('4.1 EQUATIONS AND DERIVATIONS', level=2)
    
    doc.add_heading('4.1.1 JOB MATCH SCORING MODEL', level=3)
    p = doc.add_paragraph(
        "CareerSync AI computes a personalized match score (0-100%) for each job based on a weighted sum model. "
        "The model evaluates six distinct components: Skills, Title, Field, Experience, Location, and Education."
    )
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    doc.add_paragraph("S_match = ( Σ (P_k * W_k) ) / ( Σ W_k ) * 100")
    
    doc.add_paragraph(
        "Where:\n"
        "• k ∈ {skills, title, field, experience, location, education}\n"
        "• P_k is the calculated part score for component k (0 ≤ P_k ≤ 1).\n"
        "• W_k is the static weight assigned to component k."
    )
    
    doc.add_paragraph(
        "Weights (W_k):\n"
        "W_skills = 0.40\n"
        "W_title = 0.20\n"
        "W_field = 0.15\n"
        "W_experience = 0.10\n"
        "W_location = 0.10\n"
        "W_education = 0.05"
    )

    p = doc.add_paragraph(
        "Component Derivations:\n"
        "1. Skills Score (P_skills):\n"
        "   P_skills = |Matched Skills| / |Required Skills|\n"
        "   Calculated using set intersection of user's skills and job's extracted skills.\n\n"
        "2. Title Score (P_title):\n"
        "   P_title = max( Token_Overlap(target_role, job_title) )\n"
        "   If the job title contains the target role string entirely, P_title = 1. Otherwise, it is the ratio of matching tokens.\n\n"
        "3. Experience Score (P_experience):\n"
        "   P_experience = min(1, User_Years / Job_Minimum_Years)\n"
    )
    
    doc.add_heading('4.1.2 TEXT TOKENIZATION AND JACCARD SIMILARITY', level=3)
    p = doc.add_paragraph(
        "To accurately compare job titles and candidate roles, a token-based overlap similarity (derived from the Jaccard similarity coefficient) is applied. "
        "Stop words (e.g., 'and', 'the', 'senior', 'junior') are removed, and stemming is applied to handle suffixes."
    )
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    
    doc.add_paragraph("J(T_job, T_role) = |T_job ∩ T_role| / |T_role|")
    doc.add_paragraph(
        "Where:\n"
        "• T_job represents the set of tokens in the job title.\n"
        "• T_role represents the set of tokens in the user's target role.\n"
        "• The denominator normalizes the overlap by the candidate's target role length."
    )
    
    doc.add_heading('4.1.3 PROFILE COMPLETION SCORE', level=3)
    p = doc.add_paragraph(
        "To gamify onboarding and ensure sufficient data for job matching, the profile completion percentage is mathematically derived as a discrete uniform distribution of completed checks."
    )
    doc.add_paragraph("C_percent = ( Σ I_c ) / N_total * 100")
    doc.add_paragraph(
        "Where I_c is an indicator variable (0 or 1) for each criteria:\n"
        "• Name is set\n"
        "• Phone is set\n"
        "• Location is set\n"
        "• Career fields > 0\n"
        "• Skills count ≥ 3\n"
        "• Experience or education exists\n"
        "• Target roles specified\n"
        "N_total is the total number of validation criteria (N_total = 8)."
    )
    doc.add_page_break()

    # ---------------------------------------------------------
    # CHAPTER 5
    # ---------------------------------------------------------
    add_heading(doc, 'CHAPTER 5\nSIMULATION AND EXECUTION OF MODEL', level=1)
    
    doc.add_heading('5.1 APPLICATION OF MODELLING TECHNIQUES', level=2)
    doc.add_paragraph(
        "• Weighted Match Scoring: Executed dynamically on the backend to rank fetched jobs.\n"
        "• Tokenization Analysis: NLP techniques for filtering stop-words from job titles to improve the accuracy of P_title calculations."
    )
    
    doc.add_heading('5.2 USE OF MODERN TOOLS/SOFTWARE', level=2)
    doc.add_paragraph("• Frontend: React.js (Vite)\n• Backend: Node.js, Express.js\n• DB: MongoDB / Mongoose\n• Testing & Formatting: Nodemon, Prettier")
    
    doc.add_heading('5.3 EXECUTION OF MODEL', level=2)
    doc.add_paragraph(
        "The model execution begins when a user navigates to the 'Jobs' dashboard. The backend pulls unstructured job listings from Adzuna. "
        "The server then executes the matcher logic on-the-fly, calculating the S_match for every job against the user's selected career fields, returning an ordered JSON payload."
    )
    doc.add_page_break()

    # ---------------------------------------------------------
    # CHAPTER 6
    # ---------------------------------------------------------
    add_heading(doc, 'CHAPTER 6\nINTERPRETATIONS OF RESULT', level=1)
    
    doc.add_heading('6.1 RESULT AND DISCUSSION', level=2)
    doc.add_paragraph(
        "The integration of the multi-field architecture combined with the mathematical matching model successfully addresses the needs of modern, diverse job seekers. "
        "By quantifying job alignment using explicit weights, users receive a transparent, explainable match score rather than a 'black box' AI guess. "
        "The profile completion model actively encourages users to input data required by the matching algorithm, creating a positive feedback loop of better data leading to better job recommendations."
    )
    doc.add_page_break()

    # ---------------------------------------------------------
    # CHAPTER 7
    # ---------------------------------------------------------
    add_heading(doc, 'REFERENCES', level=1)
    doc.add_paragraph("[1] React Documentation, 2024. [Online]. Available: https://react.dev/")
    doc.add_paragraph("[2] Node.js Foundation, 2024. [Online]. Available: https://nodejs.org/")
    doc.add_paragraph("[3] MongoDB Documentation, 2024. [Online]. Available: https://www.mongodb.com/")
    doc.add_paragraph("[4] Adzuna Developer API. [Online]. Available: https://developer.adzuna.com/")

    # Save
    report_path = r'C:\Users\HARI PRIYA . V\Desktop\MWT\CareerSyncApplication\CareerSync_Application\CareerSync_Report.docx'
    doc.save(report_path)
    print("Report saved at:", report_path)

if __name__ == '__main__':
    main()
