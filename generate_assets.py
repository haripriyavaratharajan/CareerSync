import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs('screenshots', exist_ok=True)
os.makedirs('figures', exist_ok=True)

def get_font(size=14, bold=False):
    try:
        font_name = "arialbd.ttf" if bold else "arial.ttf"
        return ImageFont.truetype(font_name, size)
    except Exception:
        return ImageFont.load_default()

def draw_browser_chrome(draw, width, title="CareerSync AI - Multi-Field Edition"):
    # Window top bar
    draw.rectangle([0, 0, width, 40], fill="#e2e8f0", outline="#cbd5e1", width=1)
    # Window control dots
    draw.ellipse([15, 14, 27, 26], fill="#ef4444")
    draw.ellipse([35, 14, 47, 26], fill="#f59e0b")
    draw.ellipse([55, 14, 67, 26], fill="#10b981")
    # URL bar
    draw.rectangle([100, 8, width - 100, 32], fill="#ffffff", outline="#cbd5e1", width=1)
    font = get_font(12)
    draw.text((115, 12), f"https://careersync.ai/{title.lower().replace(' ', '-')}", fill="#64748b", font=font)
    
    # Navigation header
    draw.rectangle([0, 40, width, 90], fill="#1e293b")
    font_logo = get_font(18, bold=True)
    draw.text((25, 52), "CareerSync AI", fill="#ffffff", font=font_logo)
    
    font_nav = get_font(13)
    navs = ["Dashboard", "My Profile", "Resume Builder", "Job Matcher", "Tracker", "Skill Gap", "Settings"]
    x = 220
    for n in navs:
        draw.text((x, 56), n, fill="#94a3b8", font=font_nav)
        x += 120
    draw.rectangle([width - 120, 50, width - 25, 80], fill="#3b82f6")
    draw.text((width - 105, 56), "My Account", fill="#ffffff", font=get_font(12, bold=True))

def create_landing_page():
    img = Image.new("RGB", (1200, 750), color="#f8fafc")
    d = ImageDraw.Draw(img)
    draw_browser_chrome(d, 1200, "Home")
    
    # Hero Section
    d.rectangle([100, 140, 1100, 400], fill="#ffffff", outline="#e2e8f0", width=2)
    d.text((150, 180), "Supercharge Your Multi-Field Career Journey", fill="#0f172a", font=get_font(28, bold=True))
    d.text((150, 230), "One platform for 29 distinct career professions. Build ATS-compliant resumes,", fill="#475569", font=get_font(16))
    d.text((150, 260), "leverage mathematical job match algorithms, and bridge your professional skill gaps.", fill="#475569", font=get_font(16))
    
    # Action buttons
    d.rectangle([150, 310, 320, 360], fill="#2563eb")
    d.text((180, 323), "Get Started Free", fill="#ffffff", font=get_font(15, bold=True))
    d.rectangle([340, 310, 500, 360], fill="#f1f5f9", outline="#cbd5e1", width=1)
    d.text((370, 323), "Explore 29 Fields", fill="#334155", font=get_font(15))
    
    # Field tags preview
    fields = ["Software Engineering", "Healthcare & Nursing", "Finance & Banking", "Mechanical & Civil", "Education & Teaching", "Law & Legal"]
    fx = 100
    for f in fields:
        d.rectangle([fx, 430, fx + 155, 470], fill="#ede9fe", outline="#c4b5fd", width=1)
        d.text((fx + 10, 442), f, fill="#6d28d9", font=get_font(11, bold=True))
        fx += 165

    # 3 Feature Cards
    cards = [
        ("Multi-Field Profiles", "Manage distinct skillsets, past work, and target roles across 29 industries."),
        ("17 Resume Templates", "ATS-optimized layouts with live data binding and direct PDF generation."),
        ("Algorithmic Matcher", "Transparent 6-part weighted job match scoring with skill gap discovery.")
    ]
    cx = 100
    for title, desc in cards:
        d.rectangle([cx, 500, cx + 310, 680], fill="#ffffff", outline="#e2e8f0", width=1)
        d.rectangle([cx + 20, 520, cx + 60, 560], fill="#dbeafe")
        d.text((cx + 32, 530), "★", fill="#1d4ed8", font=get_font(18, bold=True))
        d.text((cx + 20, 580), title, fill="#0f172a", font=get_font(16, bold=True))
        d.text((cx + 20, 615), desc[:35], fill="#64748b", font=get_font(13))
        d.text((cx + 20, 635), desc[35:], fill="#64748b", font=get_font(13))
        cx += 345

    img.save("screenshots/fig_landing.png")

def create_auth_page():
    img = Image.new("RGB", (1200, 750), color="#f1f5f9")
    d = ImageDraw.Draw(img)
    draw_browser_chrome(d, 1200, "Authentication")
    
    # Centered modal
    d.rectangle([380, 140, 820, 680], fill="#ffffff", outline="#cbd5e1", width=2)
    d.text((470, 180), "Welcome to CareerSync", fill="#0f172a", font=get_font(22, bold=True))
    d.text((440, 220), "Sign in to access your multi-field portfolio", fill="#64748b", font=get_font(14))
    
    # Google OAuth button
    d.rectangle([430, 260, 770, 305], fill="#ffffff", outline="#cbd5e1", width=1)
    d.text((490, 273), "Continue with Google OAuth", fill="#334155", font=get_font(14, bold=True))
    
    d.text((585, 325), "— OR —", fill="#94a3b8", font=get_font(12))
    
    # Form fields
    d.text((430, 360), "Email Address", fill="#334155", font=get_font(13, bold=True))
    d.rectangle([430, 385, 770, 425], fill="#f8fafc", outline="#cbd5e1", width=1)
    d.text((445, 396), "candidate@careersync.ai", fill="#1e293b", font=get_font(14))
    
    d.text((430, 445), "Password", fill="#334155", font=get_font(13, bold=True))
    d.rectangle([430, 470, 770, 510], fill="#f8fafc", outline="#cbd5e1", width=1)
    d.text((445, 483), "••••••••••••••••", fill="#1e293b", font=get_font(14))
    
    # Submit button
    d.rectangle([430, 545, 770, 595], fill="#2563eb")
    d.text((545, 558), "Sign In / Register", fill="#ffffff", font=get_font(15, bold=True))
    
    d.text((470, 625), "Protected by JWT & Bcrypt Cryptographic Security", fill="#94a3b8", font=get_font(11))
    img.save("screenshots/fig_auth.png")

def create_dashboard_page():
    img = Image.new("RGB", (1200, 750), color="#f8fafc")
    d = ImageDraw.Draw(img)
    draw_browser_chrome(d, 1200, "Dashboard")
    
    # User welcome
    d.text((60, 115), "Dashboard Overview", fill="#0f172a", font=get_font(24, bold=True))
    d.text((60, 150), "Track your active career paths, profile completeness, and top matched jobs.", fill="#64748b", font=get_font(14))
    
    # Metric cards
    metrics = [
        ("Active Fields", "2 Fields Selected", "Tech & Finance", "#dbeafe", "#1d4ed8"),
        ("Profile Completeness", "87.5%", "7 of 8 Criteria Met", "#dcfce7", "#15803d"),
        ("Custom Resumes", "4 Resumes Built", "ATS Optimized", "#fef3c7", "#b45309"),
        ("Matched Jobs", "28 Available", "≥ 75% Match Score", "#f3e8ff", "#7e22ce")
    ]
    mx = 60
    for title, val, sub, bg, text_c in metrics:
        d.rectangle([mx, 190, mx + 250, 290], fill="#ffffff", outline="#e2e8f0", width=1)
        d.rectangle([mx + 15, 205, mx + 55, 245], fill=bg)
        d.text((mx + 70, 212), title, fill="#64748b", font=get_font(13))
        d.text((mx + 15, 255), val, fill=text_c, font=get_font(18, bold=True))
        d.text((mx + 150, 260), sub, fill="#94a3b8", font=get_font(10))
        mx += 275

    # Recent Matched Jobs List
    d.rectangle([60, 315, 750, 700], fill="#ffffff", outline="#e2e8f0", width=1)
    d.text((85, 335), "Recommended Job Opportunities (Algorithmic Match)", fill="#0f172a", font=get_font(17, bold=True))
    
    jobs = [
        ("Senior Full-Stack Cloud Engineer", "TechCorp Global", "Remote • Full-time", "94% Match"),
        ("Quantitative Data & Financial Analyst", "Apex FinServe", "Bangalore • Hybrid", "88% Match"),
        ("React & TypeScript Frontend Lead", "InnoWave Labs", "Chennai • Onsite", "82% Match"),
        ("DevOps & Site Reliability Engineer", "NextGen Systems", "Remote • Full-time", "76% Match")
    ]
    jy = 380
    for title, comp, loc, score in jobs:
        d.rectangle([80, jy, 730, jy + 65], fill="#f8fafc", outline="#e2e8f0", width=1)
        d.text((100, jy + 12), title, fill="#1e293b", font=get_font(15, bold=True))
        d.text((100, jy + 35), f"{comp}  |  {loc}", fill="#64748b", font=get_font(12))
        d.rectangle([620, jy + 15, 715, jy + 50], fill="#22c55e")
        d.text((635, jy + 23), score, fill="#ffffff", font=get_font(13, bold=True))
        jy += 75

    # Profile Completeness Gauge & Quick Links
    d.rectangle([780, 315, 1140, 700], fill="#ffffff", outline="#e2e8f0", width=1)
    d.text((805, 335), "Multi-Field Status", fill="#0f172a", font=get_font(17, bold=True))
    d.ellipse([880, 385, 1040, 545], outline="#3b82f6", width=12)
    d.text((930, 450), "88%", fill="#1d4ed8", font=get_font(26, bold=True))
    d.text((890, 490), "Profile Optimized", fill="#64748b", font=get_font(13))
    
    d.text((805, 575), "Quick Actions:", fill="#0f172a", font=get_font(14, bold=True))
    d.rectangle([805, 605, 1115, 640], fill="#eff6ff", outline="#bfdbfe", width=1)
    d.text((825, 615), "Create Tailored Resume (17 Templates)", fill="#1e40af", font=get_font(13))
    d.rectangle([805, 650, 1115, 685], fill="#eff6ff", outline="#bfdbfe", width=1)
    d.text((825, 660), "Review Skill Gaps & Action Items", fill="#1e40af", font=get_font(13))

    img.save("screenshots/fig_dashboard.png")

def create_onboarding_page():
    img = Image.new("RGB", (1200, 750), color="#f8fafc")
    d = ImageDraw.Draw(img)
    draw_browser_chrome(d, 1200, "Onboarding")
    
    d.text((60, 115), "Select Your Career Fields", fill="#0f172a", font=get_font(24, bold=True))
    d.text((60, 150), "Choose one or more fields. CareerSync dynamically customizes skills, roles, and resume structures.", fill="#64748b", font=get_font(14))
    
    fields = [
        ("Software & IT", "Full-Stack, Cloud, DevOps, AI/ML", True),
        ("Finance & Banking", "Fintech, Investment, Auditing, Accounts", True),
        ("Healthcare & Nursing", "Clinical Care, Hospital Admin, Pharmacy", False),
        ("Mechanical & Civil", "CAD Design, Structural, QA/QC Engineering", False),
        ("Education & Teaching", "Curriculum Design, Higher Ed, STEM", False),
        ("Law & Legal Counsel", "Corporate Law, Compliance, Litigation", False),
        ("Creative Design & UI", "Product Design, Figma, Motion Graphics", False),
        ("Marketing & Growth", "SEO, Brand Strategy, Content Lead", False)
    ]
    
    gx, gy = 60, 195
    for title, desc, selected in fields:
        bg = "#eff6ff" if selected else "#ffffff"
        border = "#3b82f6" if selected else "#e2e8f0"
        d.rectangle([gx, gy, gx + 255, gy + 110], fill=bg, outline=border, width=2 if selected else 1)
        if selected:
            d.rectangle([gx + 225, gy + 10, gx + 245, gy + 30], fill="#3b82f6")
            d.text((gx + 229, gy + 12), "✓", fill="#ffffff", font=get_font(12, bold=True))
        d.text((gx + 18, gy + 20), title, fill="#0f172a", font=get_font(16, bold=True))
        d.text((gx + 18, gy + 52), desc, fill="#64748b", font=get_font(12))
        gx += 280
        if gx > 950:
            gx = 60
            gy += 135

    # Bottom Continue Bar
    d.rectangle([60, 620, 1140, 690], fill="#ffffff", outline="#e2e8f0", width=1)
    d.text((90, 642), "Selected: 2 fields (Software & IT, Finance & Banking)", fill="#334155", font=get_font(15, bold=True))
    d.rectangle([940, 633, 1110, 677], fill="#2563eb")
    d.text((975, 644), "Proceed to Profile →", fill="#ffffff", font=get_font(14, bold=True))

    img.save("screenshots/fig_onboarding.png")

def create_profile_page():
    img = Image.new("RGB", (1200, 750), color="#f8fafc")
    d = ImageDraw.Draw(img)
    draw_browser_chrome(d, 1200, "Career-Profile")
    
    d.text((60, 115), "Multi-Field Career Profile", fill="#0f172a", font=get_font(24, bold=True))
    
    # Field Tabs
    d.rectangle([60, 160, 240, 205], fill="#2563eb")
    d.text((80, 172), "Field 1: Software & IT", fill="#ffffff", font=get_font(14, bold=True))
    d.rectangle([250, 160, 440, 205], fill="#e2e8f0")
    d.text((270, 172), "Field 2: Finance & Banking", fill="#475569", font=get_font(14, bold=True))
    d.rectangle([450, 160, 560, 205], fill="#f1f5f9", outline="#cbd5e1", width=1)
    d.text((465, 172), "+ Add Field", fill="#64748b", font=get_font(14))
    
    # Profile Form Left (Skills & Roles)
    d.rectangle([60, 220, 600, 700], fill="#ffffff", outline="#e2e8f0", width=1)
    d.text((85, 240), "Target Roles & Experience Level", fill="#0f172a", font=get_font(16, bold=True))
    d.rectangle([85, 270, 575, 305], fill="#f8fafc", outline="#cbd5e1", width=1)
    d.text((95, 280), "Full Stack Developer, Cloud Architect, DevOps Engineer", fill="#1e293b", font=get_font(13))
    
    d.text((85, 330), "Core Skills Inventory (Categorized)", fill="#0f172a", font=get_font(16, bold=True))
    skills = ["React.js", "Node.js", "Python", "MongoDB", "Docker", "AWS", "REST APIs", "GraphQL", "TailwindCSS"]
    sx, sy = 85, 365
    for s in skills:
        d.rectangle([sx, sy, sx + 90, sy + 30], fill="#dbeafe", outline="#bfdbfe", width=1)
        d.text((sx + 10, sy + 7), s, fill="#1e40af", font=get_font(12, bold=True))
        sx += 100
        if sx > 500:
            sx = 85
            sy += 40
            
    d.text((85, 460), "Work Experience History", fill="#0f172a", font=get_font(16, bold=True))
    d.rectangle([85, 490, 575, 570], fill="#f8fafc", outline="#e2e8f0", width=1)
    d.text((100, 505), "Software Development Engineer @ CloudSoft Labs", fill="#0f172a", font=get_font(14, bold=True))
    d.text((100, 528), "2023 - Present (Full-time) • Microservices & React Architecture", fill="#64748b", font=get_font(12))
    
    # Profile Right (Preferences & Education)
    d.rectangle([630, 220, 1140, 700], fill="#ffffff", outline="#e2e8f0", width=1)
    d.text((655, 240), "Education & Academic Credentials", fill="#0f172a", font=get_font(16, bold=True))
    d.rectangle([655, 270, 1115, 350], fill="#f8fafc", outline="#e2e8f0", width=1)
    d.text((670, 285), "B.Tech in Information Technology", fill="#0f172a", font=get_font(14, bold=True))
    d.text((670, 310), "National Engineering College • 2022 - 2026 • CGPA: 8.9/10", fill="#64748b", font=get_font(12))
    
    d.text((655, 380), "Preferences for Matching Algorithm", fill="#0f172a", font=get_font(16, bold=True))
    d.text((655, 415), "Work Mode: Hybrid / Remote Preferred", fill="#334155", font=get_font(13))
    d.text((655, 445), "Target Locations: Bangalore, Chennai, Remote", fill="#334155", font=get_font(13))
    d.text((655, 475), "Expected Salary Range: ₹8,00,000 - ₹14,00,000 / yr", fill="#334155", font=get_font(13))
    
    d.rectangle([655, 540, 1115, 620], fill="#f0fdf4", outline="#bbf7d0", width=1)
    d.text((675, 555), "Field Data Synchronized", fill="#166534", font=get_font(14, bold=True))
    d.text((675, 580), "Resume Builder and Job Scrapers will use this specific profile.", fill="#15803d", font=get_font(12))

    img.save("screenshots/fig_profile.png")

def create_resume_gallery_page():
    img = Image.new("RGB", (1200, 750), color="#f8fafc")
    d = ImageDraw.Draw(img)
    draw_browser_chrome(d, 1200, "Resume-Templates")
    
    d.text((60, 115), "Resume Template Gallery (17 ATS Templates)", fill="#0f172a", font=get_font(24, bold=True))
    d.text((60, 150), "Select from 17 field-optimized, single and multi-column ATS-friendly designs.", fill="#64748b", font=get_font(14))
    
    templates = [
        ("ATS Classic", "Single Column • Clean", "#ffffff"),
        ("Executive Suite", "Sidebar Left • Formal", "#f8fafc"),
        ("Scholar & Research", "Academic • Detailed", "#ffffff"),
        ("Care & Clinical", "Medical Format", "#f8fafc"),
        ("Blueprint Tech", "Two Column • Skills Grid", "#ffffff"),
        ("Fresh Start", "Entry Level • Clean", "#f8fafc"),
        ("Ledger & Finance", "Financial Tabular", "#ffffff"),
        ("Counsel Law", "Legal Standard", "#f8fafc")
    ]
    
    tx, ty = 60, 190
    for name, desc, bg in templates:
        d.rectangle([tx, ty, tx + 250, ty + 230], fill=bg, outline="#cbd5e1", width=1)
        # Mock resume lines
        d.rectangle([tx + 20, ty + 20, tx + 230, ty + 140], fill="#f1f5f9")
        d.line([(tx + 30, ty + 35), (tx + 180, ty + 35)], fill="#94a3b8", width=3)
        d.line([(tx + 30, ty + 50), (tx + 220, ty + 50)], fill="#cbd5e1", width=2)
        d.line([(tx + 30, ty + 65), (tx + 200, ty + 65)], fill="#cbd5e1", width=2)
        d.line([(tx + 30, ty + 85), (tx + 220, ty + 85)], fill="#cbd5e1", width=2)
        d.line([(tx + 30, ty + 105), (tx + 150, ty + 105)], fill="#cbd5e1", width=2)
        
        d.text((tx + 15, ty + 155), name, fill="#0f172a", font=get_font(15, bold=True))
        d.text((tx + 15, ty + 180), desc, fill="#64748b", font=get_font(12))
        d.rectangle([tx + 15, ty + 200, tx + 130, ty + 222], fill="#2563eb")
        d.text((tx + 30, ty + 204), "Use Template", fill="#ffffff", font=get_font(11, bold=True))
        
        tx += 275
        if tx > 950:
            tx = 60
            ty += 250

    img.save("screenshots/fig_resume_gallery.png")

def create_resume_editor_page():
    img = Image.new("RGB", (1200, 750), color="#f8fafc")
    d = ImageDraw.Draw(img)
    draw_browser_chrome(d, 1200, "Resume-Editor")
    
    d.text((60, 110), "Live Resume Builder & PDF Preview", fill="#0f172a", font=get_font(22, bold=True))
    
    # Editor Left Controls
    d.rectangle([60, 150, 480, 710], fill="#ffffff", outline="#e2e8f0", width=1)
    d.text((80, 170), "Template Customizer", fill="#0f172a", font=get_font(16, bold=True))
    
    d.text((80, 205), "Active Template: Blueprint Tech", fill="#475569", font=get_font(13))
    d.rectangle([80, 235, 460, 275], fill="#f1f5f9", outline="#cbd5e1", width=1)
    d.text((95, 247), "Synchronize from Profile Data", fill="#1e293b", font=get_font(13, bold=True))
    
    d.text((80, 300), "Reorder & Toggle Sections:", fill="#0f172a", font=get_font(14, bold=True))
    sections = ["1. Professional Summary (Visible)", "2. Core Competencies & Skills (Visible)", "3. Experience & Projects (Visible)", "4. Academic Education (Visible)", "5. Certifications & Badges (Visible)"]
    sy = 330
    for s in sections:
        d.rectangle([80, sy, 460, sy + 35], fill="#f8fafc", outline="#e2e8f0", width=1)
        d.text((95, sy + 8), s, fill="#334155", font=get_font(12))
        d.text((435, sy + 8), "≡", fill="#94a3b8", font=get_font(16))
        sy += 45
        
    d.rectangle([80, 630, 460, 680], fill="#16a34a")
    d.text((170, 645), "Download PDF (A4 Format)", fill="#ffffff", font=get_font(15, bold=True))
    
    # Resume Live Preview Right
    d.rectangle([510, 150, 1140, 710], fill="#475569")
    # A4 Page paper
    d.rectangle([580, 170, 1070, 690], fill="#ffffff")
    d.text((610, 195), "HARIPRIYA V", fill="#0f172a", font=get_font(20, bold=True))
    d.text((610, 222), "Full-Stack Software Engineer & Cloud Architect", fill="#2563eb", font=get_font(13, bold=True))
    d.text((610, 240), "haripriya@careersync.ai  |  +91 98765 43210  |  Chennai, India", fill="#64748b", font=get_font(10))
    d.line([(610, 260), (1040, 260)], fill="#0f172a", width=2)
    
    d.text((610, 275), "SUMMARY", fill="#0f172a", font=get_font(12, bold=True))
    d.text((610, 292), "Dynamic engineer with proven expertise in React.js, Node.js, and Cloud Infrastructure.", fill="#334155", font=get_font(10))
    
    d.text((610, 325), "TECHNICAL SKILLS", fill="#0f172a", font=get_font(12, bold=True))
    d.text((610, 342), "Languages & Frameworks: React, Node.js, Python, TypeScript, Docker, MongoDB", fill="#334155", font=get_font(10))
    
    d.text((610, 375), "PROFESSIONAL EXPERIENCE", fill="#0f172a", font=get_font(12, bold=True))
    d.text((610, 392), "Full Stack Developer  |  TechVentures", fill="#1e293b", font=get_font(11, bold=True))
    d.text((610, 408), "• Built responsive cloud architectures handling 50,000+ daily requests.", fill="#475569", font=get_font(9))
    d.text((610, 422), "• Engineered mathematical matching services with zero regression.", fill="#475569", font=get_font(9))

    d.text((610, 455), "EDUCATION", fill="#0f172a", font=get_font(12, bold=True))
    d.text((610, 472), "B.Tech in Information Technology - National Engineering College (CGPA 8.9)", fill="#334155", font=get_font(10))

    img.save("screenshots/fig_resume_editor.png")

def create_jobs_page():
    img = Image.new("RGB", (1200, 750), color="#f8fafc")
    d = ImageDraw.Draw(img)
    draw_browser_chrome(d, 1200, "Job-Search")
    
    d.text((60, 115), "Job Search & Match Engine", fill="#0f172a", font=get_font(24, bold=True))
    
    # Search Bar
    d.rectangle([60, 160, 850, 205], fill="#ffffff", outline="#cbd5e1", width=1)
    d.text((80, 174), "🔍  Software Engineer React Node", fill="#1e293b", font=get_font(14))
    d.rectangle([870, 160, 1010, 205], fill="#2563eb")
    d.text((910, 174), "Search Jobs", fill="#ffffff", font=get_font(13, bold=True))
    d.rectangle([1020, 160, 1140, 205], fill="#f1f5f9", outline="#cbd5e1", width=1)
    d.text((1035, 174), "🔄 Sync Sources", fill="#475569", font=get_font(12))

    # Job Listings with Match breakdown
    listings = [
        ("Full-Stack Cloud Engineer", "NextGen Infotech", "Bangalore, India • Hybrid", "95% Match", "Skills: 100% | Title: 100% | Exp: 90%"),
        ("React & Frontend Specialist", "CloudScale Systems", "Remote • Full-time", "89% Match", "Skills: 88% | Title: 90% | Exp: 100%"),
        ("Financial Data Analyst", "FinCorp Global", "Chennai, India • Onsite", "82% Match", "Skills: 75% | Title: 85% | Exp: 100%"),
        ("DevOps / Infrastructure Engineer", "SkyNet Labs", "Remote • Full-time", "74% Match", "Skills: 70% | Title: 70% | Exp: 90%")
    ]
    
    ly = 230
    for title, company, loc, match, bd in listings:
        d.rectangle([60, ly, 1140, ly + 95], fill="#ffffff", outline="#e2e8f0", width=1)
        d.text((85, ly + 15), title, fill="#0f172a", font=get_font(17, bold=True))
        d.text((85, ly + 42), f"{company}  •  {loc}", fill="#64748b", font=get_font(13))
        d.text((85, ly + 68), bd, fill="#2563eb", font=get_font(12, bold=True))
        
        # Match score badge
        d.rectangle([980, ly + 25, 1110, ly + 70], fill="#dcfce7", outline="#86efac", width=1)
        d.text((1005, ly + 36), match, fill="#15803d", font=get_font(16, bold=True))
        ly += 115

    img.save("screenshots/fig_jobs.png")

def create_job_detail_page():
    img = Image.new("RGB", (1200, 750), color="#f8fafc")
    d = ImageDraw.Draw(img)
    draw_browser_chrome(d, 1200, "Job-Detail")
    
    d.text((60, 115), "Job Detail & Algorithmic Breakdown", fill="#0f172a", font=get_font(22, bold=True))
    
    # Left Details
    d.rectangle([60, 160, 750, 710], fill="#ffffff", outline="#e2e8f0", width=1)
    d.text((85, 185), "Senior Full-Stack Cloud Engineer", fill="#0f172a", font=get_font(20, bold=True))
    d.text((85, 218), "NextGen Infotech  •  Bangalore (Hybrid)  •  Posted 2 days ago", fill="#64748b", font=get_font(13))
    
    d.text((85, 270), "Job Description & Responsibilities:", fill="#0f172a", font=get_font(15, bold=True))
    d.text((85, 300), "We are seeking a seasoned Full-Stack Engineer to lead development of cloud-native", fill="#334155", font=get_font(13))
    d.text((85, 325), "web applications using React, Node.js, and Docker microservices.", fill="#334155", font=get_font(13))
    d.text((85, 350), "Responsibilities include designing scalable REST APIs, managing database schemas,", fill="#334155", font=get_font(13))
    d.text((85, 375), "and collaborating closely with product designers.", fill="#334155", font=get_font(13))
    
    d.text((85, 430), "Required Qualifications:", fill="#0f172a", font=get_font(15, bold=True))
    d.text((85, 460), "• 3+ years experience with React.js and modern JavaScript (ES6+)", fill="#334155", font=get_font(13))
    d.text((85, 485), "• Strong proficiency with Node.js, Express, and MongoDB", fill="#334155", font=get_font(13))
    d.text((85, 510), "• Practical knowledge of Docker containerization and AWS deployments", fill="#334155", font=get_font(13))
    
    d.rectangle([85, 580, 260, 630], fill="#2563eb")
    d.text((120, 595), "Apply on Company Site", fill="#ffffff", font=get_font(13, bold=True))
    d.rectangle([280, 580, 440, 630], fill="#f1f5f9", outline="#cbd5e1", width=1)
    d.text((310, 595), "Save to Tracker", fill="#334155", font=get_font(13))

    # Right Breakdown Box
    d.rectangle([780, 160, 1140, 710], fill="#ffffff", outline="#e2e8f0", width=1)
    d.text((805, 185), "Matching Calculation", fill="#0f172a", font=get_font(17, bold=True))
    
    d.ellipse([900, 225, 1020, 345], outline="#22c55e", width=8)
    d.text((935, 265), "95%", fill="#15803d", font=get_font(28, bold=True))
    d.text((920, 305), "Strong Match", fill="#64748b", font=get_font(12))
    
    breakdowns = [
        ("Skills Match (40%)", "100%", "#22c55e"),
        ("Role Title (20%)", "100%", "#22c55e"),
        ("Field Alignment (15%)", "100%", "#22c55e"),
        ("Experience (10%)", "90%", "#3b82f6"),
        ("Location (10%)", "90%", "#3b82f6"),
        ("Education (5%)", "100%", "#22c55e")
    ]
    by = 380
    for cat, val, col in breakdowns:
        d.text((805, by), cat, fill="#334155", font=get_font(12))
        d.text((1080, by), val, fill=col, font=get_font(12, bold=True))
        d.line([(805, by + 20), (1115, by + 20)], fill="#e2e8f0", width=1)
        by += 35
        
    d.text((805, 600), "Matched Skills:", fill="#166534", font=get_font(12, bold=True))
    d.text((805, 620), "React, Node.js, MongoDB, REST APIs", fill="#15803d", font=get_font(11))
    d.text((805, 650), "Missing Skills:", fill="#b91c1c", font=get_font(12, bold=True))
    d.text((805, 670), "Kubernetes, GraphQL", fill="#dc2626", font=get_font(11))

    img.save("screenshots/fig_job_detail.png")

def create_tracker_page():
    img = Image.new("RGB", (1200, 750), color="#f8fafc")
    d = ImageDraw.Draw(img)
    draw_browser_chrome(d, 1200, "Applications-Tracker")
    
    d.text((60, 115), "Application Status Tracker", fill="#0f172a", font=get_font(24, bold=True))
    d.text((60, 150), "Kanban pipeline tracking your job submissions across all active career fields.", fill="#64748b", font=get_font(14))
    
    columns = [
        ("Bookmarked (3)", "#f1f5f9", [("Full-Stack Eng", "NextGen", "95%"), ("DevOps Lead", "SkyNet", "74%")]),
        ("Applied (4)", "#eff6ff", [("Frontend Specialist", "CloudScale", "89%"), ("React Developer", "InnoWave", "82%")]),
        ("Interviewing (2)", "#fef3c7", [("Cloud Architect", "Apex FinServe", "88%")]),
        ("Offer / Accepted (1)", "#f0fdf4", [("Senior Developer", "GlobalTech", "91%")])
    ]
    
    cx = 60
    for col_title, col_bg, items in columns:
        d.rectangle([cx, 190, cx + 250, 690], fill=col_bg, outline="#cbd5e1", width=1)
        d.text((cx + 15, 205), col_title, fill="#0f172a", font=get_font(14, bold=True))
        
        iy = 245
        for title, company, score in items:
            d.rectangle([cx + 12, iy, cx + 238, iy + 90], fill="#ffffff", outline="#e2e8f0", width=1)
            d.text((cx + 22, iy + 12), title, fill="#0f172a", font=get_font(13, bold=True))
            d.text((cx + 22, iy + 35), company, fill="#64748b", font=get_font(11))
            d.rectangle([cx + 22, iy + 58, cx + 85, iy + 78], fill="#dbeafe")
            d.text((cx + 30, iy + 62), score, fill="#1e40af", font=get_font(10, bold=True))
            iy += 105
        cx += 275

    img.save("screenshots/fig_tracker.png")

def create_skillgap_page():
    img = Image.new("RGB", (1200, 750), color="#f8fafc")
    d = ImageDraw.Draw(img)
    draw_browser_chrome(d, 1200, "Skill-Gap-Analysis")
    
    d.text((60, 115), "Skill Gap Analysis & Recommendations", fill="#0f172a", font=get_font(24, bold=True))
    d.text((60, 150), "Mathematical analysis comparing your profile against market requirements for target roles.", fill="#64748b", font=get_font(14))
    
    # Summary Bar
    d.rectangle([60, 190, 1140, 260], fill="#ffffff", outline="#e2e8f0", width=1)
    d.text((85, 212), "Field: Software & IT", fill="#0f172a", font=get_font(16, bold=True))
    d.text((320, 212), "Target Role: Full-Stack Cloud Architect", fill="#475569", font=get_font(14))
    d.text((750, 212), "Skill Coverage Index: 78.4%", fill="#2563eb", font=get_font(15, bold=True))
    
    # Gap cards
    gaps = [
        ("High Priority Gap: Kubernetes & Container Orchestration", "Required in 68% of targeted roles. Adding this increases match score by +12%.", "Learning Resources: CNCF Official Tutorials, Minikube Labs"),
        ("Moderate Priority Gap: GraphQL API Querying", "Frequently requested alongside React.js in 42% of postings. Expected score boost: +6%.", "Learning Resources: Apollo GraphQL Documentation"),
        ("Recommended Skill: Microservices Architecture Patterns", "Complementary knowledge for Senior Engineer roles. Boosts title and skill weights.", "Learning Resources: Martin Fowler Architectural Guides")
    ]
    
    gy = 285
    for title, desc, res in gaps:
        d.rectangle([60, gy, 1140, gy + 115], fill="#ffffff", outline="#e2e8f0", width=1)
        d.text((85, gy + 15), title, fill="#dc2626", font=get_font(15, bold=True))
        d.text((85, gy + 45), desc, fill="#334155", font=get_font(13))
        d.text((85, gy + 75), res, fill="#166534", font=get_font(12, bold=True))
        gy += 135

    img.save("screenshots/fig_skillgap.png")

def create_settings_page():
    img = Image.new("RGB", (1200, 750), color="#f8fafc")
    d = ImageDraw.Draw(img)
    draw_browser_chrome(d, 1200, "Settings")
    
    d.text((60, 115), "Account & Platform Settings", fill="#0f172a", font=get_font(24, bold=True))
    
    d.rectangle([60, 160, 800, 700], fill="#ffffff", outline="#e2e8f0", width=1)
    d.text((85, 185), "Profile & Notification Preferences", fill="#0f172a", font=get_font(16, bold=True))
    
    d.text((85, 230), "Notification Threshold (Job Match Score)", fill="#334155", font=get_font(13, bold=True))
    d.rectangle([85, 260, 400, 300], fill="#f8fafc", outline="#cbd5e1", width=1)
    d.text((100, 272), "Alert on jobs with ≥ 70% match", fill="#1e293b", font=get_font(13))
    
    d.text((85, 330), "Theme & Motion Preferences", fill="#334155", font=get_font(13, bold=True))
    d.text((85, 360), "☑ Dark Mode Support (System Theme / Manual)", fill="#475569", font=get_font(13))
    d.text((85, 395), "☑ Respect Reduce Motion Preferences", fill="#475569", font=get_font(13))
    
    d.text((85, 455), "Data Integrity & Reset Utility", fill="#dc2626", font=get_font(14, bold=True))
    d.text((85, 485), "Wipe temporary cache and re-synchronize default templates with `npm run reset`.", fill="#64748b", font=get_font(12))
    d.rectangle([85, 520, 280, 565], fill="#ef4444")
    d.text((115, 534), "Reset Platform Data", fill="#ffffff", font=get_font(13, bold=True))
    
    img.save("screenshots/fig_settings.png")

# Flowcharts and Mathematical Model Diagram (Black and White strictly)
def create_bw_workflow_diagram():
    img = Image.new("RGB", (1000, 1100), color="#ffffff")
    d = ImageDraw.Draw(img)
    
    # Title
    d.text((280, 30), "CAREERSYNC AI - SYSTEM WORKFLOW", fill="#000000", font=get_font(18, bold=True))
    
    # Boxes
    boxes = [
        (350, 80, 650, 130, "User Access / Web Browser"),
        (350, 170, 650, 230, "Authentication & JWT Token\n(Email/Password or OAuth)"),
        (350, 270, 650, 330, "Multi-Field Onboarding\n(Select from 29 Fields)"),
        (350, 370, 650, 430, "Career Profile Management\n(Skills, Roles, Experience, Education)"),
    ]
    
    for x1, y1, x2, y2, text in boxes:
        d.rectangle([x1, y1, x2, y2], outline="#000000", width=2)
        lines = text.split("\n")
        if len(lines) == 1:
            d.text((x1 + 30, y1 + 15), lines[0], fill="#000000", font=get_font(13, bold=True))
        else:
            d.text((x1 + 25, y1 + 10), lines[0], fill="#000000", font=get_font(13, bold=True))
            d.text((x1 + 35, y1 + 30), lines[1], fill="#000000", font=get_font(11))
            
    # Connectors
    for y in [130, 230, 330]:
        d.line([(500, y), (500, y + 40)], fill="#000000", width=2)
        d.polygon([(495, y + 35), (505, y + 35), (500, y + 40)], fill="#000000")

    # Branching bar
    d.line([(500, 430), (500, 480)], fill="#000000", width=2)
    d.line([(150, 480), (850, 480)], fill="#000000", width=2)
    
    # 3 Branches
    branches = [
        (50, 520, 280, 620, "Resume Builder Module\n• 17 ATS Templates\n• Live Preview\n• Download PDF (A4)"),
        (370, 520, 630, 620, "Job Search & Scraper\n• Adzuna & Remotive APIs\n• Scheduled Auto-Sync\n• Multi-Field Filter"),
        (720, 520, 950, 620, "Skill Gap Engine\n• Market Skill Aggregation\n• Deficit Detection\n• Resource Roadmap")
    ]
    
    for x1, y1, x2, y2, text in branches:
        d.line([( (x1+x2)//2, 480), ((x1+x2)//2, y1)], fill="#000000", width=2)
        d.polygon([( (x1+x2)//2 - 5, y1 - 5), ((x1+x2)//2 + 5, y1 - 5), ((x1+x2)//2, y1)], fill="#000000")
        d.rectangle([x1, y1, x2, y2], outline="#000000", width=2)
        lines = text.split("\n")
        d.text((x1 + 15, y1 + 10), lines[0], fill="#000000", font=get_font(12, bold=True))
        for idx, l in enumerate(lines[1:], 1):
            d.text((x1 + 15, y1 + 12 + idx * 20), l, fill="#000000", font=get_font(11))
            
    # Join into Algorithmic Matching
    for x in [165, 500, 835]:
        d.line([(x, 620), (x, 680)], fill="#000000", width=2)
    d.line([(165, 680), (835, 680)], fill="#000000", width=2)
    d.line([(500, 680), (500, 720)], fill="#000000", width=2)
    d.polygon([(495, 715), (505, 715), (500, 720)], fill="#000000")
    
    # Matching Module Box
    d.rectangle([300, 720, 700, 800], outline="#000000", width=2)
    d.text((320, 730), "MATHEMATICAL MATCHING ENGINE", fill="#000000", font=get_font(13, bold=True))
    d.text((320, 755), "Weighted Model (Skills, Title, Exp, Loc, Field, Edu)", fill="#000000", font=get_font(11))
    d.text((320, 775), "Jaccard Tokenization Overlap & Scoring (0-100%)", fill="#000000", font=get_font(11))
    
    # Application Tracker Box
    d.line([(500, 800), (500, 840)], fill="#000000", width=2)
    d.polygon([(495, 835), (505, 835), (500, 840)], fill="#000000")
    
    d.rectangle([300, 840, 700, 910], outline="#000000", width=2)
    d.text((350, 852), "Job Application Tracker", fill="#000000", font=get_font(13, bold=True))
    d.text((330, 875), "Kanban Pipeline: Bookmarked → Applied → Offer", fill="#000000", font=get_font(11))
    
    # End
    d.line([(500, 910), (500, 950)], fill="#000000", width=2)
    d.polygon([(495, 945), (505, 945), (500, 950)], fill="#000000")
    d.ellipse([420, 950, 580, 990], outline="#000000", width=2)
    d.text((455, 962), "Career Outcome", fill="#000000", font=get_font(12, bold=True))

    img.save("figures/fig_workflow_bw.png")

def create_bw_math_model_diagram():
    img = Image.new("RGB", (1000, 700), color="#ffffff")
    d = ImageDraw.Draw(img)
    
    d.text((250, 30), "MATHEMATICAL JOB MATCHING MODEL ARCHITECTURE", fill="#000000", font=get_font(16, bold=True))
    
    # Left inputs
    inputs = [
        ("Candidate Profile Skills", "Job Required Skills", "P_skills (Weight: 40%)"),
        ("Target Roles / Title", "Posting Job Title", "P_title (Weight: 20%)"),
        ("Selected Career Field", "Job Category / Field", "P_field (Weight: 15%)"),
        ("Experience Level", "Minimum Years Required", "P_exp (Weight: 10%)"),
        ("Preferred Work Mode & City", "Job Location / Remote", "P_loc (Weight: 10%)"),
        ("Education Credentials", "Minimum Degree", "P_edu (Weight: 5%)")
    ]
    
    iy = 80
    for cand, job, comp in inputs:
        d.rectangle([50, iy, 260, iy + 35], outline="#000000", width=1)
        d.text((58, iy + 10), cand, fill="#000000", font=get_font(10, bold=True))
        
        d.rectangle([280, iy, 490, iy + 35], outline="#000000", width=1)
        d.text((288, iy + 10), job, fill="#000000", font=get_font(10, bold=True))
        
        d.line([(490, iy + 17), (530, iy + 17)], fill="#000000", width=1)
        d.polygon([(525, iy + 14), (525, iy + 20), (530, iy + 17)], fill="#000000")
        
        d.rectangle([530, iy, 720, iy + 35], outline="#000000", width=1)
        d.text((540, iy + 10), comp, fill="#000000", font=get_font(10, bold=True))
        
        d.line([(720, iy + 17), (760, 310)], fill="#000000", width=1)
        iy += 75

    # Center aggregation box
    d.rectangle([760, 240, 950, 420], outline="#000000", width=2)
    d.text((775, 260), "WEIGHTED SUM", fill="#000000", font=get_font(13, bold=True))
    d.text((790, 285), "AGGREGATOR", fill="#000000", font=get_font(12, bold=True))
    d.text((775, 320), "S_match = Σ(P_k*W_k)", fill="#000000", font=get_font(10))
    d.text((810, 345), "/ Σ W_k * 100", fill="#000000", font=get_font(10))
    d.text((775, 380), "Range: 0% to 100%", fill="#000000", font=get_font(10, bold=True))

    # Output Arrow
    d.line([(855, 420), (855, 490)], fill="#000000", width=2)
    d.polygon([(850, 485), (860, 485), (855, 490)], fill="#000000")
    
    # Severity & Tier Classifications
    d.rectangle([710, 490, 980, 650], outline="#000000", width=2)
    d.text((730, 505), "MATCH SEVERITY TIERS", fill="#000000", font=get_font(11, bold=True))
    d.text((730, 535), "• Excellent (85% - 100%): Direct Fit", fill="#000000", font=get_font(10))
    d.text((730, 560), "• Strong (70% - 84%): Core Match", fill="#000000", font=get_font(10))
    d.text((730, 585), "• Moderate (50% - 69%): Potential Fit", fill="#000000", font=get_font(10))
    d.text((730, 610), "• Low (< 50%): Major Skill Deficit", fill="#000000", font=get_font(10))

    img.save("figures/fig_math_model_bw.png")

print("Generating all screenshots and diagrams...")
create_landing_page()
create_auth_page()
create_dashboard_page()
create_onboarding_page()
create_profile_page()
create_resume_gallery_page()
create_resume_editor_page()
create_jobs_page()
create_job_detail_page()
create_tracker_page()
create_skillgap_page()
create_settings_page()
create_bw_workflow_diagram()
create_bw_math_model_diagram()
print("All screenshots and diagrams generated successfully!")
