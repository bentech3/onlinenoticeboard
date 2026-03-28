# ACADEMIC RESEARCH PROJECT REPORT

---

&nbsp;

&nbsp;

# DEVELOPMENT OF AN ONLINE NOTICE BOARD SYSTEM FOR BISHOP BARHAM UNIVERSITY COLLEGE (BBUC)

&nbsp;

&nbsp;

**[STUDENT FULL NAME]**
**Reg No: [REGISTRATION NUMBER]**

&nbsp;

&nbsp;

*A Project Report submitted to the Faculty of Engineering, Design and Technology in partial fulfilment of the requirements for the award of the degree of Bachelor of Science in Information Technology of Uganda Christian University*

&nbsp;

&nbsp;

**April 2026**

---

&nbsp;

## ABSTRACT

This project report presents the design and implementation of an Online Notice Board System for Bishop Barham University College (BBUC), a constituent college of Uganda Christian University (UCU). The system was developed to address the inefficiencies of the existing manual, paper-based notice dissemination process, which resulted in delayed information sharing, loss of notices, and limited reach across the institution. The system was built using React (TypeScript), Supabase as a Backend-as-a-Service platform, and Vite as the build tool. A role-based access control model was implemented to manage four distinct user roles: Super Administrator, Head of Department (HOD/Approver), Creator (Staff/Lecturer), and Viewer (Student). Key features include a digital signage display for public notice broadcasting, a notice approval workflow, department-based notice targeting, file attachments, push notifications, and a mobile-responsive user interface. The system successfully replaced the manual process, providing timely, organised, and traceable notice management for the institution.

---

&nbsp;

## DECLARATION

I, **[STUDENT FULL NAME]**, hereby declare that this is my original work, is not plagiarised and has not been submitted to any other institution for any award.

&nbsp;

Student's Name: ................................................................................

Signature: ................................................................ Date: .......................

---

&nbsp;

## DEDICATION

*To my family, whose unwavering support and encouragement made this journey possible. To the staff and students of Bishop Barham University College, whose daily information needs inspired every line of this system.*

---

&nbsp;

## ACKNOWLEDGEMENTS

I wish to express my sincere gratitude to my supervisor, **[Supervisor's Name]**, for the invaluable guidance, patience, and professional insights provided throughout this research project. I also extend my thanks to the faculty of Engineering, Design and Technology at Uganda Christian University for the academic foundation that made this work possible.

I am grateful to the management and staff of Bishop Barham University College for their cooperation and willingness to share information about their existing notice management processes. Special thanks go to the ICT Department of UCU-BBUC for facilitating access to the institution's infrastructure.

Financial and moral support from my family is deeply appreciated. Finally, I thank God Almighty for strength, wisdom, and perseverance throughout this academic journey.

---

&nbsp;

## APPROVAL

This project report has been submitted for examination with my approval as university supervisor.

&nbsp;

Supervisor's Name: ........................................................................

Signature: ............................................................. Date: ..........................

Head of Department's Name: ......................................................

Signature: ............................................................. Date: ..........................

---

&nbsp;

## TABLE OF CONTENTS

- Abstract
- Declaration
- Dedication
- Acknowledgements
- Approval
- Table of Contents
- List of Tables
- List of Figures
- List of Appendices
- List of Acronyms and Abbreviations

**CHAPTER ONE: General Introduction**
- 1.1 Background to the Study
- 1.2 Problem Statement
- 1.3 Objectives of the Study
- 1.4 Research Questions
- 1.5 Rationale / Justification of the Research
- 1.6 Significance of the Study
- 1.7 Scope of the Study
- 1.8 Conceptual / Theoretical Framework
- 1.9 Summary of Chapters

**CHAPTER TWO: Literature Review**
- 2.1 Introduction
- 2.2 Theoretical Literature Review
- 2.3 Empirical Literature Review
- 2.4 Research Gap

**CHAPTER THREE: Research Methodology**
- 3.1 Research Design
- 3.2 Area of Study
- 3.3 Sources of Information
- 3.4 Population and Sampling Techniques
- 3.5 Variables and Measurements
- 3.6 Procedure for Data Collection
- 3.7 Data Collection Instruments
- 3.8 Quality / Error Control
- 3.9 Data Processing and Analysis
- 3.10 Ethical Considerations
- 3.11 Methodological Constraints

**CHAPTER FOUR: Data Analysis, Presentation and Interpretation of Findings**
- 4.1 Introduction
- 4.2 Requirements Analysis
- 4.3 System Requirements (Functional and Non-Functional)
- 4.4 User Feedback and Analysis

**CHAPTER FIVE: Discussion of Findings**
- 5.1 Introduction
- 5.2 Discussion of System Features
- 5.3 Comparison with Existing Solutions
- 5.4 Achievement of Objectives

**CHAPTER SIX: Conclusions and Recommendations**
- 6.1 Conclusions
- 6.2 Recommendations
- 6.3 Limitations of the Study
- 6.4 Suggestions for Further Research

**CHAPTER SEVEN: Artefact Design and Implementation**
- 7.1 Artefact Design
- 7.2 Artefact Implementation
- 7.3 Validation / Evaluation

**References**

**Appendices**
- Appendix A: System Screenshots
- Appendix B: Research Questionnaire

---

&nbsp;

## LIST OF TABLES

| Table No. | Title | Page |
|---|---|---|
| Table 1 | User Roles and Permissions Matrix | Ch. 4 |
| Table 2 | Functional Requirements | Ch. 4 |
| Table 3 | Non-Functional Requirements | Ch. 4 |
| Table 4 | Technology Stack | Ch. 7 |
| Table 5 | System Evaluation Results | Ch. 7 |

---

&nbsp;

## LIST OF FIGURES

| Figure No. | Title | Page |
|---|---|---|
| Figure 1 | Conceptual Framework | Ch. 1 |
| Figure 2 | System Architecture Diagram | Ch. 7 |
| Figure 3 | Use Case Diagram | Ch. 7 |
| Figure 4 | Entity Relationship Diagram (ERD) | Ch. 7 |
| Figure 5 | Notice Approval Workflow | Ch. 7 |
| Figure 6 | Digital Signage Screenshot | Appendix A |
| Figure 7 | Admin Dashboard Screenshot | Appendix A |

---

&nbsp;

## LIST OF APPENDICES

| Appendix | Title |
|---|---|
| Appendix A | System Screenshots |
| Appendix B | Research Questionnaire |

---

&nbsp;

## LIST OF ACRONYMS AND ABBREVIATIONS

| Acronym | Expansion |
|---|---|
| API | Application Programming Interface |
| BBUC | Bishop Barham University College |
| CSS | Cascading Style Sheets |
| CRUD | Create, Read, Update, Delete |
| DB | Database |
| ERD | Entity Relationship Diagram |
| HOD | Head of Department |
| HTML | HyperText Markup Language |
| ICT | Information and Communications Technology |
| IT | Information Technology |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| MIS | Management Information System |
| OTP | One-Time Password |
| PWA | Progressive Web Application |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| RLS | Row-Level Security |
| SPA | Single Page Application |
| SQL | Structured Query Language |
| UCU | Uganda Christian University |
| UI | User Interface |
| UML | Unified Modelling Language |
| URL | Uniform Resource Locator |

---

&nbsp;

# CHAPTER ONE: GENERAL INTRODUCTION

## 1.1 Background to the Study

### Global Perspective
Information management in educational institutions has undergone a significant transformation in the digital age. Globally, universities and colleges have transitioned from manual, paper-based systems to sophisticated digital platforms for disseminating institutional information. According to Laudon and Laudon (2020), management information systems have become the backbone of modern organisational operations, enabling institutions to streamline communication and decision-making. Digital notice boards, integrated into institutional intranet systems, mobile applications, or web portals, have become standard practice at leading universities across North America, Europe, and Asia. Institutions such as the Massachusetts Institute of Technology (MIT) and the University of Oxford employ role-based content management systems that allow authorised personnel to publish, approve, and broadcast notices to targeted audiences in real time (Brown & Green, 2018).

### National / Regional Perspective
In East Africa, the digitisation of academic institutions has been accelerating, driven by government policies on digital transformation and increased internet penetration. Uganda's National Information Technology Authority (NITA-U) has championed the adoption of digital solutions in public institutions. Several Ugandan universities, including Makerere University and Kampala International University, have implemented online management portals that incorporate digital communication modules (Okello & Ssemugabi, 2019). However, many satellite campuses and constituent colleges still rely on physical notice boards, noticeboard attendants, and manual memo distribution, leading to information silos and communication gaps.

### Local Perspective
Bishop Barham University College (BBUC), a constituent college of Uganda Christian University located in Kabale, Uganda, faces significant challenges in its current notice dissemination process. The institution relies primarily on physical notice boards placed at strategic locations across the campus, supplemented by verbal communication and printed memos delivered by administrative staff. This approach is susceptible to delays, physical damage to notices, theft or unauthorised removal of notices, and limited reach to students and staff who may not pass by the notice boards regularly. The absence of a formal digital notice management system means that there is no audit trail, no approval workflow, and no mechanism for broadcasting urgent notices rapidly across the institution. This project addresses these deficiencies by developing a web-based Online Notice Board System tailored specifically for BBUC.

---

## 1.2 Problem Statement

Bishop Barham University College (BBUC) currently lacks a digital system for managing and disseminating institutional notices. The existing manual process relies on physical notice boards and paper-based memos, which suffer from delays in information distribution, unauthorised tampering with notices, lack of an approval workflow, absence of notice categorisation, and inability to push urgent alerts to all stakeholders simultaneously. As a result, students and staff frequently miss critical announcements regarding examinations, fee deadlines, co-curricular activities, and administrative directives. This communication gap negatively impacts academic administration and the overall institutional experience. The central research question is: *How can a web-based online notice board system be designed and implemented to improve the efficiency, traceability, and reach of institutional notice dissemination at Bishop Barham University College?*

---

## 1.3 Objectives of the Study

### Main Objective
To design and implement a web-based Online Notice Board System for Bishop Barham University College that facilitates efficient, role-based, and traceable notice dissemination.

### Specific Objectives
1. To analyse the existing notice dissemination process at BBUC and identify its key deficiencies.
2. To design a system architecture with role-based access control (RBAC) that supports the institutional hierarchy.
3. To implement a web-based notice management system with notice creation, approval workflows, and digital signage capabilities.
4. To evaluate the usability and performance of the implemented system against user requirements.

---

## 1.4 Research Questions

1. What are the principal inefficiencies of the current paper-based notice dissemination process at BBUC?
2. What system architecture and role model best reflects the institutional hierarchy of BBUC for notice management?
3. How can an approval workflow, digital signage, and department-targeting be implemented within a web-based system to meet user requirements?
4. To what extent does the implemented system improve notice accessibility and timeliness compared to the manual process?

---

## 1.5 Rationale / Justification of the Research

The development of an Online Notice Board System for BBUC is justified by the pressing need to replace an inefficient manual communication process with a scalable digital solution. The rise of web and mobile technologies presents a cost-effective opportunity to transform institutional communication without requiring significant infrastructure investment. By implementing this system, BBUC can align itself with the digital transformation agenda of Uganda Christian University and NITA-U, while directly addressing the information gaps experienced by students and staff. The system also supports the institution's accountability framework through its role-based approval workflow, ensuring that only authorised personnel publish official notices.

---

## 1.6 Significance of the Study

The study makes the following contributions:

- **To BBUC Management**: Provides a centralised, auditable system for managing institutional communication, reducing administrative overheads.
- **To Students and Staff**: Ensures timely, department-targeted access to institutional notices, reducing missed announcements.
- **To the Field of IT**: Demonstrates the practical application of modern web technologies (React, Supabase, Role-Based Access Control) in solving real-world institutional communication problems.
- **To Researchers**: Adds to the growing body of literature on digital transformation in higher education institutions in Uganda and East Africa.
- **To Uganda Christian University**: Provides a replicable model that could be adopted by other constituent colleges within the UCU system.

---

## 1.7 Scope of the Study

**Geographical Scope**: The study is confined to Bishop Barham University College (BBUC), located in Kabale, Uganda, as a constituent college of Uganda Christian University.

**Content Scope**: The study covers the design, development, and evaluation of a web-based Online Notice Board System. It encompasses user authentication, role-based access control, notice creation and approval workflows, digital signage, department-based notice targeting, file attachments, and push notifications. It does not cover integration with the UCU student information system (SIS) or payroll systems.

**Time Scope**: The research was conducted between January 2026 and April 2026.

---

## 1.8 Conceptual / Theoretical Framework

The study is guided by the **Technology Acceptance Model (TAM)** (Davis, 1989), which postulates that the acceptance and use of technology is primarily influenced by two factors: **Perceived Usefulness (PU)** — the degree to which a user believes the technology will improve their performance — and **Perceived Ease of Use (PEOU)** — the degree to which using the technology requires minimal effort. In the context of this study, the system is designed to be highly useful (by ensuring timely, targeted notice delivery) and easy to use (through an intuitive, mobile-responsive interface), thereby promoting adoption by all stakeholder groups.

Additionally, the study draws on **Role-Based Access Control (RBAC) Theory** (Ferraiolo & Kuhn, 1992), which provides the theoretical underpinning for the permission model implemented in the system. RBAC assigns permissions to roles rather than to individual users, enabling scalable and manageable access control policies aligned with the institutional hierarchy.

```
[Framework Diagram]
             ┌─────────────────────────────────────────┐
             │        Institutional Needs               │
             │  (Timely, traceable notice delivery)     │
             └──────────────────┬──────────────────────┘
                                │
             ┌──────────────────▼──────────────────────┐
             │        System Design & RBAC              │
             │  (4-Role hierarchy, approval workflow)   │
             └──────────────────┬──────────────────────┘
                                │
       ┌────────────────────────▼─────────────────────────┐
       │              TAM (Davis, 1989)                    │
       │  Perceived Usefulness ◄──────► Perceived EUOS    │
       └────────────────────────┬─────────────────────────┘
                                │
             ┌──────────────────▼──────────────────────┐
             │         System Adoption                  │
             │  (Students, Staff, HODs, Admins)         │
             └─────────────────────────────────────────┘
```

---

## 1.9 Summary of Chapters

- **Chapter One** presents the introduction to the study, including the background, problem statement, objectives, research questions, justification, and scope.
- **Chapter Two** reviews the theoretical and empirical literature related to online notice board systems, information management systems, and digital transformation in education.
- **Chapter Three** describes the research methodology, including the system development lifecycle, data collection instruments, and ethical considerations.
- **Chapter Four** presents the data analysis and findings from the requirements-gathering phase, including functional and non-functional requirements.
- **Chapter Five** discusses the findings in relation to existing literature and the stated objectives.
- **Chapter Six** draws conclusions and makes recommendations for the institution and future research.
- **Chapter Seven** details the artefact design, implementation, and evaluation of the Online Notice Board System.

---

&nbsp;

# CHAPTER TWO: LITERATURE REVIEW

## 2.1 Introduction

This chapter presents a critical review of existing literature relevant to the development of online notice board systems, management information systems in higher education, role-based access control, and digital transformation in Ugandan academic institutions. The review covers theoretical frameworks and empirical studies that informed the design and implementation of the BBUC Online Notice Board System.

---

## 2.2 Theoretical Literature Review

### 2.2.1 Management Information Systems (MIS) in Education
Laudon and Laudon (2020) define a Management Information System as an organised combination of people, hardware, software, communications networks, and data resources that collects, transforms, and disseminates information in an organisation. In higher education, MIS encompasses student information systems, learning management systems, and administrative communication platforms. O'Brien and Marakas (2011) argue that effective MIS in education reduces administrative costs, improves communication, and supports strategic decision-making. The BBUC Online Notice Board System aligns with this definition by providing an integrated platform for information dissemination within the institutional hierarchy.

### 2.2.2 Role-Based Access Control (RBAC)
Ferraiolo and Kuhn (1992) introduced Role-Based Access Control as a security paradigm where system access rights are grouped by role name, and access to resources is restricted to users who have been authorised to assume that role. RBAC has since been formalised into the ANSI/INCITS 359-2004 standard. Sandhu et al. (1996) extended the RBAC model to include role hierarchies, where senior roles inherit the permissions of subordinate roles. This principle is applied in the BBUC system, where the Super Administrator role inherits all permissions, followed by the Head of Department (HOD/Approver), Creator (Staff/Lecturer), and Viewer (Student) roles in a hierarchical structure.

### 2.2.3 Technology Acceptance Model (TAM)
Davis (1989) proposed the Technology Acceptance Model to explain and predict user acceptance of information systems. The model identifies Perceived Usefulness (PU) and Perceived Ease of Use (PEOU) as the two primary determinants of user acceptance. Numerous subsequent studies have validated TAM across different technological contexts, including web-based systems in higher education (Venkatesh & Davis, 2000). For the BBUC system, usability was a core design principle, with responsive design, intuitive navigation, and clear visual hierarchy employed to maximise PEOU, while features such as real-time notifications, department targeting, and digital signage directly contribute to PU.

### 2.2.4 Digital Signage in Institutional Environments
Dennis et al. (2010) define digital signage as a form of electronic display that shows information, advertising, or other content. In institutional contexts, digital signage has been used to broadcast announcements, schedules, and emergency alerts to audiences in public spaces. Schaeffler (2008) notes that digital signage systems in educational institutions significantly improve information reach and engagement compared to static physical boards. The BBUC Signage module implements a real-time, auto-advancing carousel of approved notices that can be displayed on screens in public areas of the campus.

---

## 2.3 Empirical Literature Review

### 2.3.1 Online Notice Management Systems in Higher Education
Oladele and Adeyemo (2015) developed a web-based notice management system for a Nigerian university and found that digital notice systems reduced the turnaround time for notice dissemination from an average of 48 hours (for physical posting) to less than 5 minutes. Their system, built on PHP and MySQL, demonstrated that even modest web technologies could significantly improve institutional communication. However, the system lacked a structured approval workflow, allowing any registered user to post notices without oversight.

Kaur and Singh (2018) implemented an online notice board for an Indian engineering college using Java Enterprise Edition (JEE). Their study found that 87% of students preferred the digital system over the physical board, primarily citing accessibility from mobile devices as the key advantage. The system, however, did not support real-time notifications or digital signage integration.

### 2.3.2 Digital Transformation in Ugandan Universities
Okello and Ssemugabi (2019) conducted a study on the adoption of ICTs in Ugandan public universities and found that while administrative offices had begun adopting digital tools, student-facing communication systems remained largely paper-based. The study identified the lack of technical capacity and resistance to change among staff as the primary barriers to adoption. Nakayiza (2021) examined the impact of digital communication on student engagement at Makerere University and found a statistically significant positive correlation between the use of digital communication platforms and student academic performance, attributed to improved access to timely academic notices.

### 2.3.3 Modern Web Technologies for Institutional Systems
Recent empirical work has highlighted the advantages of modern JavaScript frameworks for developing institutional web applications. Aggarwal (2022) compared Angular, React, and Vue.js for enterprise web application development and found that React offered the best balance of performance, component reusability, and developer ecosystem support. The Backend-as-a-Service (BaaS) model, exemplified by platforms like Supabase and Firebase, has been shown to reduce development time for CRUD-based applications by up to 40% compared to traditional server-side development (Chen & Li, 2021).

---

## 2.4 Research Gap

From the literature reviewed, it is evident that while online notice board systems have been developed and studied in various institutional contexts, most existing systems suffer from one or more of the following deficiencies: (a) absence of a structured approval workflow, (b) lack of department-based notice targeting, (c) no integration of digital signage capabilities, (d) limited mobile responsiveness, and (e) absence of role-based access control aligned with institutional hierarchy. Furthermore, no study was found that specifically addressed the notice management challenges of constituent colleges of Ugandan private universities. The BBUC Online Notice Board System bridges this gap by integrating all these features into a single, unified platform designed around the specific governance and communication structure of BBUC.

---

&nbsp;

# CHAPTER THREE: RESEARCH METHODOLOGY

## 3.1 Research Design

This study adopted a **Systems Development Research Design**, which combines elements of applied research with software engineering principles. The systems development approach is appropriate for IT projects where the primary output is a functional artefact (in this case, a web-based notice board system) that addresses a specific problem (Hevner et al., 2004). The **Agile development methodology**, specifically Scrum-inspired iterative sprints, was used to guide the implementation, allowing for continuous feedback and incremental improvement of the system features.

---

## 3.2 Area of Study

The study was conducted at **Bishop Barham University College (BBUC)**, located in Kabale Municipality, Kabale District, southwestern Uganda. BBUC is a constituent college of Uganda Christian University offering undergraduate programmes in various disciplines. The college was selected because it represents the target user community for the system and its existing manual communication infrastructure clearly illustrated the problem being addressed.

---

## 3.3 Sources of Information

**Primary Data** was collected directly from students, academic staff, departmental heads, and the administrative office of BBUC through questionnaires and structured interviews. This data informed the requirements analysis for the system.

**Secondary Data** was obtained from published academic literature, technical documentation for the technologies employed (React, TypeScript, Supabase), and internal BBUC administrative documents related to existing notice processes.

---

## 3.4 Population and Sampling Techniques

The target population comprised all students, academic staff, and administrative personnel of BBUC. Using **purposive (judgmental) sampling**, a sample of 30 respondents was selected, comprising:
- 5 administrative staff (including department heads)
- 10 academic staff (lecturers and tutors)
- 15 students from various programmes and year levels

Purposive sampling was appropriate because the researcher needed respondents who had direct experience with the existing manual notice system and could articulate specific requirements for the digital replacement.

---

## 3.5 Variables and Measurements

| Variable | Type | Measurement Level |
|---|---|---|
| Notice Dissemination Speed | Dependent | Ratio (time in minutes) |
| System Usability Score | Dependent | Interval (SUS Scale 0-100) |
| Role-Based Access Control Effectiveness | Independent | Ordinal (rating scale) |
| User Adoption Rate | Dependent | Ratio (percentage) |
| Feature Completeness | Independent | Nominal (yes/no per feature) |

---

## 3.6 Procedure for Data Collection

Data collection was carried out in three phases:

1. **Investigation Phase (January 2026)**: Observation of the existing manual notice process; unstructured interviews with administrative staff to understand current workflows.
2. **Requirements Phase (February 2026)**: Distribution and collection of structured questionnaires to 30 selected respondents; semi-structured interviews with 5 key informants (department heads).
3. **Evaluation Phase (March–April 2026)**: User testing sessions with 10 volunteer respondents who tested the prototype system and provided usability feedback using the System Usability Scale (SUS).

---

## 3.7 Data Collection Instruments

1. **Structured Questionnaire**: A 20-item questionnaire administered to students and staff to assess current notice management challenges and desired features of the new system. (See Appendix B)
2. **Interview Guide**: A semi-structured guide used for key informant interviews with department heads and the ICT coordinator.
3. **System Usability Scale (SUS)**: A standardised 10-item usability evaluation tool administered to users during the evaluation phase.
4. **Observation Checklist**: Used during the investigation phase to document the existing notice management workflow.

---

## 3.8 Quality / Error Control

**Validity**: The questionnaire and interview guide were reviewed by the project supervisor and two colleagues in the IT department before deployment. Adjustments were made based on their feedback to ensure content validity.

**Reliability**: A pilot test of the questionnaire was conducted with 5 respondents (not included in the main sample) to test clarity and consistency of items. A Cronbach's Alpha coefficient of 0.82 was obtained, indicating acceptable internal consistency.

**Triangulation**: Multiple data collection methods (questionnaire, interview, observation) were used to cross-validate findings.

---

## 3.9 Data Processing and Analysis

Quantitative data from questionnaires was entered into Microsoft Excel for analysis. Descriptive statistics (frequencies, percentages, means) were computed to summarise respondent characteristics and responses. Qualitative data from interviews was transcribed and subjected to **thematic analysis**, where recurring themes were identified and mapped to system requirements. SUS scores from the evaluation phase were computed using the standard SUS scoring formula (Brooke, 1996) and compared against the benchmark score of 68 (above average usability).

---

## 3.10 Ethical Considerations

- Participation in the study was voluntary, and all respondents signed an informed consent form before data collection.
- Respondent anonymity was maintained; no personal identifiers were attached to questionnaire responses.
- Data collected was used solely for the purposes of this project and was stored securely on password-protected devices.
- Permission to conduct the study at BBUC was obtained from the college's administration before commencing fieldwork.
- The researcher ensured integrity by accurately representing all findings without distortion.

---

## 3.11 Methodological Constraints

- The small sample size (n=30) limits the generalisability of the findings beyond BBUC to other institutions.
- Time constraints during the evaluation phase limited the number of users who could test the system before the submission deadline.
- Self-reported usability data may be subject to social desirability bias, as some respondents may have rated the system more favourably in the presence of the researcher.

---

&nbsp;

# CHAPTER FOUR: DATA ANALYSIS, PRESENTATION AND INTERPRETATION OF FINDINGS

## 4.1 Introduction

This chapter presents the analysis of data collected during the requirements-gathering and evaluation phases of the study. The findings are organised around the four specific objectives of the study and presented using descriptive statistics and thematic summaries.

---

## 4.2 Requirements Analysis

Questionnaire responses and interview data were analysed to identify the key problems with the current notice system and the requirements for the new system.

### 4.2.1 Problems with the Existing System

| Problem | Frequency (n=30) | Percentage (%) |
|---|---|---|
| Notices not seen in time | 27 | 90.0 |
| Notices removed or tampered with | 22 | 73.3 |
| No urgent alert mechanism | 28 | 93.3 |
| No record of past notices | 25 | 83.3 |
| Difficulty targeting specific departments | 24 | 80.0 |
| No approval process for notices | 20 | 66.7 |

The data shows that the most critical problems were the lack of an urgent alert mechanism (93.3%) and the failure of notices to reach stakeholders in time (90.0%), confirming the problem statement articulated in Chapter One.

### 4.2.2 Desired Features of the New System

| Feature | "Very Important" Responses | Percentage (%) |
|---|---|---|
| Digital display / signage screen | 28 | 93.3 |
| Mobile-accessible interface | 29 | 96.7 |
| Urgent notice alerts | 27 | 90.0 |
| Notice approval workflow | 25 | 83.3 |
| Department-targeted notices | 24 | 80.0 |
| File attachment support | 21 | 70.0 |
| Search and filter notices | 23 | 76.7 |

---

## 4.3 System Requirements

### 4.3.1 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR01 | The system shall support user registration and login with email/password | High |
| FR02 | The system shall implement four roles: Super Admin, HOD, Creator, Viewer | High |
| FR03 | Creators shall be able to draft, edit and submit notices for approval | High |
| FR04 | HODs shall be able to approve or reject submitted notices with a reason | High |
| FR05 | Approved notices shall be displayed on the public digital signage display | High |
| FR06 | Super Admins shall be able to manage users, departments, and system settings | High |
| FR07 | Notices shall be targetable to specific departments | Medium |
| FR08 | Notices shall support file attachments (images, PDFs) | Medium |
| FR09 | The system shall send in-app notifications on notice approval or rejection | Medium |
| FR10 | HODs and Super Admins shall be able to mark notices as outdated | Medium |
| FR11 | Users shall be able to bookmark, like, and comment on approved notices | Low |
| FR12 | The system shall support password reset via email | High |

### 4.3.2 Non-Functional Requirements

| ID | Requirement | Metric |
|---|---|---|
| NFR01 | Performance | Page load time < 3 seconds on a 4G connection |
| NFR02 | Usability | SUS score ≥ 68 (above average) |
| NFR03 | Security | All data access governed by Row-Level Security (RLS) policies |
| NFR04 | Availability | System uptime ≥ 99.5% (via Vercel deployment) |
| NFR05 | Responsiveness | Fully functional on screens from 320px to 4K resolution |
| NFR06 | Scalability | Architecture must support up to 1,000 concurrent users |

---

## 4.4 User Feedback and Evaluation Results

Ten users participated in the usability evaluation using the System Usability Scale (SUS). The mean SUS score obtained was **78.5 out of 100**, which falls in the "Good" category (Bangor et al., 2009), exceeding the benchmark of 68. Qualitatively, users appreciated the clean interface, the ability to see notices on their mobile phones, and the visibility of the digital signage display. Areas noted for improvement included the need for a Luganda/local language option and additional tutorial guidance for first-time users.

---

&nbsp;

# CHAPTER FIVE: DISCUSSION OF FINDINGS

## 5.1 Introduction

This chapter discusses the findings presented in Chapter Four, relating them to the literature reviewed in Chapter Two and the objectives stated in Chapter One.

---

## 5.2 Discussion of System Features

The analysis of user requirements confirmed that the most critical features needed were a digital signage display (93.3%), a mobile-accessible interface (96.7%), and urgent notice alerts (90.0%). The implemented system addresses all three requirements. This aligns with the findings of Kaur and Singh (2018), who similarly found that mobile accessibility was the most valued feature of a digital notice board, and with Schaeffler (2008), who emphasised the importance of digital signage for institutional communication.

The approval workflow (FR04) was a demanded by 83.3% of respondents, a finding consistent with the gap identified in the system developed by Oladele and Adeyemo (2015), which lacked oversight mechanisms. The BBUC system addresses this gap through a structured, three-level approval chain (Creator → HOD → Signage), providing accountability that was absent in both related systems and the existing manual process.

---

## 5.3 Comparison with Existing Solutions

| Feature | Oladele & Adeyemo (2015) | Kaur & Singh (2018) | BBUC System |
|---|---|---|---|
| Approval Workflow | ✗ | Partial | ✓ Full (HOD/Admin) |
| RBAC | ✗ | ✗ | ✓ 4-role hierarchy |
| Digital Signage | ✗ | ✗ | ✓ Auto-advancing carousel |
| Real-time Notifications | ✗ | ✗ | ✓ In-app & push alerts |
| Mobile Responsive | Partial | ✓ | ✓ Fully responsive |
| Department Targeting | ✗ | ✗ | ✓ Per-department delivery |
| File Attachments | ✗ | ✓ | ✓ Images & PDFs |

The comparison demonstrates that the BBUC system comprehensively exceeds the capabilities of comparable systems in the empirical literature, particularly in the areas of access control, signage, and targeted delivery.

---

## 5.4 Achievement of Objectives

1. **Objective 1** (Analyse existing process): Achieved through questionnaires and interviews. Key inefficiencies — notice tampering (73.3%), lack of urgency alerts (93.3%), and absence of approval workflow (66.7%) — were documented.
2. **Objective 2** (Design an RBAC architecture): Achieved. A four-role model aligned with the BBUC institutional hierarchy was designed using RBAC principles (Ferraiolo & Kuhn, 1992).
3. **Objective 3** (Implement the system): Achieved. All 12 functional requirements were implemented and tested.
4. **Objective 4** (Evaluate usability): Achieved. The system obtained a SUS score of 78.5, confirming above-average usability and supporting the TAM prediction that PEOU positively influences adoption (Davis, 1989).

---

&nbsp;

# CHAPTER SIX: CONCLUSIONS AND RECOMMENDATIONS

## 6.1 Conclusions

This study successfully designed and implemented an Online Notice Board System for Bishop Barham University College. The following conclusions are drawn from the findings:

1. The existing manual notice dissemination process at BBUC is characterised by critical inefficiencies, including lack of urgency alerts, notice tampering, absence of an approval workflow, and limited audience reach, all of which directly impede institutional communication.
2. A four-role RBAC architecture (Super Admin, HOD, Creator, Viewer) effectively mirrors the BBUC institutional hierarchy and provides a secure, scalable access control framework for the system.
3. The implemented system — featuring a notice creation and approval workflow, department-targeted delivery, digital signage, file attachments, and push notifications — directly addresses all major deficiencies of the manual system identified in the requirements phase.
4. The system achieved a SUS usability score of 78.5 ("Good"), confirming that it is usable and likely to be accepted by the target user community, in accordance with the Technology Acceptance Model.

---

## 6.2 Recommendations

1. **To BBUC Management**: The institution should formally adopt and deploy the Online Notice Board System as its primary communication channel for institutional notices, supported by a policy requiring all official notices to be submitted through the system.
2. **To the ICT Department**: Regular maintenance, security audits, and user training should be conducted to ensure continued system reliability. A dedicated administrator should be assigned to manage the Super Admin role.
3. **To Future Researchers**: Future studies should investigate the integration of the notice board system with the UCU Student Information System (SIS) for automatic student onboarding, and with SMS gateways to reach students without internet access.
4. **To the Faculty of ET, UCU**: The system architecture and codebase could be refined into a reusable template and offered to other UCU constituent colleges facing similar communication challenges.

---

## 6.3 Limitations of the Study

- The evaluation sample (n=10 for SUS testing) was small and limited to voluntary participants, which may not fully represent the diversity of the user population.
- The system was evaluated using a prototype hosted on a cloud platform; performance under the full load of BBUC users has not been tested.
- The study was limited to BBUC and its findings may not be directly generalisable to other institutions with different governance structures.

---

## 6.4 Suggestions for Further Research

- A longitudinal study measuring the long-term impact of the system on student engagement and academic performance at BBUC.
- Development of a native mobile application (iOS/Android) to extend notice delivery to users without reliable browser access.
- Investigation of machine learning approaches for notice categorisation and personalised notice delivery recommendations.
- A comparative study evaluating the BBUC system against other digital notice board implementations in Ugandan universities.

---

&nbsp;

# CHAPTER SEVEN: ARTEFACT DESIGN AND IMPLEMENTATION

## 7.1 Artefact Design

### 7.1.1 System Architecture
The BBUC Online Notice Board System follows a **three-tier client-server architecture** comprising:
- **Presentation Tier**: A React (TypeScript) Single Page Application (SPA) built with Vite, styled using Tailwind CSS, and served via Vercel.
- **Application/Logic Tier**: Supabase Edge Functions (Deno runtime) for server-side business logic such as user creation and notification triggering.
- **Data Tier**: Supabase PostgreSQL database with Row-Level Security (RLS) policies governing data access.

### 7.1.2 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React (TypeScript) | 18.x |
| Build Tool | Vite | 5.x |
| CSS Framework | Tailwind CSS | 3.x |
| UI Component Library | shadcn/ui | latest |
| State Management | React Query (TanStack) | 5.x |
| Routing | React Router DOM | 6.x |
| Backend-as-a-Service | Supabase | latest |
| Database | PostgreSQL (via Supabase) | 15.x |
| Authentication | Supabase Auth (JWT) | built-in |
| Edge Functions | Deno (via Supabase Functions) | 1.x |
| Deployment | Vercel | — |
| Version Control | Git / GitHub | — |

### 7.1.3 Role-Based Access Control Model

```
┌─────────────────────────────────────────────────────────┐
│                    SUPER ADMIN                          │
│  - Manage all users and roles                          │
│  - Approve/reject any notice                           │
│  - Configure system settings and global alerts        │
│  - Full access to all features                         │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│              HEAD OF DEPARTMENT (HOD)                   │
│  - Approve/reject notices for their department         │
│  - Mark approved notices as outdated                   │
│  - View all notices                                     │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│               CREATOR (Staff / Lecturer)                │
│  - Create, edit, and delete own notices                │
│  - Submit notices for HOD approval                     │
│  - Attach files to notices                             │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                  VIEWER (Student)                       │
│  - View approved notices                               │
│  - Bookmark, like, and comment on notices              │
│  - Use the public signage display                      │
└─────────────────────────────────────────────────────────┘
```

### 7.1.4 Notice Approval Workflow

```
Creator drafts notice
         │
         ▼
Creator submits for approval (status: "pending")
         │
         ▼
HOD / Super Admin reviews notice
         │
   ┌─────┴──────┐
   ▼            ▼
Approve       Reject (with reason)
(status: "approved")   (status: "rejected")
   │
   ▼
Notice appears on Digital Signage & Dashboard Feed
   │
   ▼
[Optional] HOD / Admin marks as "Outdated"
(OUTDATED stamp shown on signage)
```

### 7.1.5 Database Schema (Key Tables)

| Table | Key Columns |
|---|---|
| `profiles` | `id`, `full_name`, `email`, `avatar_url`, `department_id` |
| `user_roles` | `user_id`, `role` (viewer/creator/approver/super_admin) |
| `departments` | `id`, `name`, `description` |
| `notices` | `id`, `title`, `content`, `status`, `is_urgent`, `is_outdated`, `created_by`, `department_id`, `target_department_id`, `approved_by`, `approved_at` |
| `attachments` | `id`, `notice_id`, `file_url`, `file_name`, `file_type`, `file_size` |
| `comments` | `id`, `notice_id`, `user_id`, `content`, `parent_id` |
| `notifications` | `id`, `user_id`, `notice_id`, `type`, `title`, `message`, `is_read` |
| `notice_bookmarks` | `id`, `notice_id`, `user_id` |
| `notice_likes` | `id`, `notice_id`, `user_id` |
| `global_alert_settings` | `id`, `enabled`, `message`, `ticker_text` |

### 7.1.6 Use Case Diagram

The system supports the following primary use cases:
- **Viewer**: View notices, Search/filter notices, Bookmark notice, Like notice, Comment on notice, View digital signage
- **Creator**: All Viewer use cases + Create notice, Edit notice, Submit for approval, Attach files, Delete own draft
- **HOD**: All Creator use cases + Approve notice, Reject notice (with reason), Mark notice as outdated, View approval queue
- **Super Admin**: All HOD use cases + Manage users, Assign roles, Create departments, Configure global alert, View all system data

---

## 7.2 Artefact Implementation

### 7.2.1 Development Process
The system was developed using an **Agile iterative approach** over four two-week sprints:

| Sprint | Focus Area | Key Deliverables |
|---|---|---|
| Sprint 1 | Foundation | Authentication, database schema, RBAC middleware |
| Sprint 2 | Core Features | Notice CRUD, approval workflow, dashboard |
| Sprint 3 | Advanced Features | Digital signage, notifications, attachments, comments |
| Sprint 4 | Refinement | Mobile responsiveness, performance optimisation, deployment |

### 7.2.2 Key Implementation Details

**Authentication**: Supabase Auth provides JWT-based authentication with email/password sign-in, magic link, and password reset. Email confirmation is handled automatically. The `create-user` Edge Function allows Super Admins to create users on behalf of others using the Supabase Admin API, bypassing the need for self-registration.

**Row-Level Security**: PostgreSQL RLS policies ensure data isolation. For example, only the notice creator or a Super Admin can update a notice that is in draft status; only HODs can approve notices targeting their department.

**Real-time Features**: Supabase Realtime subscriptions are used to push live updates to the notification centre and notice feed without requiring page refreshes.

**Digital Signage**: The `/signage` route is a public (unauthenticated) page that auto-advances through approved notices on a 10-second interval, with urgent notices displayed for 15 seconds. The page is fully responsive and designed for large screen displays.

**Mobile Responsiveness**: All pages were built using Tailwind CSS responsive breakpoints (`sm:`, `md:`, `lg:`), ensuring a consistent experience across mobile (320px+), tablet, and desktop devices.

### 7.2.3 Deployment

The application was deployed to **Vercel**, with the following configuration:
- A `vercel.json` file configured for SPA routing (all routes redirect to `index.html`).
- Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) securely set in the Vercel project settings.
- Supabase Edge Functions deployed separately on the Supabase platform.
- The Git repository is hosted at `https://github.com/bentech3/onlinenoticeboard`.

---

## 7.3 Validation / Evaluation

### 7.3.1 Functional Testing

Each functional requirement was tested against predefined acceptance criteria. All 12 functional requirements were met.

| Requirement ID | Test Case | Result |
|---|---|---|
| FR01 | User registers and logs in successfully | ✅ Pass |
| FR02 | Role-specific views and permissions enforced | ✅ Pass |
| FR03 | Creator can draft, save, and submit notices | ✅ Pass |
| FR04 | HOD approves and rejects notices with reason | ✅ Pass |
| FR05 | Approved notice appears on signage within 30 seconds | ✅ Pass |
| FR06 | Super Admin creates users and assigns departments | ✅ Pass |
| FR07 | Notice correctly targets a specific department | ✅ Pass |
| FR08 | File upload and display in notice detail works | ✅ Pass |
| FR09 | Notification received in-app on approval/rejection | ✅ Pass |
| FR10 | HOD successfully marks notice as outdated on signage | ✅ Pass |
| FR11 | User bookmarks, likes, and comments on a notice | ✅ Pass |
| FR12 | Password reset email sent and received | ✅ Pass |

### 7.3.2 Usability Evaluation

The System Usability Scale (SUS) was administered to 10 volunteer testers. The mean SUS score was **78.5**, which according to Bangor et al. (2009) falls in the **"Good"** adjective rating, exceeding the industry benchmark of 68.

| Respondent | SUS Score |
|---|---|
| 1 | 82.5 |
| 2 | 75.0 |
| 3 | 80.0 |
| 4 | 72.5 |
| 5 | 85.0 |
| 6 | 77.5 |
| 7 | 70.0 |
| 8 | 82.5 |
| 9 | 80.0 |
| 10 | 80.0 |
| **Mean** | **78.5** |

Qualitative feedback indicated that users found the interface visually appealing and intuitive. The digital signage display received particularly positive feedback for its premium design and clarity of information.

---

&nbsp;

# REFERENCES

Aggarwal, S. (2022). A comparative analysis of modern JavaScript frameworks for enterprise web application development. *International Journal of Computer Applications, 184*(12), 31–38.

Bangor, A., Kortum, P., & Miller, J. (2009). Determining what individual SUS scores mean: Adding an adjective rating scale. *Journal of Usability Studies, 4*(3), 114–123.

Brooke, J. (1996). SUS: A "quick and dirty" usability scale. In P. W. Jordan, B. Thomas, B. A. Weerdmeester, & I. L. McClelland (Eds.), *Usability evaluation in industry* (pp. 189–194). Taylor and Francis.

Brown, A., & Green, T. (2018). Digital communication platforms in higher education: A global survey. *Journal of Higher Education Policy and Management, 40*(5), 423–437. doi:10.1080/1360080X.2018.1512559

Chen, L., & Li, W. (2021). Backend-as-a-Service (BaaS) platforms in modern web development: A performance and productivity evaluation. *Journal of Systems and Software, 175*, 110932. doi:10.1016/j.jss.2021.110932

Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. *MIS Quarterly, 13*(3), 319–340. doi:10.2307/249008

Dennis, C., Newman, A., Michon, R., Brakus, J. J., & Wright, L. T. (2010). The mediating effects of perception and emotion: Digital signage in mall atmospherics. *Journal of Retailing and Consumer Services, 17*(3), 205–215. doi:10.1016/j.jretconser.2010.03.009

Ferraiolo, D., & Kuhn, R. (1992). Role-based access control. In *Proceedings of the 15th National Computer Security Conference* (pp. 554–563). National Institute of Standards and Technology.

Hevner, A., March, S., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75–105. doi:10.2307/25148625

Kaur, R., & Singh, J. (2018). Design and implementation of online notice board management system. *International Journal of Advanced Research in Computer Engineering & Technology, 7*(3), 271–276.

Laudon, K. C., & Laudon, J. P. (2020). *Management information systems: Managing the digital firm* (16th ed.). Pearson.

Nakayiza, S. (2021). Digital communication and student academic engagement at Makerere University. *African Journal of Education and Technology, 11*(2), 45–61.

O'Brien, J. A., & Marakas, G. M. (2011). *Management information systems* (10th ed.). McGraw-Hill/Irwin.

Oladele, R., & Adeyemo, A. (2015). Development of a web-based digital notice board system for tertiary institutions in Nigeria. *Computer Engineering and Intelligent Systems, 6*(4), 12–19.

Okello, D., & Ssemugabi, S. (2019). Adoption of information and communication technologies in Ugandan public universities: Opportunities and challenges. *Journal of Information Technology Education: Research, 18*, 233–249. doi:10.28945/4306

Sandhu, R., Coyne, E., Feinstein, H., & Youman, C. (1996). Role-based access control models. *IEEE Computer, 29*(2), 38–47. doi:10.1109/2.485845

Schaeffler, J. (2008). *Digital signage: Software, networks, advertising, and displays – A primer for understanding the business.* Focal Press.

Venkatesh, V., & Davis, F. D. (2000). A theoretical extension of the technology acceptance model: Four longitudinal field studies. *Management Science, 46*(2), 186–204. doi:10.1287/mnsc.46.2.186.11926

---

&nbsp;

# APPENDICES

## Appendix A: System Screenshots

*[Screenshots to be inserted here showing: Login page, Dashboard, Notice Creation form, Approval Queue, Digital Signage Display, Admin User Management panel, and Notice Detail page.]*

---

## Appendix B: Research Questionnaire

**BBUC Online Notice Board System — Requirements Gathering Questionnaire**

*This questionnaire is designed to gather information about the existing notice management process at BBUC and your expectations for a digital replacement. Your responses are confidential and will be used solely for academic research purposes.*

**Section A: Respondent Information**

1. Role at BBUC: ☐ Student  ☐ Lecturer/Staff  ☐ Department Head  ☐ Administrator
2. Department / Programme: ............................................
3. Years at BBUC: ☐ < 1 year  ☐ 1–3 years  ☐ 3–5 years  ☐ > 5 years

**Section B: Current Notice System**

4. How often do you check the physical notice board?
   ☐ Daily  ☐ 2–3 times a week  ☐ Once a week  ☐ Rarely

5. Have you ever missed an important notice because you did not see it in time?
   ☐ Yes  ☐ No  *(If yes, what was the consequence?)*: .............................

6. Have you ever seen a notice that was damaged, removed, or tampered with?
   ☐ Yes  ☐ No

7. On a scale of 1 (Very Poor) to 5 (Excellent), how would you rate the current notice system?
   ☐ 1  ☐ 2  ☐ 3  ☐ 4  ☐ 5

**Section C: Requirements for the New System**

*Rate the importance of the following features (1 = Not Important, 5 = Very Important):*

| Feature | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Access notices on your mobile phone | ☐ | ☐ | ☐ | ☐ | ☐ |
| Display notices on a screen in the corridor | ☐ | ☐ | ☐ | ☐ | ☐ |
| Receive an alert for urgent notices | ☐ | ☐ | ☐ | ☐ | ☐ |
| Have a HOD approve notices before publishing | ☐ | ☐ | ☐ | ☐ | ☐ |
| Filter notices by department | ☐ | ☐ | ☐ | ☐ | ☐ |
| Attach documents to notices (PDF, images) | ☐ | ☐ | ☐ | ☐ | ☐ |
| Search for past notices | ☐ | ☐ | ☐ | ☐ | ☐ |
| Comment on or respond to notices | ☐ | ☐ | ☐ | ☐ | ☐ |

8. Are there any additional features or concerns you would like the system to address?

   .............................................................................................

   .............................................................................................

**Section D: Technology Access**

9. Do you have a smartphone? ☐ Yes  ☐ No
10. Do you have internet access on campus? ☐ Yes  ☐ No  ☐ Sometimes

*Thank you for your participation.*

---

*End of Report*
