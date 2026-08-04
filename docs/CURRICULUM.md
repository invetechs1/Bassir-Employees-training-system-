# BCAP Starter Curriculum — Role-Based Training Library

BCAP ships with a **bilingual (English / Arabic) library of ready-made courses**,
organized by specialist track, so a new company has real training content on day
one instead of an empty catalog. The content is Saudi/GCC-aware (VAT & ZATCA
e-invoicing, Saudi Labor Law, Nitaqat, PDPL) and intentionally generic so any
customer can adopt it and then extend it.

- **Source of truth:** `src/lib/curriculum.ts`
- **Installed by:** the seed (demo tenants), `npm run provision` (new companies,
  automatic), and `npm run seed:curriculum -- --slug <company>` / `--all`.
- **Data model:** each program → ordered **modules** → ordered **lessons**
  (Reading / Video / Resource). Learner **progress is derived** from completed
  lessons, and each program links to a **competency** in the framework.

> This document is the human-readable outline of the shipped library. Editing
> `src/lib/curriculum.ts` and re-running the installer is how you change it.

---

## Track 1 — Accounting & Finance · المحاسبة والمالية

### Financial Fundamentals for Accountants · الأساسيات المالية للمحاسبين
*Level: Foundation · Competency: Financial Accounting*

Core accounting principles, the financial statements, and Saudi VAT &
e-invoicing (ZATCA) every accountant must master.

1. **Accounting Foundations · أسس المحاسبة**
   - The Accounting Equation & Double Entry · المعادلة المحاسبية والقيد المزدوج
   - The Accounting Cycle · الدورة المحاسبية
2. **The Financial Statements · القوائم المالية**
   - Reading the Three Core Statements · قراءة القوائم الأساسية الثلاث
   - IFRS Standards — Official Reference *(resource)* · معايير IFRS — المرجع الرسمي
3. **Saudi VAT & E-Invoicing · ضريبة القيمة المضافة والفوترة الإلكترونية**
   - VAT Basics (15%) and Input/Output Tax · أساسيات ضريبة القيمة المضافة (١٥٪)
   - ZATCA E-Invoicing (Fatoorah) · الفوترة الإلكترونية (فاتورة)
   - ZATCA E-Invoicing — Official Portal *(resource)* · بوابة الفوترة الإلكترونية

---

## Track 2 — Human Resources · الموارد البشرية

### HR Essentials & Saudi Labor Law · أساسيات الموارد البشرية ونظام العمل السعودي
*Level: Intermediate · Competency: People Management*

The HR lifecycle from hiring to offboarding, grounded in the Saudi Labor Law,
Saudization (Nitaqat) and PDPL data protection.

1. **The Employee Lifecycle · دورة حياة الموظف**
   - Hiring & Onboarding Done Right · التوظيف والإعداد الوظيفي بالشكل الصحيح
   - Performance Management & Reviews · إدارة الأداء والتقييمات
2. **Saudi Labor Law Essentials · أساسيات نظام العمل السعودي**
   - Contracts, Working Hours & End-of-Service · العقود وساعات العمل ومكافأة نهاية الخدمة
   - Saudi Labor Law — Official Text *(resource)* · نظام العمل السعودي — النص الرسمي
3. **Saudization & Data Protection · السعودة وحماية البيانات**
   - Nitaqat (Saudization) for HR · نطاقات (السعودة) للموارد البشرية
   - PDPL — Protecting Employee Data · نظام حماية البيانات الشخصية

---

## Track 3 — Project Management · إدارة المشاريع

### Project Management Foundations · أساسيات إدارة المشاريع
*Level: Intermediate · Competency: Project Delivery*

Plan, execute and control projects using scope, schedule, cost, risk and
stakeholder practices aligned with PMI/PMBOK.

1. **Project Basics & Lifecycle · أساسيات المشروع ودورة حياته**
   - What Is a Project? Phases & Constraints · ما المشروع؟ المراحل والقيود
   - Predictive vs. Agile Delivery · التسليم التنبّئي مقابل الرشيق
2. **Planning: Scope, Schedule, Cost · التخطيط: النطاق والجدول والتكلفة**
   - Work Breakdown Structure & Scheduling · هيكل تجزئة العمل والجدولة
   - Budgeting & Earned Value (EVM) · الموازنة والقيمة المكتسبة
3. **Risk & Stakeholders · المخاطر وأصحاب المصلحة**
   - Managing Risk Proactively · إدارة المخاطر بشكل استباقي
   - Stakeholder Engagement & Communication · إشراك أصحاب المصلحة والتواصل

---

## Track 4 — Executive / COO · القيادة التنفيذية

### Operational Leadership for Executives · القيادة التشغيلية للتنفيذيين
*Level: Leadership · Competency: Strategic Leadership*

Translate strategy into operations: KPIs and dashboards, process excellence,
financial acumen and leading through change.

1. **Strategy into Execution · من الاستراتيجية إلى التنفيذ**
   - KPIs, OKRs & the Executive Dashboard · مؤشرات الأداء والأهداف والنتائج
   - Financial Acumen for Non-Finance Leaders · الفطنة المالية للقادة
2. **Operational Excellence · التميّز التشغيلي**
   - Process Thinking: Lean & Bottlenecks · التفكير بالعمليات: اللين والاختناقات
   - Decision-Making Under Uncertainty · اتخاذ القرار في ظل عدم اليقين
3. **Leading People & Change · قيادة الناس والتغيير**
   - Building & Developing High-Performing Teams · بناء وتطوير فرق عالية الأداء
   - Leading Organizational Change · قيادة التغيير المؤسسي

---

## Extending the library

1. Edit `src/lib/curriculum.ts` — add a program, module or lesson (keep the
   `key` unique and fill both English and Arabic fields).
2. Re-run the installer: `npm run seed:curriculum -- --all` (idempotent —
   existing programs are skipped, new ones are added).
3. Company admins can also author their own programs and lessons directly in the
   app (**Training → New program**), which live alongside the shipped library.

Content is written in Markdown; see `src/lib/markdown.ts` for the supported
subset (headings, lists, bold/italic, inline code, and http/mailto links only —
all HTML is escaped for safety).
