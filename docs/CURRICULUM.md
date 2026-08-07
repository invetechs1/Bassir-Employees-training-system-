# BCAP Starter Curriculum — Role-Based Training Library

BCAP ships with a **bilingual (English / Arabic) library of ready-made courses**,
organized by specialist track, so a new company has real training content on day
one instead of an empty catalog. The content is Saudi/GCC-aware (VAT & ZATCA
e-invoicing, Saudi Labor Law, Nitaqat, PDPL) and intentionally generic so any
customer can adopt it and then extend it.

**At a glance:** 10 specialist tracks · 10 courses · ~59 lessons · a graded
**quiz** at the end of every course (34 questions total).

- **Source of truth:** `src/lib/curriculum.ts`
- **Installed by:** the seed (demo tenants), `npm run provision` (new companies,
  automatic), and `npm run seed:curriculum -- --slug <company>` / `--all`.
- **Data model:** each program → ordered **modules** → ordered **lessons**
  (Reading / Video / Resource / **Quiz**). Learner **progress is derived** from
  completed lessons; a **quiz lesson only completes when the learner passes**
  (default pass mark 70%). Each program links to a **competency**.

> This document is the human-readable outline. Editing `src/lib/curriculum.ts`
> and re-running the installer is how you change it.

---

## Tracks & courses

Every course below ends with a bilingual **Knowledge Check quiz** (multiple
choice, one correct answer, with explanations).

| # | Track (department) | Course | Level |
|---|---|---|---|
| 1 | **Accounting & Finance** · المحاسبة والمالية | Financial Fundamentals for Accountants | Foundation |
| 2 | **Human Resources** · الموارد البشرية | HR Essentials & Saudi Labor Law | Intermediate |
| 3 | **Project Management** · إدارة المشاريع | Project Management Foundations | Intermediate |
| 4 | **Executive / COO** · القيادة التنفيذية | Operational Leadership for Executives | Leadership |
| 5 | **Sales & Business Development** · المبيعات وتطوير الأعمال | Sales Fundamentals | Foundation |
| 6 | **Information Technology** · تقنية المعلومات | IT & Cybersecurity Essentials | Intermediate |
| 7 | **Health, Safety & Environment** · الصحة والسلامة | Workplace Safety (HSE) Essentials | Foundation |
| 8 | **Procurement & Supply Chain** · المشتريات وسلسلة الإمداد | Procurement & Supply Chain Basics | Foundation |
| 9 | **Operations & Warehousing** · العمليات والمستودعات | Operations & Warehouse Management | Foundation |
| 10 | **Customer Service** · خدمة العملاء | Customer Service Excellence | Foundation |

### Topic highlights

- **Accounting & Finance** — double entry, the financial statements, **VAT 15% & ZATCA e-invoicing (Fatoorah)**.
- **Human Resources** — hiring & performance, **Saudi Labor Law**, **Nitaqat (Saudization)**, **PDPL**.
- **Project Management** — lifecycle, WBS & scheduling, **Earned Value (EVM)**, risk & stakeholders.
- **Executive / COO** — KPIs/OKRs, financial acumen, Lean & Theory of Constraints, leading change.
- **Sales** — buyer needs, qualifying (need/budget/authority/timing), objections & closing, account growth.
- **Information Technology** — core IT & cloud, backups (3-2-1), **passwords/MFA, phishing**, data protection.
- **HSE / Safety** — hazards & the hierarchy of controls, PPE, incident/near-miss reporting, emergencies & fire.
- **Procurement & Supply Chain** — procurement cycle & three-way match, supplier evaluation, inventory (ABC), logistics.
- **Operations & Warehousing** — receiving/put-away/picking, inventory accuracy & **5S**, Lean, warehouse safety.
- **Customer Service** — service mindset, active listening, the **LAST** complaint method, service recovery.

---

## Assessments (quizzes)

- Quiz lessons carry a **question bank** (`Question` + `QuestionOption`).
- Learners submit answers; `submitQuizAction` grades them and records a
  `QuizAttempt`. Passing (≥ the lesson's `passMark`) marks the lesson complete
  and advances the course progress bar.
- Correct answers are never sent to the browser until after grading.

---

## Extending the library

1. Edit `src/lib/curriculum.ts` — add a program, module, lesson, or quiz
   question (keep the `key` unique and fill both English and Arabic fields).
2. Re-run the installer: `npm run seed:curriculum -- --all` (idempotent —
   existing programs are skipped, new ones are added).
3. Company admins can also author their own programs and lessons directly in the
   app (**Training → New program**), which live alongside the shipped library.

Content is written in Markdown; see `src/lib/markdown.ts` for the supported
subset (headings, lists, bold/italic, inline code, and http/mailto links only —
all HTML is escaped for safety).
