# /workspace/FSD/VP/app.py
import os
import io
import json
import datetime
from typing import Any, Dict, List, Optional

from flask import Flask, jsonify, request, send_file, render_template, make_response
from flask_cors import CORS

# Optional heavy deps
gpt_generator = None
gpt_init_error: Optional[str] = None

def get_gpt_generator():
    global gpt_generator, gpt_init_error
    if gpt_generator is not None or gpt_init_error is not None:
        return gpt_generator

    if os.environ.get("VP_DISABLE_MODEL_DOWNLOAD", "0") == "1":
        gpt_init_error = "Model download disabled via VP_DISABLE_MODEL_DOWNLOAD"
        return None

    try:
        from transformers import pipeline
        # This is per requirement; may require large download and compute.
        gpt_generator = pipeline(
            "text-generation",
            model="openai/gpt-oss-20b",
            device_map="auto",
            trust_remote_code=True
        )
    except Exception as e:
        gpt_generator = None
        gpt_init_error = str(e)
    return gpt_generator

def generate_with_gpt(prompt: str, max_new_tokens: int = 320) -> Optional[str]:
    generator = get_gpt_generator()
    if generator is None:
        return None
    try:
        outputs = generator(prompt, max_new_tokens=max_new_tokens, do_sample=True, temperature=0.6, top_p=0.9, num_return_sequences=1)
        if isinstance(outputs, list) and len(outputs) > 0:
            text = outputs[0].get("generated_text", "")
            # Strip the prompt if included, keeping only completion after the prompt
            if text.startswith(prompt):
                text = text[len(prompt):].strip()
            return text.strip()
    except Exception:
        return None
    return None

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/skills", methods=["GET"])
def api_skills():
    # Dummy data; frontend renders bar chart
    skills = [
        {"name": "Python", "demand": 92},
        {"name": "JavaScript", "demand": 88},
        {"name": "Machine Learning", "demand": 85},
        {"name": "Cloud (AWS/Azure)", "demand": 83},
        {"name": "Data Engineering", "demand": 81},
        {"name": "DevOps", "demand": 80},
        {"name": "Cybersecurity", "demand": 78}
    ]
    return jsonify({"skills": skills})

@app.route("/api/simulate", methods=["POST"])
def api_simulate():
    data = request.get_json(silent=True) or {}
    skills = data.get("skills", [])
    goals = data.get("goals", "")

    prompt = (
        "You are a career mentor AI. Given the user's current skills and goals, propose 2-3 distinct career pathways. "
        "For each pathway, include: a concise title, a 2-3 sentence summary, indicative salary range (USD), job stability (1-10), "
        "personal growth potential (1-10), and 3-5 concrete next steps.\n\n"
        f"Skills: {skills}\n"
        f"Goals: {goals}\n\n"
        "Format the output in concise bullet points per pathway."
    )

    completion = generate_with_gpt(prompt)

    if completion:
        # Simple wrapper turning free-text guidance into a single summarized path;
        # keep JSON schema stable for frontend
        simulated_paths = [{
            "title": "AI-Augmented Plan",
            "summary": completion[:1200],
            "salary": "USD 85k - 150k",
            "stability": 8,
            "growth": 9,
            "next_steps": [
                "Refine resume for target roles",
                "Complete 2 portfolio projects",
                "Network with 5 professionals",
                "Apply to 10 curated openings"
            ]
        }]
    else:
        # Fallback mock
        simulated_paths = [
            {
                "title": "Data Engineer Track",
                "summary": "Leverage Python and cloud to build robust data pipelines, optimize ETL/ELT, and support analytics at scale.",
                "salary": "USD 95k - 140k",
                "stability": 9,
                "growth": 8,
                "next_steps": [
                    "Master PySpark & SQL optimization",
                    "Build end-to-end pipeline on AWS",
                    "Certify: AWS Data Engineer",
                    "Contribute to an open-source ETL tool"
                ]
            },
            {
                "title": "ML Engineer Track",
                "summary": "Productionize ML models, MLOps best practices, and model monitoring to ship impactful AI features.",
                "salary": "USD 100k - 160k",
                "stability": 8,
                "growth": 9,
                "next_steps": [
                    "Deploy a model with FastAPI",
                    "Adopt feature store & CI/CD",
                    "Learn monitoring/drift detection",
                    "Build a recommendation system"
                ]
            },
            {
                "title": "Full-Stack with AI Track",
                "summary": "Build full-stack apps that integrate LLM features and RAG to solve real business workflows.",
                "salary": "USD 85k - 150k",
                "stability": 8,
                "growth": 9,
                "next_steps": [
                    "Create an LLM-backed CRUD app",
                    "Implement vector search & RAG",
                    "Optimize prompts & evaluations",
                    "Ship to a cloud platform"
                ]
            }
        ]
    return jsonify({"paths": simulated_paths, "model_available": completion is not None, "model_error": gpt_init_error})

@app.route("/api/plan", methods=["POST"])
def api_plan():
    data = request.get_json(silent=True) or {}
    skills = data.get("skills", [])
    goals = data.get("goals", "")

    prompt = (
        "You are a learning coach AI. Create a concise 7-day, day-by-day study plan to upskill the user towards their goals. "
        "Each day must have: topic, 2-3 tasks, and a reputable resource link (Coursera, official docs, etc.). "
        "Return compact text; I will parse it.\n\n"
        f"Skills: {skills}\n"
        f"Goals: {goals}\n"
    )

    completion = generate_with_gpt(prompt)

    start_date = datetime.date.today()
    if completion:
        # Lightweight parse: fallback to generic plan format if parse is ambiguous
        lines = [l.strip() for l in completion.splitlines() if l.strip()]
        days: List[Dict[str, Any]] = []
        day_idx = 0
        current_tasks: List[Dict[str, str]] = []
        topic = "Focused Study"
        for line in lines:
            if line.lower().startswith("day"):
                if day_idx > 0:
                    day_date = start_date + datetime.timedelta(days=day_idx - 1)
                    days.append({
                        "day": day_idx,
                        "date": day_date.isoformat(),
                        "topic": topic,
                        "tasks": current_tasks[:]
                    })
                    current_tasks.clear()
                day_idx += 1
                topic = line.split(":", 1)[-1].strip() or f"Day {day_idx} Topic"
            elif "http" in line:
                parts = line.split("http", 1)
                title = parts[0].strip("- :") or "Study Resource"
                link = "http" + parts[1].strip()
                current_tasks.append({"title": title, "link": link})
            else:
                # treat as task title without link
                if line and len(line) > 3:
                    current_tasks.append({"title": line, "link": ""})
        # Flush last day
        if day_idx == 0:
            day_idx = 1
        day_date = start_date + datetime.timedelta(days=day_idx - 1)
        days.append({
            "day": day_idx,
            "date": day_date.isoformat(),
            "topic": topic,
            "tasks": current_tasks[:]
        })
        # Ensure 7 days by padding if needed
        while len(days) < 7:
            d = len(days) + 1
            dd = start_date + datetime.timedelta(days=d - 1)
            days.append({
                "day": d,
                "date": dd.isoformat(),
                "topic": "Self-Study & Review",
                "tasks": [
                    {"title": "Practice problems", "link": ""},
                    {"title": "Read documentation", "link": ""}
                ]
            })
    else:
        # Fallback 7-day mock plan
        topics = [
            "Python for Data",
            "SQL & Data Modeling",
            "Data Pipelines (ETL/ELT)",
            "Cloud Basics (AWS)",
            "Machine Learning Intro",
            "MLOps & Deployment",
            "Portfolio & Applications"
        ]
        resources = [
            ("Pandas 10min", "https://pandas.pydata.org/docs/user_guide/10min.html"),
            ("SQLBolt", "https://sqlbolt.com/"),
            ("Airflow Docs", "https://airflow.apache.org/docs/"),
            ("AWS Skill Builder", "https://skillbuilder.aws/"),
            ("scikit-learn Guide", "https://scikit-learn.org/stable/tutorial/index.html"),
            ("FastAPI Docs", "https://fastapi.tiangolo.com/"),
            ("Resume Tips", "https://www.notion.so/resume-template")
        ]
        days = []
        for i in range(7):
            dd = start_date + datetime.timedelta(days=i)
            title, link = resources[i]
            days.append({
                "day": i + 1,
                "date": dd.isoformat(),
                "topic": topics[i],
                "tasks": [
                    {"title": f"Learn: {topics[i]}", "link": link},
                    {"title": "Hands-on mini project", "link": ""},
                    {"title": "Notes and recap", "link": ""}
                ]
            })

    return jsonify({"start_date": start_date.isoformat(), "days": days, "model_available": completion is not None, "model_error": gpt_init_error})

@app.route("/api/export/calendar", methods=["GET"])
def api_export_calendar():
    try:
        from ics import Calendar, Event
    except Exception:
        return make_response(("ICS library not available. Install 'ics' package.", 500))

    # Generate a short 7-day plan if none supplied
    today = datetime.date.today()
    cal = Calendar()
    for i in range(7):
        event = Event()
        event.name = f"Vetri Path Study Day {i+1}"
        date_obj = today + datetime.timedelta(days=i)
        # All-day events
        event.begin = datetime.datetime.combine(date_obj, datetime.time(9, 0))
        event.end = datetime.datetime.combine(date_obj, datetime.time(11, 0))
        event.description = "Study per Vetri Path plan."
        cal.events.add(event)

    ics_bytes = str(cal).encode("utf-8")
    return send_file(
        io.BytesIO(ics_bytes),
        mimetype="text/calendar",
        as_attachment=True,
        download_name="vp_plan.ics"
    )

@app.route("/api/export/pdf", methods=["GET", "POST"])
def api_export_pdf():
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import inch
    except Exception:
        return make_response(("ReportLab not available. Install 'reportlab' package.", 500))

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    width, height = letter

    # Collect plan if provided
    plan = None
    if request.method == "POST":
        plan = request.get_json(silent=True)
    title = "Vetri Path Study Plan"
    c.setTitle(title)

    # Header
    c.setFont("Helvetica-Bold", 18)
    c.drawString(1 * inch, height - 1 * inch, title)
    c.setFont("Helvetica", 10)
    c.drawString(1 * inch, height - 1.2 * inch, f"Generated: {datetime.datetime.now().isoformat(timespec='minutes')}")

    y = height - 1.6 * inch
    c.setFont("Helvetica", 12)
    if plan and "days" in plan:
        for day in plan["days"]:
            line = f"Day {day.get('day')}: {day.get('topic')} ({day.get('date')})"
            c.drawString(1 * inch, y, line)
            y -= 0.22 * inch
            for task in day.get("tasks", []):
                task_line = f"- {task.get('title')}"
                if task.get("link"):
                    task_line += f" [{task.get('link')}]"
                c.drawString(1.2 * inch, y, task_line)
                y -= 0.18 * inch
                if y < 1 * inch:
                    c.showPage()
                    y = height - 1 * inch
                    c.setFont("Helvetica", 12)
            y -= 0.1 * inch
            if y < 1 * inch:
                c.showPage()
                y = height - 1 * inch
                c.setFont("Helvetica", 12)
    else:
        c.drawString(1 * inch, y, "No plan submitted; include plan JSON in POST to embed details.")
    c.showPage()
    c.save()
    buf.seek(0)
    return send_file(buf, mimetype="application/pdf", as_attachment=True, download_name="vp_plan.pdf")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)