from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import mm
import os, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else "assets/resume/Satish_Kumar_Tiwari_Resume.pdf"
os.makedirs(os.path.dirname(OUT), exist_ok=True)

INK = colors.HexColor("#17354A")
BLUE = colors.HexColor("#176BC0")
MUTED = colors.HexColor("#5E7281")
PALE = colors.HexColor("#EEF5FB")
LINE = colors.HexColor("#D9E4EB")
GREEN = colors.HexColor("#2B7A5D")

doc = SimpleDocTemplate(
    OUT, pagesize=A4,
    rightMargin=14*mm, leftMargin=14*mm, topMargin=13*mm, bottomMargin=12*mm,
    title="Satish Kumar Tiwari - Resume",
    author="Satish Kumar Tiwari",
    subject="Technical Operations, Customer Success, Automation and Incident Response"
)
styles = getSampleStyleSheet()
name = ParagraphStyle("Name", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=23, leading=25, textColor=INK, alignment=TA_CENTER, spaceAfter=3)
role = ParagraphStyle("Role", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9.4, leading=11.5, textColor=BLUE, alignment=TA_CENTER, spaceAfter=4)
contact = ParagraphStyle("Contact", parent=styles["Normal"], fontSize=8.1, leading=10.5, textColor=MUTED, alignment=TA_CENTER, spaceAfter=8)
section = ParagraphStyle("Section", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=10.2, leading=12, textColor=BLUE, spaceBefore=7, spaceAfter=4)
body = ParagraphStyle("Body", parent=styles["BodyText"], fontSize=8.45, leading=11.7, textColor=INK, spaceAfter=3)
small = ParagraphStyle("Small", parent=body, fontSize=7.9, leading=10.9, textColor=MUTED)
job = ParagraphStyle("Job", parent=body, fontName="Helvetica-Bold", fontSize=9.3, leading=11.8, textColor=INK, spaceBefore=3, spaceAfter=1.5)
bullet = ParagraphStyle("Bullet", parent=body, fontSize=8.1, leading=11.1, leftIndent=9, firstLineIndent=-6, bulletIndent=0, spaceAfter=2.2)

story = [
    Paragraph("SATISH KUMAR TIWARI", name),
    Paragraph("TECHNICAL OPERATIONS · CUSTOMER SUCCESS · AUTOMATION", role),
    Paragraph("Mumbai, India  ·  ktiwari539@gmail.com  ·  linkedin.com/in/satish-kumar-tiwari-3b12111a8/", contact),
    Paragraph("PROFILE", section),
    Paragraph(
        "Technical operations and customer success leader with 7+ years across production support, automation, incident response and cross-functional delivery. "
        "Combines hands-on troubleshooting with API-driven workflow automation, SLA visibility and stakeholder communication to improve reliability and operating efficiency.",
        body
    )
]

metrics = [[
    Paragraph("<b>99.8%</b><br/><font size='7'>uptime SLA supported</font>", small),
    Paragraph("<b>40%</b><br/><font size='7'>faster MTTA</font>", small),
    Paragraph("<b>10+ hrs/week</b><br/><font size='7'>manual reporting removed</font>", small),
    Paragraph("<b>8+</b><br/><font size='7'>cross-functional members led</font>", small)
]]
mt = Table(metrics, colWidths=[43*mm]*4, rowHeights=[16*mm])
mt.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,-1),PALE),
    ("BOX",(0,0),(-1,-1),0.5,LINE),
    ("INNERGRID",(0,0),(-1,-1),0.5,LINE),
    ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ("ALIGN",(0,0),(-1,-1),"CENTER"),
    ("LEFTPADDING",(0,0),(-1,-1),4),
    ("RIGHTPADDING",(0,0),(-1,-1),4)
]))
story += [Spacer(1,2), mt]

story += [
    Paragraph("CORE CAPABILITIES", section),
    Paragraph(
        "<b>Technical Operations:</b> Production support · Incident response · SLA governance · Root-cause coordination · Monitoring<br/>"
        "<b>Automation & Integration:</b> Google Apps Script · REST APIs · Webhooks · Zapier · ChatGPT · GitHub Copilot<br/>"
        "<b>Data & Visibility:</b> Automated reporting · SLA dashboards · MySQL · Power BI (basic)<br/>"
        "<b>Leadership:</b> Stakeholder management · Team coordination · Process optimization · QBR facilitation",
        body
    ),
    Paragraph("PROFESSIONAL EXPERIENCE", section),
    Paragraph("Customer Success Manager  |  Raw Engineering  |  Jul 2023 – Present", job),
]
for b in [
    "Spearhead technical support operations for NBA and F1 applications, supporting a 99.8% uptime SLA across high-visibility customer journeys.",
    "Built Google Apps Script reporting pipelines that eliminated 10+ hours of manual reporting every week.",
    "Designed Slack webhook incident alerts that reduced mean time to acknowledge (MTTA) by 40%.",
    "Integrated REST APIs across internal workflows, reducing manual data-entry errors by 60%.",
    "Built SLA dashboards that improved stakeholder visibility by 40% and strengthened QBR discussions.",
    "Reduced operating costs by 15% through workflow consolidation, automation and process redesign.",
    "Implemented monitoring improvements that reduced ticket resolution time by 30%.",
    "Lead 8+ cross-functional team members across technical and business functions during incidents, launches and operational reviews."
]:
    story.append(Paragraph("• "+b, bullet))

story += [Paragraph("Technical Support Engineer  |  Whitehat Education Technology  |  Sep 2020 – Jul 2023", job)]
for b in [
    "Achieved 95% CSAT through structured troubleshooting, proactive communication and personalized support.",
    "Automated ticket categorization and escalation with Google Apps Script, reducing manual triage effort by 30%.",
    "Created 200+ knowledge-base articles and reusable troubleshooting guidance, improving self-service and agent consistency.",
    "Reduced average ticket handling time from 48 hours to 24 hours through process redesign and better tooling.",
    "Trained 25+ team members and supported migration of 3 legacy systems with zero downtime.",
    "Recognized as Employee of the Quarter twice for performance, innovation and mentorship."
]:
    story.append(Paragraph("• "+b, bullet))

story.append(PageBreak())
story += [
    Paragraph("SATISH KUMAR TIWARI", ParagraphStyle("P2", parent=name, fontSize=15, leading=17, alignment=0, spaceAfter=2)),
    Paragraph("TECHNICAL OPERATIONS · CUSTOMER SUCCESS · AUTOMATION", ParagraphStyle("P2R", parent=role, alignment=0, spaceAfter=6)),
    Paragraph("PROFESSIONAL EXPERIENCE · CONTINUED", section),
    Paragraph("Associate Support Engineer  |  Times Internet  |  Jan 2019 – Sep 2020", job)
]
for b in [
    "Handled 50+ customer inquiries per day with a 90% first-contact resolution rate.",
    "Reduced escalations by 25% through better documentation, training and proactive issue identification.",
    "Partnered with product teams on 12 customer-requested features that improved usability.",
    "Created technical manuals and onboarding guides that reduced new-hire ramp-up time by two weeks."
]:
    story.append(Paragraph("• "+b, bullet))

story += [Paragraph("SELECTED PROJECTS", section)]
projects = [
    ("AI-Powered Slack Alerting & Auto-Reporting",
     "Built a Google Apps Script and webhook pipeline for real-time incident alerts, API-driven operational reports and AI-assisted ticket-trend summaries."),
    ("Edba — School/College Management Software",
     "Built institution-management workflows spanning admissions, fees, daily operations and reporting; automated 15+ administrative processes."),
    ("InResto CPOS — Point of Sale Implementation",
     "Owned a multi-city rollout as SPOC, trained 50+ team members and reduced transaction errors by 30% through configuration and troubleshooting improvements.")
]
for title, desc in projects:
    story += [Paragraph(title, job), Paragraph(desc, small)]

story += [
    Paragraph("LEADERSHIP & RECOGNITION", section),
    Paragraph("Cross-functional team leadership · C-level QBR facilitation · Incident communication · Process improvement · Employee of the Quarter ×2", body),
    Paragraph("EDUCATION", section),
    Paragraph("<b>B.Tech — Electronics & Communication Engineering</b><br/>Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV), Bhopal · 2016–2020", body),
    Paragraph("<b>Diploma — DCA</b> · Maharishi Mahesh Yogi Vedic Vishwavidyalaya, Jabalpur · 2013–2014", body),
    Paragraph("<b>XII (PCM) & X</b> · St. Mary’s Higher Secondary School, Jabalpur · 2013 / 2011", body),
    Spacer(1,4),
    Paragraph("Portfolio: Satish OS · References and additional project context available on request.", small)
]

doc.build(story)
print(OUT)
