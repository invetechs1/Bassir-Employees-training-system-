/**
 * BCAP starter curriculum — a bilingual (EN/AR) library of ready-made,
 * role-based training content. This is the "material" that ships WITH the
 * platform so a new company has real courses on day one, organized by
 * specialist track (Accounting, HR, Project Management, Executive/COO).
 *
 * The data here is installed into a tenant by src/lib/curriculum-install.ts
 * (used by the seed, the provisioning script, and `npm run seed:curriculum`).
 * It is intentionally generic, Saudi/GCC-aware, and free of company-specific
 * detail so any customer can adopt and then extend it.
 *
 * Content is written in Markdown (see src/lib/markdown.ts for the renderer).
 */

export type CurriculumLessonType = "TEXT" | "VIDEO" | "RESOURCE" | "QUIZ";

export interface CurriculumQuestionOption {
  text: string;
  textAr: string;
  correct?: boolean;
}

export interface CurriculumQuestion {
  prompt: string;
  promptAr: string;
  type?: "SINGLE" | "TRUE_FALSE";
  options: CurriculumQuestionOption[];
  explanation?: string;
  explanationAr?: string;
}

export interface CurriculumLesson {
  title: string;
  titleAr: string;
  type: CurriculumLessonType;
  durationMinutes: number;
  /** Markdown body for TEXT; a URL for VIDEO/RESOURCE; "" for QUIZ. */
  content: string;
  contentAr: string;
  /** Pass mark (%) for QUIZ lessons. */
  passMark?: number;
  /** Question bank for QUIZ lessons. */
  questions?: CurriculumQuestion[];
}

export interface CurriculumModule {
  title: string;
  titleAr: string;
  lessons: CurriculumLesson[];
}

export interface CurriculumProgram {
  /** Stable key used for idempotent install (matched, never shown). */
  key: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  /** Specialist track (English label; localized in the UI via `track.*`). */
  category: string;
  level: "FOUNDATION" | "INTERMEDIATE" | "ADVANCED" | "LEADERSHIP";
  /** Linked competency (created if missing) for the competency framework. */
  competency: string;
  competencyAr: string;
  modules: CurriculumModule[];
}

/** The four specialist tracks shipped in the starter library. */
export const TRACKS = [
  { key: "Accounting & Finance", en: "Accounting & Finance", ar: "المحاسبة والمالية" },
  { key: "Human Resources", en: "Human Resources", ar: "الموارد البشرية" },
  { key: "Project Management", en: "Project Management", ar: "إدارة المشاريع" },
  { key: "Executive / COO", en: "Executive / COO", ar: "القيادة التنفيذية" },
] as const;

export const CURRICULUM: CurriculumProgram[] = [
  // =========================================================================
  // 1) ACCOUNTING & FINANCE
  // =========================================================================
  {
    key: "acc-fundamentals",
    title: "Financial Fundamentals for Accountants",
    titleAr: "الأساسيات المالية للمحاسبين",
    description:
      "Core accounting principles, the financial statements, and Saudi VAT & e-invoicing (ZATCA) every accountant must master.",
    descriptionAr:
      "مبادئ المحاسبة الأساسية والقوائم المالية وضريبة القيمة المضافة والفوترة الإلكترونية (هيئة الزكاة والضريبة والجمارك) التي يجب أن يتقنها كل محاسب.",
    category: "Accounting & Finance",
    level: "FOUNDATION",
    competency: "Financial Accounting",
    competencyAr: "المحاسبة المالية",
    modules: [
      {
        title: "Accounting Foundations",
        titleAr: "أسس المحاسبة",
        lessons: [
          {
            title: "The Accounting Equation & Double Entry",
            titleAr: "المعادلة المحاسبية والقيد المزدوج",
            type: "TEXT",
            durationMinutes: 20,
            content: `## Why double entry?

Every business transaction affects **at least two accounts**, keeping the accounting equation in balance:

**Assets = Liabilities + Equity**

For every debit there is an equal and opposite credit. This self-checking structure is why the balance sheet always balances.

### Debits and credits

- **Assets & expenses** increase with a *debit*.
- **Liabilities, equity & income** increase with a *credit*.

### Worked example

A company buys a laptop for SAR 5,000 cash:

- Debit *Equipment* (asset up) SAR 5,000
- Credit *Cash* (asset down) SAR 5,000

Total debits equal total credits, so the books stay balanced.

> Master this and every later topic — the trial balance, financial statements, VAT entries — becomes mechanical.`,
            contentAr: `## لماذا القيد المزدوج؟

كل عملية مالية تؤثر على **حسابين على الأقل**، مما يحافظ على توازن المعادلة المحاسبية:

**الأصول = الالتزامات + حقوق الملكية**

لكل مدين طرف دائن مساوٍ ومعاكس. هذا البناء ذاتي التدقيق هو سبب توازن الميزانية دائمًا.

### المدين والدائن

- **الأصول والمصروفات** تزيد بـ *المدين*.
- **الالتزامات وحقوق الملكية والإيرادات** تزيد بـ *الدائن*.

### مثال تطبيقي

شركة تشتري حاسبًا محمولًا بمبلغ ٥٬٠٠٠ ريال نقدًا:

- من حساب *المعدات* (زيادة أصل) ٥٬٠٠٠ ريال
- إلى حساب *النقدية* (نقص أصل) ٥٬٠٠٠ ريال

إجمالي المدين يساوي إجمالي الدائن، فتبقى الدفاتر متوازنة.

> أتقن هذا المبدأ، وستصبح كل المواضيع اللاحقة — ميزان المراجعة والقوائم المالية وقيود الضريبة — عملية آلية.`,
          },
          {
            title: "The Accounting Cycle",
            titleAr: "الدورة المحاسبية",
            type: "TEXT",
            durationMinutes: 18,
            content: `## From transaction to statements

The **accounting cycle** is the repeatable process that turns raw transactions into financial statements:

1. **Identify & record** transactions in the journal.
2. **Post** to the general ledger.
3. **Trial balance** — check debits equal credits.
4. **Adjusting entries** — accruals, prepayments, depreciation.
5. **Adjusted trial balance**.
6. **Financial statements** — income statement, balance sheet, cash flow.
7. **Close** temporary accounts into retained earnings.

### Accruals vs. cash

Under **accrual accounting** (required for most companies) you record revenue when *earned* and expenses when *incurred* — not when cash moves. This gives a truer picture of performance in a period.`,
            contentAr: `## من العملية إلى القوائم

**الدورة المحاسبية** هي العملية المتكررة التي تحوّل العمليات الأولية إلى قوائم مالية:

1. **تحديد وتسجيل** العمليات في اليومية.
2. **الترحيل** إلى دفتر الأستاذ العام.
3. **ميزان المراجعة** — التأكد من تساوي المدين والدائن.
4. **قيود التسوية** — الاستحقاقات والمصروفات المدفوعة مقدمًا والإهلاك.
5. **ميزان المراجعة بعد التسوية**.
6. **القوائم المالية** — قائمة الدخل والميزانية والتدفقات النقدية.
7. **الإقفال** للحسابات المؤقتة ضمن الأرباح المبقاة.

### الاستحقاق مقابل النقد

في **محاسبة الاستحقاق** (المطلوبة لمعظم الشركات) تُسجّل الإيراد عند *تحققه* والمصروف عند *حدوثه* — لا عند حركة النقد. هذا يعطي صورة أصدق للأداء خلال الفترة.`,
          },
        ],
      },
      {
        title: "The Financial Statements",
        titleAr: "القوائم المالية",
        lessons: [
          {
            title: "Reading the Three Core Statements",
            titleAr: "قراءة القوائم الأساسية الثلاث",
            type: "TEXT",
            durationMinutes: 22,
            content: `## The three statements tie together

- **Income statement** — revenue minus expenses over a period → net profit.
- **Balance sheet** — assets, liabilities and equity at a point in time.
- **Cash flow statement** — cash in/out across operating, investing and financing.

Net profit flows into equity (retained earnings) on the balance sheet; cash changes reconcile to the cash line. If you can explain how a single sale moves all three, you understand the model.

### A few ratios that matter

- **Current ratio** = current assets / current liabilities (liquidity).
- **Gross margin** = gross profit / revenue (pricing & cost control).
- **Debt-to-equity** = total liabilities / equity (leverage).

Saudi companies report under **IFRS** as adopted by SOCPA.`,
            contentAr: `## القوائم الثلاث مترابطة

- **قائمة الدخل** — الإيراد ناقص المصروفات خلال فترة ← صافي الربح.
- **الميزانية العمومية** — الأصول والالتزامات وحقوق الملكية في لحظة زمنية.
- **قائمة التدفقات النقدية** — الداخل والخارج من النقد عبر التشغيل والاستثمار والتمويل.

يتدفق صافي الربح إلى حقوق الملكية (الأرباح المبقاة) في الميزانية، وتتطابق تغيرات النقد مع بند النقدية. إذا استطعت شرح كيف تُحرّك عملية بيع واحدة القوائم الثلاث، فقد فهمت النموذج.

### نسب مهمة

- **نسبة التداول** = الأصول المتداولة / الالتزامات المتداولة (السيولة).
- **هامش الربح الإجمالي** = الربح الإجمالي / الإيراد (التسعير وضبط التكلفة).
- **الدين إلى حقوق الملكية** = إجمالي الالتزامات / حقوق الملكية (الرافعة).

تُعدّ الشركات السعودية تقاريرها وفق **المعايير الدولية IFRS** المعتمدة من الهيئة السعودية للمراجعين والمحاسبين (سوكبا).`,
          },
          {
            title: "IFRS Standards — Official Reference",
            titleAr: "معايير IFRS — المرجع الرسمي",
            type: "RESOURCE",
            durationMinutes: 10,
            content: "https://www.ifrs.org/issued-standards/list-of-standards/",
            contentAr: "https://www.ifrs.org/issued-standards/list-of-standards/",
          },
        ],
      },
      {
        title: "Saudi VAT & E-Invoicing",
        titleAr: "ضريبة القيمة المضافة والفوترة الإلكترونية",
        lessons: [
          {
            title: "VAT Basics (15%) and Input/Output Tax",
            titleAr: "أساسيات ضريبة القيمة المضافة (١٥٪) وضريبة المدخلات والمخرجات",
            type: "TEXT",
            durationMinutes: 20,
            content: `## VAT in Saudi Arabia

The standard VAT rate is **15%**. As an accountant you track two sides:

- **Output tax** — VAT you charge customers on sales.
- **Input tax** — VAT you pay suppliers on purchases.

Your VAT payable to ZATCA = **output tax − recoverable input tax** for the period.

### Practical rules

- Issue compliant **tax invoices** with the buyer/seller VAT numbers.
- Keep records for the statutory retention period.
- File returns **monthly or quarterly** depending on turnover, on time — late filing carries penalties.

Some supplies are **zero-rated** (e.g. exports) or **exempt** (certain financial services); the treatment changes whether input tax is recoverable.`,
            contentAr: `## ضريبة القيمة المضافة في السعودية

النسبة القياسية للضريبة **١٥٪**. كمحاسب، تتابع جانبين:

- **ضريبة المخرجات** — الضريبة التي تحصّلها من العملاء على المبيعات.
- **ضريبة المدخلات** — الضريبة التي تدفعها للموردين على المشتريات.

الضريبة المستحقة للهيئة = **ضريبة المخرجات − ضريبة المدخلات القابلة للاسترداد** خلال الفترة.

### قواعد عملية

- أصدر **فواتير ضريبية** نظامية تتضمن الأرقام الضريبية للبائع والمشتري.
- احتفظ بالسجلات للمدة النظامية المقررة.
- قدّم الإقرارات **شهريًا أو ربع سنوي** حسب حجم الإيرادات وفي موعدها — فالتأخر يترتب عليه غرامات.

بعض التوريدات **خاضعة بنسبة صفر** (كالصادرات) أو **معفاة** (بعض الخدمات المالية)، ويغيّر ذلك إمكانية استرداد ضريبة المدخلات.`,
          },
          {
            title: "ZATCA E-Invoicing (Fatoorah)",
            titleAr: "الفوترة الإلكترونية (فاتورة) لدى الهيئة",
            type: "TEXT",
            durationMinutes: 18,
            content: `## E-invoicing is mandatory

Saudi Arabia's **e-invoicing (Fatoorah)** program runs in two phases:

1. **Generation phase** — invoices must be created in a structured electronic format (no handwritten/PDF-only invoices).
2. **Integration phase** — your billing system integrates with ZATCA's platform (**FATOORA**) so invoices are cleared/reported in real time, carrying a cryptographic stamp and QR code.

### What accountants must ensure

- The billing/ERP system is an **approved, compliant** solution.
- Each tax invoice includes the required fields and a scannable **QR code**.
- Integration credentials and certificates are kept valid.

Non-compliance carries financial penalties, so coordinate early with IT and your solution provider.`,
            contentAr: `## الفوترة الإلكترونية إلزامية

يُطبّق برنامج **الفوترة الإلكترونية (فاتورة)** في السعودية على مرحلتين:

1. **مرحلة الإصدار** — يجب إنشاء الفواتير بصيغة إلكترونية منظمة (لا فواتير يدوية أو PDF فقط).
2. **مرحلة الربط** — يتكامل نظام الفوترة لديك مع منصة الهيئة (**فاتورة**) بحيث تُدقّق/تُبلّغ الفواتير آنيًا وتحمل ختمًا مشفّرًا ورمز استجابة سريعة QR.

### ما يجب أن يضمنه المحاسبون

- أن يكون نظام الفوترة/تخطيط الموارد حلًّا **معتمدًا ومتوافقًا**.
- أن تتضمن كل فاتورة ضريبية الحقول المطلوبة و**رمز QR** قابلًا للمسح.
- أن تبقى بيانات الربط والشهادات سارية.

يترتب على عدم الالتزام غرامات مالية، لذا نسّق مبكرًا مع تقنية المعلومات ومزوّد الحل.`,
          },
          {
            title: "ZATCA E-Invoicing — Official Portal",
            titleAr: "بوابة الفوترة الإلكترونية الرسمية",
            type: "RESOURCE",
            durationMinutes: 5,
            content: "https://zatca.gov.sa/en/E-Invoicing/Pages/default.aspx",
            contentAr: "https://zatca.gov.sa/ar/E-Invoicing/Pages/default.aspx",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 2) HUMAN RESOURCES
  // =========================================================================
  {
    key: "hr-essentials",
    title: "HR Essentials & Saudi Labor Law",
    titleAr: "أساسيات الموارد البشرية ونظام العمل السعودي",
    description:
      "The HR lifecycle from hiring to offboarding, grounded in the Saudi Labor Law, Saudization (Nitaqat) and PDPL data protection.",
    descriptionAr:
      "دورة الموارد البشرية من التوظيف حتى إنهاء الخدمة، مبنية على نظام العمل السعودي والسعودة (نطاقات) وحماية البيانات الشخصية.",
    category: "Human Resources",
    level: "INTERMEDIATE",
    competency: "People Management",
    competencyAr: "إدارة الأفراد",
    modules: [
      {
        title: "The Employee Lifecycle",
        titleAr: "دورة حياة الموظف",
        lessons: [
          {
            title: "Hiring & Onboarding Done Right",
            titleAr: "التوظيف والإعداد الوظيفي بالشكل الصحيح",
            type: "TEXT",
            durationMinutes: 18,
            content: `## First impressions compound

A structured hire-to-onboard process reduces early attrition and speeds time-to-productivity.

### A solid flow

1. **Job analysis** → a clear role profile and competency requirements.
2. **Structured interviews** — same core questions, scored against criteria, to reduce bias.
3. **Offer & contract** — compliant with the Labor Law (see the next module).
4. **Pre-boarding** — paperwork, accounts and equipment ready *before* day one.
5. **30/60/90-day plan** — goals, check-ins and a named buddy.

> Tie onboarding to the competency framework so a new hire's development plan starts on day one, not at the first appraisal.`,
            contentAr: `## الانطباعات الأولى تتراكم

العملية المنظمة من التوظيف إلى الإعداد تقلّل ترك العمل المبكر وتُسرّع الوصول إلى الإنتاجية.

### مسار متين

1. **تحليل الوظيفة** ← ملف دور واضح ومتطلبات جدارات.
2. **مقابلات منظمة** — الأسئلة الجوهرية نفسها، مُقيّمة وفق معايير، لتقليل التحيّز.
3. **العرض والعقد** — متوافق مع نظام العمل (انظر الوحدة التالية).
4. **التهيئة المسبقة** — إنهاء الأوراق والحسابات والمعدات *قبل* اليوم الأول.
5. **خطة ٣٠/٦٠/٩٠ يومًا** — أهداف ولقاءات متابعة ورفيق مُسمّى.

> اربط الإعداد الوظيفي بإطار الجدارات لتبدأ خطة تطوير الموظف الجديد من اليوم الأول، لا من أول تقييم أداء.`,
          },
          {
            title: "Performance Management & Reviews",
            titleAr: "إدارة الأداء والتقييمات",
            type: "TEXT",
            durationMinutes: 16,
            content: `## Performance is a system, not an event

Annual reviews alone don't change behavior. Effective performance management combines:

- **Clear goals** (e.g. OKRs or SMART objectives) set at the start of the cycle.
- **Continuous feedback** — short, frequent, specific.
- **Calibration** — managers align ratings so "meets expectations" means the same thing across teams.
- **Development linkage** — every review produces a growth action, mapped to competencies and training.

### Handling underperformance

Document specifics, agree a **performance improvement plan** with measurable milestones and a fair timeline, and follow due process consistent with the Labor Law before any termination decision.`,
            contentAr: `## الأداء منظومة لا حدثًا

التقييمات السنوية وحدها لا تغيّر السلوك. إدارة الأداء الفعّالة تجمع بين:

- **أهداف واضحة** (مثل OKRs أو أهداف SMART) تُحدّد في بداية الدورة.
- **تغذية راجعة مستمرة** — قصيرة ومتكررة ومحددة.
- **المعايرة** — يوائم المديرون التقييمات بحيث تعني "يلبّي التوقعات" الشيء نفسه عبر الفرق.
- **الربط بالتطوير** — كل تقييم يُنتج إجراء تطوير مرتبطًا بالجدارات والتدريب.

### معالجة ضعف الأداء

وثّق التفاصيل، واتفق على **خطة تحسين أداء** بمراحل قابلة للقياس ومهلة عادلة، واتّبع الإجراءات النظامية المتوافقة مع نظام العمل قبل أي قرار بإنهاء الخدمة.`,
          },
        ],
      },
      {
        title: "Saudi Labor Law Essentials",
        titleAr: "أساسيات نظام العمل السعودي",
        lessons: [
          {
            title: "Contracts, Working Hours & End-of-Service",
            titleAr: "العقود وساعات العمل ومكافأة نهاية الخدمة",
            type: "TEXT",
            durationMinutes: 22,
            content: `## Know the rules you administer

Key provisions HR must apply (always confirm against the current law text):

- **Employment contracts** — written, specifying wage, role and term; fixed-term rules apply to non-Saudis.
- **Working hours** — generally 8 hours/day or 48/week, reduced during **Ramadan** for Muslim employees.
- **Overtime** — paid at 150% of the hourly wage.
- **Annual leave** — a statutory minimum that rises with service length.
- **End-of-service award (ESB)** — accrued on final wage: a defined fraction per year for early years, rising for later years.

> The **Wage Protection System (WPS)** requires salaries to be paid through approved channels and reported — non-compliance affects services and Saudization status.`,
            contentAr: `## اعرف القواعد التي تطبّقها

أحكام أساسية يجب على الموارد البشرية تطبيقها (تحقّق دائمًا من النص النظامي الساري):

- **عقود العمل** — مكتوبة تحدد الأجر والدور والمدة؛ وتنطبق قواعد المدة المحددة على غير السعوديين.
- **ساعات العمل** — عمومًا ٨ ساعات يوميًا أو ٤٨ أسبوعيًا، وتُخفّض في **رمضان** للموظفين المسلمين.
- **العمل الإضافي** — يُحتسب بـ ١٥٠٪ من أجر الساعة.
- **الإجازة السنوية** — حد أدنى نظامي يزداد مع طول مدة الخدمة.
- **مكافأة نهاية الخدمة** — تُحتسب على الأجر الأخير: نسبة محددة عن السنوات الأولى ترتفع عن السنوات اللاحقة.

> يوجب **نظام حماية الأجور** صرف الرواتب عبر قنوات معتمدة والإبلاغ عنها — وعدم الالتزام يؤثر على الخدمات وحالة السعودة.`,
          },
          {
            title: "Saudi Labor Law — Official Text",
            titleAr: "نظام العمل السعودي — النص الرسمي",
            type: "RESOURCE",
            durationMinutes: 8,
            content: "https://hrsd.gov.sa/en",
            contentAr: "https://hrsd.gov.sa/ar",
          },
        ],
      },
      {
        title: "Saudization & Data Protection",
        titleAr: "السعودة وحماية البيانات",
        lessons: [
          {
            title: "Nitaqat (Saudization) for HR",
            titleAr: "نطاقات (السعودة) للموارد البشرية",
            type: "TEXT",
            durationMinutes: 14,
            content: `## Saudization is a strategic KPI

**Nitaqat** rates establishments (by sector and size) on their share of Saudi employees, placing them in colored bands (e.g. Platinum, Green, Red). Your band affects access to government services such as visas and work-permit transfers.

### What HR should do

- **Track your rate** continuously, not just at audit time.
- Build a **Saudi talent pipeline** — graduate hiring, training, and retention plans.
- Use development (this platform!) to grow Saudi employees into critical roles, improving both your band and your succession depth.

Coordinate targets with leadership; Saudization is both a compliance requirement and a **Vision 2030** national objective.`,
            contentAr: `## السعودة مؤشر أداء استراتيجي

يصنّف **نطاقات** المنشآت (حسب القطاع والحجم) بناءً على نسبة الموظفين السعوديين، ويضعها في نطاقات ملوّنة (مثل البلاتيني والأخضر والأحمر). ويؤثر نطاقك على الوصول إلى الخدمات الحكومية كالتأشيرات ونقل رخص العمل.

### ما ينبغي للموارد البشرية فعله

- **تابع نسبتك** باستمرار، لا وقت التدقيق فقط.
- ابنِ **قناة مواهب سعودية** — توظيف الخريجين والتدريب وخطط الاستبقاء.
- استخدم التطوير (هذه المنصة!) لتنمية الموظفين السعوديين نحو الأدوار الحرجة، مما يحسّن نطاقك وعمق التعاقب معًا.

نسّق المستهدفات مع القيادة؛ فالسعودة متطلب امتثال وهدف وطني ضمن **رؤية ٢٠٣٠**.`,
          },
          {
            title: "PDPL — Protecting Employee Data",
            titleAr: "نظام حماية البيانات الشخصية — حماية بيانات الموظفين",
            type: "TEXT",
            durationMinutes: 15,
            content: `## HR holds the most sensitive data

Saudi Arabia's **Personal Data Protection Law (PDPL)** governs how personal data is collected and used. HR handles IDs, salaries, health and performance data — all in scope.

### Principles to apply

- **Lawful basis & purpose** — collect only what you need, for a stated reason.
- **Minimization & retention** — don't keep data longer than necessary.
- **Security** — restrict access; protect files and systems.
- **Data-subject rights** — employees can ask what you hold and request correction.
- **Cross-border transfers** — follow the rules before sending data outside the Kingdom.

> Build these habits into HR processes now; treating privacy as routine avoids breaches and penalties later.`,
            contentAr: `## الموارد البشرية تحتفظ بأكثر البيانات حساسية

ينظّم **نظام حماية البيانات الشخصية (PDPL)** في السعودية كيفية جمع البيانات الشخصية واستخدامها. وتتعامل الموارد البشرية مع الهويات والرواتب والبيانات الصحية وبيانات الأداء — وكلها ضمن النطاق.

### مبادئ للتطبيق

- **الأساس النظامي والغرض** — اجمع ما تحتاجه فقط ولسبب معلن.
- **التقليل ومدة الاحتفاظ** — لا تحتفظ بالبيانات أطول من اللازم.
- **الأمن** — قيّد الوصول واحمِ الملفات والأنظمة.
- **حقوق صاحب البيانات** — يمكن للموظف معرفة ما تحتفظ به وطلب تصحيحه.
- **النقل عبر الحدود** — اتّبع القواعد قبل إرسال البيانات خارج المملكة.

> رسّخ هذه العادات في عمليات الموارد البشرية الآن؛ فمعاملة الخصوصية كأمر روتيني تتجنّب الاختراقات والغرامات لاحقًا.`,
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 3) PROJECT MANAGEMENT
  // =========================================================================
  {
    key: "pm-foundations",
    title: "Project Management Foundations",
    titleAr: "أساسيات إدارة المشاريع",
    description:
      "Plan, execute and control projects using scope, schedule, cost, risk and stakeholder practices aligned with PMI/PMBOK.",
    descriptionAr:
      "خطّط ونفّذ وراقب المشاريع باستخدام ممارسات النطاق والجدول والتكلفة والمخاطر وأصحاب المصلحة المتوائمة مع PMI/PMBOK.",
    category: "Project Management",
    level: "INTERMEDIATE",
    competency: "Project Delivery",
    competencyAr: "تسليم المشاريع",
    modules: [
      {
        title: "Project Basics & Lifecycle",
        titleAr: "أساسيات المشروع ودورة حياته",
        lessons: [
          {
            title: "What Is a Project? Phases & Constraints",
            titleAr: "ما المشروع؟ المراحل والقيود",
            type: "TEXT",
            durationMinutes: 16,
            content: `## Temporary, unique, constrained

A **project** is a temporary effort to create a unique product, service or result — unlike ongoing operations. Every project balances the **triple constraint**:

**Scope · Time · Cost** — with **Quality** at the center. Change one and the others move.

### The lifecycle

1. **Initiation** — business case, charter, stakeholders.
2. **Planning** — scope, schedule, budget, risk, quality, communication.
3. **Execution** — build the deliverables; lead the team.
4. **Monitoring & controlling** — measure vs. plan; manage change.
5. **Closing** — hand over, capture lessons, release the team.

> A named sponsor and an approved **charter** give the project manager the authority to lead. Start there.`,
            contentAr: `## مؤقت وفريد ومقيّد

**المشروع** جهد مؤقت لإنتاج منتج أو خدمة أو نتيجة فريدة — بخلاف العمليات المستمرة. وكل مشروع يوازن **القيد الثلاثي**:

**النطاق · الوقت · التكلفة** — و**الجودة** في المركز. غيّر واحدًا تتحرك البقية.

### دورة الحياة

1. **البدء** — دراسة الجدوى والميثاق وأصحاب المصلحة.
2. **التخطيط** — النطاق والجدول والميزانية والمخاطر والجودة والتواصل.
3. **التنفيذ** — بناء المخرجات وقيادة الفريق.
4. **المراقبة والضبط** — القياس مقابل الخطة وإدارة التغيير.
5. **الإغلاق** — التسليم وتوثيق الدروس وإخلاء الفريق.

> راعٍ مُسمّى و**ميثاق** معتمد يمنحان مدير المشروع صلاحية القيادة. ابدأ من هنا.`,
          },
          {
            title: "Predictive vs. Agile Delivery",
            titleAr: "التسليم التنبّئي مقابل الرشيق",
            type: "TEXT",
            durationMinutes: 14,
            content: `## Choose the approach to fit the work

- **Predictive (waterfall)** — requirements are well understood up front; plan the whole project, then execute. Good for construction, infrastructure, regulated work.
- **Agile (iterative)** — requirements evolve; deliver in short increments with frequent feedback. Good for software and product work under uncertainty.
- **Hybrid** — combine: a predictive backbone with agile delivery inside phases.

### Agile in one minute

Work in **sprints**, keep a prioritized **backlog**, hold short **stand-ups**, and **review** working output each cycle. Value is delivered early and often rather than all at the end.`,
            contentAr: `## اختر المنهج بما يناسب العمل

- **التنبّئي (الشلالي)** — المتطلبات مفهومة مسبقًا؛ خطّط المشروع كاملًا ثم نفّذ. مناسب للإنشاءات والبنية التحتية والأعمال المنظّمة.
- **الرشيق (التكراري)** — المتطلبات تتطوّر؛ سلّم على دفعات قصيرة بتغذية راجعة متكررة. مناسب لأعمال البرمجيات والمنتجات في ظل عدم اليقين.
- **الهجين** — ادمج: هيكل تنبّئي مع تسليم رشيق داخل المراحل.

### الرشيق في دقيقة

اعمل على **سباقات (Sprints)**، واحتفظ بـ**قائمة أعمال** مرتّبة بالأولوية، وأقم **اجتماعات وقوف** قصيرة، و**راجع** المخرجات العاملة كل دورة. تُسلّم القيمة مبكرًا وباستمرار بدلًا من نهاية المشروع فقط.`,
          },
        ],
      },
      {
        title: "Planning: Scope, Schedule, Cost",
        titleAr: "التخطيط: النطاق والجدول والتكلفة",
        lessons: [
          {
            title: "Work Breakdown Structure & Scheduling",
            titleAr: "هيكل تجزئة العمل والجدولة",
            type: "TEXT",
            durationMinutes: 18,
            content: `## Break it down, then sequence it

A **Work Breakdown Structure (WBS)** decomposes the scope into manageable **work packages**. If it isn't in the WBS, it isn't in the project — this controls scope creep.

### From WBS to schedule

1. Define **activities** for each work package.
2. **Sequence** them (dependencies: finish-to-start, etc.).
3. Estimate **durations** and assign resources.
4. Build the **critical path** — the longest chain of dependent tasks, which sets the shortest possible project duration.

> Tasks on the critical path have **zero float**: any slip there slips the whole project. Protect them.`,
            contentAr: `## جزّئ العمل ثم رتّبه

يُجزّئ **هيكل تجزئة العمل (WBS)** النطاق إلى **حزم عمل** يمكن إدارتها. وما لم يكن في الهيكل فهو ليس في المشروع — وهذا يضبط تضخّم النطاق.

### من الهيكل إلى الجدول

1. حدّد **الأنشطة** لكل حزمة عمل.
2. **رتّبها** (العلاقات: من الإنهاء إلى البدء، إلخ).
3. قدّر **المدد** وخصّص الموارد.
4. ابنِ **المسار الحرج** — أطول سلسلة مهام مترابطة، وهو الذي يحدد أقصر مدة ممكنة للمشروع.

> مهام المسار الحرج ذات **فائض زمني صفري**: أي تأخير فيها يؤخّر المشروع كله. احمِها.`,
          },
          {
            title: "Budgeting & Earned Value (EVM)",
            titleAr: "الموازنة والقيمة المكتسبة (EVM)",
            type: "TEXT",
            durationMinutes: 20,
            content: `## Are you ahead or behind — on time AND cost?

**Earned Value Management** answers that with three numbers:

- **PV** (Planned Value) — budgeted cost of work *scheduled*.
- **EV** (Earned Value) — budgeted cost of work *actually done*.
- **AC** (Actual Cost) — what you actually spent.

### The key indices

- **Schedule Variance** = EV − PV; **SPI** = EV / PV (≥1 is on/ahead of schedule).
- **Cost Variance** = EV − AC; **CPI** = EV / AC (≥1 is on/under budget).

> Example: PV = 100k, EV = 80k, AC = 90k → behind schedule (SPI 0.8) *and* over budget (CPI 0.89). EVM catches trouble early enough to act.`,
            contentAr: `## هل أنت متقدّم أم متأخّر — في الوقت والتكلفة معًا؟

تجيب **إدارة القيمة المكتسبة** عن ذلك بثلاثة أرقام:

- **PV** (القيمة المخطّطة) — الكلفة المُوازَنة للعمل *المجدوَل*.
- **EV** (القيمة المكتسبة) — الكلفة المُوازَنة للعمل *المُنجَز فعلًا*.
- **AC** (الكلفة الفعلية) — ما أُنفق فعلًا.

### المؤشرات الرئيسية

- **انحراف الجدول** = EV − PV؛ **SPI** = EV / PV (≥١ يعني في الموعد أو متقدّم).
- **انحراف التكلفة** = EV − AC؛ **CPI** = EV / AC (≥١ يعني ضمن الميزانية أو أقل).

> مثال: PV = ١٠٠ ألف، EV = ٨٠ ألف، AC = ٩٠ ألف ← متأخّر عن الجدول (SPI ٠٫٨) *و* متجاوز للميزانية (CPI ٠٫٨٩). تكشف EVM المشكلة مبكرًا بما يكفي للتصرّف.`,
          },
        ],
      },
      {
        title: "Risk & Stakeholders",
        titleAr: "المخاطر وأصحاب المصلحة",
        lessons: [
          {
            title: "Managing Risk Proactively",
            titleAr: "إدارة المخاطر بشكل استباقي",
            type: "TEXT",
            durationMinutes: 15,
            content: `## Risk is managed, not feared

A **risk** is an uncertain event that, if it occurs, affects objectives. Manage it in a loop:

1. **Identify** — brainstorm threats and opportunities; keep a **risk register**.
2. **Analyze** — score each by **probability × impact**.
3. **Plan responses** — for threats: avoid, mitigate, transfer, or accept; for opportunities: exploit or enhance.
4. **Monitor** — review the register regularly; add new risks as they emerge.

> Hold a **contingency reserve** for known risks and keep the highest-scoring items visible to the sponsor. Surprises shrink when risks are named early.`,
            contentAr: `## المخاطر تُدار ولا تُخشى

**الخطر** حدث غير مؤكد يؤثر على الأهداف إذا وقع. أدره في حلقة متكررة:

1. **التحديد** — استكشف التهديدات والفرص؛ واحتفظ بـ**سجل مخاطر**.
2. **التحليل** — قيّم كلًّا بـ**الاحتمال × الأثر**.
3. **تخطيط الاستجابات** — للتهديدات: تجنّب أو تخفيف أو نقل أو قبول؛ وللفرص: استغلال أو تعزيز.
4. **المراقبة** — راجع السجل دوريًا وأضف المخاطر الجديدة فور ظهورها.

> احتفظ بـ**احتياطي طوارئ** للمخاطر المعروفة وأبقِ أعلى البنود خطورة ظاهرة للراعي. تتقلّص المفاجآت حين تُسمّى المخاطر مبكرًا.`,
          },
          {
            title: "Stakeholder Engagement & Communication",
            titleAr: "إشراك أصحاب المصلحة والتواصل",
            type: "TEXT",
            durationMinutes: 14,
            content: `## Projects succeed or fail on people

Map stakeholders by **power** and **interest**:

- **High power / high interest** — manage closely.
- **High power / low interest** — keep satisfied.
- **Low power / high interest** — keep informed.
- **Low power / low interest** — monitor.

### Communicate deliberately

Build a simple **communication plan**: who needs what information, in what format, how often. Most project conflict traces back to an expectation that was never aligned. Clear, regular status — including bad news early — builds the trust that carries a project through trouble.`,
            contentAr: `## المشاريع تنجح أو تفشل بسبب الناس

صنّف أصحاب المصلحة حسب **النفوذ** و**الاهتمام**:

- **نفوذ عالٍ / اهتمام عالٍ** — أدرهم عن قرب.
- **نفوذ عالٍ / اهتمام منخفض** — أبقِهم راضين.
- **نفوذ منخفض / اهتمام عالٍ** — أبقِهم مطّلعين.
- **نفوذ منخفض / اهتمام منخفض** — راقبهم.

### تواصل بقصد

ابنِ **خطة تواصل** بسيطة: من يحتاج أي معلومة، وبأي صيغة، وبأي وتيرة. معظم نزاعات المشاريع تعود إلى توقّع لم يُوائَم قط. والتحديثات الواضحة المنتظمة — بما فيها الأخبار السيئة مبكرًا — تبني الثقة التي تعبر بالمشروع أوقات الشدّة.`,
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 4) EXECUTIVE / COO
  // =========================================================================
  {
    key: "exec-operational-leadership",
    title: "Operational Leadership for Executives",
    titleAr: "القيادة التشغيلية للتنفيذيين",
    description:
      "Translate strategy into operations: KPIs and dashboards, process excellence, financial acumen and leading through change.",
    descriptionAr:
      "ترجمة الاستراتيجية إلى تشغيل: مؤشرات الأداء ولوحات المتابعة والتميّز في العمليات والفطنة المالية وقيادة التغيير.",
    category: "Executive / COO",
    level: "LEADERSHIP",
    competency: "Strategic Leadership",
    competencyAr: "القيادة الاستراتيجية",
    modules: [
      {
        title: "Strategy into Execution",
        titleAr: "من الاستراتيجية إلى التنفيذ",
        lessons: [
          {
            title: "KPIs, OKRs & the Executive Dashboard",
            titleAr: "مؤشرات الأداء والأهداف والنتائج ولوحة القيادة التنفيذية",
            type: "TEXT",
            durationMinutes: 18,
            content: `## What you measure is what you get

Executives steer with a **small set of the right metrics**, not a wall of numbers.

- **Leading indicators** predict the future (pipeline, utilization, training coverage).
- **Lagging indicators** confirm the past (revenue, margin, turnover).

Balance both. A dashboard of only lagging metrics tells you where you've been, never where you're going.

### OKRs to align the org

**Objectives** (ambitious, qualitative) with **Key Results** (measurable) cascade company goals into team goals. Review quarterly. The discipline is not the tool — it's the *conversation* that forces prioritization and kills pet projects that don't serve the objective.`,
            contentAr: `## ما تقيسه هو ما تحصل عليه

يقود التنفيذيون بـ**مجموعة صغيرة من المؤشرات الصحيحة**، لا بجدارٍ من الأرقام.

- **المؤشرات القائدة** تتنبأ بالمستقبل (خط الفرص، معدّل الاستغلال، تغطية التدريب).
- **المؤشرات المتأخرة** تؤكّد الماضي (الإيراد، الهامش، معدّل الدوران).

وازن بينهما. فلوحة تعتمد المؤشرات المتأخرة فقط تخبرك أين كنت، لا إلى أين تتجه.

### الأهداف والنتائج (OKRs) لمواءمة المنظمة

**الأهداف** (طموحة ونوعية) مع **النتائج الرئيسية** (قابلة للقياس) تُنزّل أهداف الشركة إلى أهداف الفرق. راجعها ربع سنوي. والانضباط ليس في الأداة بل في *الحوار* الذي يفرض ترتيب الأولويات ويوقف المشاريع التي لا تخدم الهدف.`,
          },
          {
            title: "Financial Acumen for Non-Finance Leaders",
            titleAr: "الفطنة المالية للقادة من غير المتخصصين",
            type: "TEXT",
            durationMinutes: 16,
            content: `## Lead with the numbers behind the numbers

You don't need to be an accountant, but you must read the business in financial terms:

- **Margin structure** — where does gross and net margin come from, and what erodes it?
- **Cash vs. profit** — a profitable company can still run out of cash. Watch **working capital** and the **cash conversion cycle**.
- **Unit economics** — contribution per project, per employee, per client.
- **Cost behavior** — fixed vs. variable, and the **breakeven** point.

> Before approving a big decision, ask three questions: *What does it cost, what does it return, and when does the cash come back?*`,
            contentAr: `## قُد بالأرقام التي خلف الأرقام

لست بحاجة لأن تكون محاسبًا، لكن عليك قراءة العمل بلغة المال:

- **بنية الهامش** — من أين يأتي الهامش الإجمالي والصافي وما الذي يستنزفه؟
- **النقد مقابل الربح** — قد تنفد السيولة من شركة رابحة. راقب **رأس المال العامل** و**دورة تحويل النقد**.
- **اقتصاديات الوحدة** — المساهمة لكل مشروع ولكل موظف ولكل عميل.
- **سلوك التكاليف** — الثابت مقابل المتغيّر و**نقطة التعادل**.

> قبل اعتماد قرار كبير، اسأل ثلاثة أسئلة: *كم يكلّف؟ وكم يعيد؟ ومتى يعود النقد؟*`,
          },
        ],
      },
      {
        title: "Operational Excellence",
        titleAr: "التميّز التشغيلي",
        lessons: [
          {
            title: "Process Thinking: Lean & Bottlenecks",
            titleAr: "التفكير بالعمليات: اللين والاختناقات",
            type: "TEXT",
            durationMinutes: 17,
            content: `## Optimize the system, not the parts

Operational leaders improve **flow**. Two ideas do most of the work:

- **Lean** — relentlessly remove waste (waiting, rework, overproduction, unnecessary motion). Map the value stream and cut steps that don't add value.
- **Theory of Constraints** — every system has one **bottleneck** that limits throughput. Improving anything *except* the bottleneck doesn't increase output. Find it, exploit it, then subordinate everything else to it.

### Make it stick

Standardize the improved process, measure it, and run a **continuous improvement** (Kaizen) loop. Small, compounding gains beat occasional heroics.`,
            contentAr: `## حسّن المنظومة لا الأجزاء

يحسّن القادة التشغيليون **الانسياب**. وفكرتان تنجزان معظم العمل:

- **اللين (Lean)** — أزل الهدر بلا هوادة (الانتظار، إعادة العمل، الإفراط في الإنتاج، الحركة غير الضرورية). ارسم سلسلة القيمة واحذف الخطوات التي لا تضيف قيمة.
- **نظرية القيود** — لكل منظومة **اختناق** واحد يحدّ الإنتاجية. وتحسين أي شيء *عدا* الاختناق لا يزيد المخرجات. جِده واستغلّه ثم أخضِع كل شيء آخر له.

### ثبّت التحسين

وحّد العملية المحسّنة وقِسها وأدر حلقة **تحسين مستمر** (كايزن). فالمكاسب الصغيرة المتراكمة تتفوّق على البطولات العرضية.`,
          },
          {
            title: "Decision-Making Under Uncertainty",
            titleAr: "اتخاذ القرار في ظل عدم اليقين",
            type: "TEXT",
            durationMinutes: 14,
            content: `## Speed and quality of decisions define leaders

A practical approach:

1. **Frame** the decision — what exactly are we deciding, and what are the real options (usually more than two)?
2. **Reversible vs. irreversible** — decide reversible calls fast; take more care with one-way doors.
3. **Data + judgment** — gather enough evidence to move, then accept that waiting for certainty is itself a costly decision.
4. **Decide, assign, and set a review date** — a decision without an owner and a check-back is a wish.

> Bias to action on reversible decisions; the cost of delay usually exceeds the cost of a correctable mistake.`,
            contentAr: `## سرعة القرارات وجودتها تُعرّفان القادة

منهج عملي:

1. **أطّر** القرار — ما الذي نقرره بالضبط، وما الخيارات الحقيقية (غالبًا أكثر من اثنين)؟
2. **قابل للعكس مقابل غير قابل** — احسم القرارات القابلة للعكس بسرعة، وتأنَّ في الأبواب ذات الاتجاه الواحد.
3. **بيانات + حُكم** — اجمع أدلة تكفي للتحرّك، ثم اقبل أن انتظار اليقين قرار مكلف بذاته.
4. **قرّر وكلّف وحدّد موعد مراجعة** — فالقرار بلا مالك وبلا متابعة أمنية لا أكثر.

> مِل إلى الفعل في القرارات القابلة للعكس؛ فكلفة التأخير تفوق عادةً كلفة خطأ قابل للتصحيح.`,
          },
        ],
      },
      {
        title: "Leading People & Change",
        titleAr: "قيادة الناس والتغيير",
        lessons: [
          {
            title: "Building & Developing High-Performing Teams",
            titleAr: "بناء وتطوير فرق عالية الأداء",
            type: "TEXT",
            durationMinutes: 16,
            content: `## Your job is to build the people who build the results

- **Hire and place for strengths**, then set unambiguous expectations.
- **Delegate outcomes, not tasks** — say what "good" looks like and let people find the path.
- **Coach continuously** — regular 1:1s focused on growth, obstacles and feedback both ways.
- **Build a bench** — use succession planning and the 9-box so no critical role has a single point of failure.

### Psychological safety

Teams perform when people can speak up, admit mistakes and challenge ideas without fear. You set that tone by how you react to bad news — reward the messenger, fix the system.`,
            contentAr: `## مهمتك أن تبني الأشخاص الذين يصنعون النتائج

- **وظّف وضع الناس وفق نقاط قوتهم**، ثم حدّد توقعات لا لبس فيها.
- **فوّض النتائج لا المهام** — بيّن كيف يبدو "الجيد" ودع الناس يجدون الطريق.
- **درّب باستمرار** — لقاءات فردية منتظمة تركّز على النمو والعقبات والتغذية الراجعة في الاتجاهين.
- **ابنِ صف بدلاء** — استخدم تخطيط التعاقب ومصفوفة ٩ خانات كي لا يكون لأي دور حرج نقطة فشل وحيدة.

### الأمان النفسي

تتفوّق الفرق حين يستطيع الناس التعبير والاعتراف بالخطأ وتحدّي الأفكار بلا خوف. وأنت تحدّد هذه الأجواء بطريقة تفاعلك مع الأخبار السيئة — كافئ حامل الخبر وأصلِح المنظومة.`,
          },
          {
            title: "Leading Organizational Change",
            titleAr: "قيادة التغيير المؤسسي",
            type: "TEXT",
            durationMinutes: 15,
            content: `## Most change efforts fail on adoption, not ideas

A durable change sequence (after Kotter):

1. **Create urgency** — make the case for why, now.
2. **Build a guiding coalition** — influential sponsors across functions.
3. **Craft a clear vision** and communicate it relentlessly.
4. **Remove barriers** and enable people (tools, training, authority).
5. **Generate short-term wins** to build momentum and proof.
6. **Sustain and anchor** the change in processes and culture.

> People don't resist change so much as they resist *loss* and *uncertainty*. Name what's changing, what isn't, and what's in it for them — then invest in training so capability keeps pace with ambition.`,
            contentAr: `## معظم جهود التغيير تفشل في التبنّي لا في الفكرة

تسلسل تغيير راسخ (على نهج كوتر):

1. **اخلق الإلحاح** — قدّم مبرّر "لماذا الآن".
2. **ابنِ تحالفًا موجِّهًا** — رعاة مؤثرون عبر الإدارات.
3. **صُغ رؤية واضحة** ووصّلها بلا كلل.
4. **أزل العوائق** ومكّن الناس (أدوات وتدريب وصلاحية).
5. **حقّق مكاسب قصيرة المدى** لبناء الزخم والبرهان.
6. **ثبّت الرسوخ** للتغيير في العمليات والثقافة.

> الناس لا يقاومون التغيير بقدر ما يقاومون *الخسارة* و*عدم اليقين*. سمِّ ما يتغيّر وما يبقى وما مصلحتهم فيه — ثم استثمر في التدريب لتواكب القدرات الطموح.`,
          },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Knowledge-check quizzes — one graded assessment appended to each course.
// Passing (>= passMark) completes the quiz lesson and counts toward progress.
// ---------------------------------------------------------------------------
const COURSE_QUIZZES: Record<string, CurriculumQuestion[]> = {
  "acc-fundamentals": [
    {
      prompt: "What is the standard VAT rate in Saudi Arabia?",
      promptAr: "ما نسبة ضريبة القيمة المضافة القياسية في السعودية؟",
      options: [
        { text: "5%", textAr: "٥٪" },
        { text: "15%", textAr: "١٥٪", correct: true },
        { text: "20%", textAr: "٢٠٪" },
        { text: "0%", textAr: "٠٪" },
      ],
      explanation: "The standard VAT rate is 15%.",
      explanationAr: "النسبة القياسية للضريبة هي ١٥٪.",
    },
    {
      prompt: "The accounting equation states that Assets equal:",
      promptAr: "تنص المعادلة المحاسبية على أن الأصول تساوي:",
      options: [
        { text: "Liabilities + Equity", textAr: "الالتزامات + حقوق الملكية", correct: true },
        { text: "Revenue − Expenses", textAr: "الإيرادات − المصروفات" },
        { text: "Cash + Inventory", textAr: "النقد + المخزون" },
        { text: "Equity − Liabilities", textAr: "حقوق الملكية − الالتزامات" },
      ],
      explanation: "Assets = Liabilities + Equity — the balance sheet always balances.",
      explanationAr: "الأصول = الالتزامات + حقوق الملكية — وتظل الميزانية متوازنة دائمًا.",
    },
    {
      prompt: "Under ZATCA e-invoicing, a compliant tax invoice must include:",
      promptAr: "وفق الفوترة الإلكترونية للهيئة، يجب أن تتضمن الفاتورة الضريبية المتوافقة:",
      options: [
        { text: "A handwritten signature only", textAr: "توقيعًا يدويًا فقط" },
        { text: "A scannable QR code", textAr: "رمز استجابة سريعة QR قابلًا للمسح", correct: true },
        { text: "No buyer details", textAr: "دون بيانات المشتري" },
        { text: "Prices in USD only", textAr: "الأسعار بالدولار فقط" },
      ],
      explanation: "Compliant e-invoices carry the required fields and a scannable QR code.",
      explanationAr: "تحمل الفواتير الإلكترونية المتوافقة الحقول المطلوبة ورمز QR قابلًا للمسح.",
    },
    {
      prompt: "Under accrual accounting, revenue is recorded when:",
      promptAr: "في محاسبة الاستحقاق، يُسجّل الإيراد عند:",
      options: [
        { text: "Cash is received", textAr: "استلام النقد" },
        { text: "It is earned", textAr: "تحققه", correct: true },
        { text: "The year ends", textAr: "نهاية السنة" },
        { text: "The invoice is paid", textAr: "سداد الفاتورة" },
      ],
      explanation: "Accrual accounting records revenue when earned, not when cash moves.",
      explanationAr: "تسجّل محاسبة الاستحقاق الإيراد عند تحققه لا عند حركة النقد.",
    },
  ],
  "hr-essentials": [
    {
      prompt: "Overtime in Saudi Arabia is generally paid at what rate of the hourly wage?",
      promptAr: "يُحتسب العمل الإضافي في السعودية عمومًا بأي نسبة من أجر الساعة؟",
      options: [
        { text: "100%", textAr: "١٠٠٪" },
        { text: "125%", textAr: "١٢٥٪" },
        { text: "150%", textAr: "١٥٠٪", correct: true },
        { text: "200%", textAr: "٢٠٠٪" },
      ],
      explanation: "Overtime is paid at 150% of the hourly wage.",
      explanationAr: "يُحتسب العمل الإضافي بنسبة ١٥٠٪ من أجر الساعة.",
    },
    {
      prompt: "Nitaqat measures an establishment's:",
      promptAr: "يقيس نطاقات لدى المنشأة:",
      options: [
        { text: "Share of Saudi employees", textAr: "نسبة الموظفين السعوديين", correct: true },
        { text: "Annual revenue", textAr: "الإيراد السنوي" },
        { text: "Number of branches", textAr: "عدد الفروع" },
        { text: "Export volume", textAr: "حجم الصادرات" },
      ],
      explanation: "Nitaqat rates establishments on their share of Saudi employees.",
      explanationAr: "يصنّف نطاقات المنشآت بناءً على نسبة الموظفين السعوديين.",
    },
    {
      prompt: "The PDPL primarily governs:",
      promptAr: "ينظّم نظام حماية البيانات الشخصية بشكل أساسي:",
      options: [
        { text: "Personal data collection and use", textAr: "جمع البيانات الشخصية واستخدامها", correct: true },
        { text: "Corporate tax filing", textAr: "تقديم ضريبة الشركات" },
        { text: "Import tariffs", textAr: "الرسوم الجمركية" },
        { text: "Building safety codes", textAr: "أكواد سلامة المباني" },
      ],
      explanation: "PDPL governs how personal data is collected and used.",
      explanationAr: "ينظّم النظام كيفية جمع البيانات الشخصية واستخدامها.",
    },
    {
      prompt: "The end-of-service award is calculated based on:",
      promptAr: "تُحتسب مكافأة نهاية الخدمة بناءً على:",
      options: [
        { text: "The final wage and years of service", textAr: "الأجر الأخير وسنوات الخدمة", correct: true },
        { text: "The first month's salary only", textAr: "راتب الشهر الأول فقط" },
        { text: "A fixed government amount", textAr: "مبلغ حكومي ثابت" },
        { text: "The number of leave days", textAr: "عدد أيام الإجازة" },
      ],
      explanation: "The ESB accrues on the final wage, rising with years of service.",
      explanationAr: "تُحتسب المكافأة على الأجر الأخير وتزداد مع سنوات الخدمة.",
    },
  ],
  "pm-foundations": [
    {
      prompt: "The triple constraint of a project is:",
      promptAr: "القيد الثلاثي للمشروع هو:",
      options: [
        { text: "Scope, Time, Cost", textAr: "النطاق والوقت والتكلفة", correct: true },
        { text: "People, Process, Tools", textAr: "الناس والعملية والأدوات" },
        { text: "Plan, Do, Review", textAr: "التخطيط والتنفيذ والمراجعة" },
        { text: "Risk, Issue, Change", textAr: "الخطر والمشكلة والتغيير" },
      ],
      explanation: "Scope, time and cost — with quality at the center.",
      explanationAr: "النطاق والوقت والتكلفة — والجودة في المركز.",
    },
    {
      prompt: "The critical path is:",
      promptAr: "المسار الحرج هو:",
      options: [
        { text: "The longest chain of dependent tasks", textAr: "أطول سلسلة مهام مترابطة", correct: true },
        { text: "The cheapest set of tasks", textAr: "أرخص مجموعة مهام" },
        { text: "Tasks with the most float", textAr: "المهام ذات الفائض الأكبر" },
        { text: "Optional tasks", textAr: "المهام الاختيارية" },
      ],
      explanation: "The critical path is the longest dependent chain and has zero float.",
      explanationAr: "المسار الحرج أطول سلسلة مترابطة وفائضه الزمني صفر.",
    },
    {
      prompt: "A Cost Performance Index (CPI) below 1.0 means the project is:",
      promptAr: "مؤشر أداء التكلفة (CPI) الأقل من ١٫٠ يعني أن المشروع:",
      options: [
        { text: "Over budget", textAr: "متجاوز للميزانية", correct: true },
        { text: "Under budget", textAr: "ضمن الميزانية" },
        { text: "Ahead of schedule", textAr: "متقدّم على الجدول" },
        { text: "Exactly on plan", textAr: "مطابق للخطة تمامًا" },
      ],
      explanation: "CPI = EV / AC; below 1.0 means costs exceed the earned value.",
      explanationAr: "CPI = EV / AC؛ وأقل من ١٫٠ يعني أن التكاليف تتجاوز القيمة المكتسبة.",
    },
    {
      prompt: "The Work Breakdown Structure (WBS) is used to:",
      promptAr: "يُستخدم هيكل تجزئة العمل (WBS) في:",
      options: [
        { text: "Decompose scope into work packages", textAr: "تجزئة النطاق إلى حزم عمل", correct: true },
        { text: "Assign salaries", textAr: "تحديد الرواتب" },
        { text: "Record risks", textAr: "تسجيل المخاطر" },
        { text: "Approve invoices", textAr: "اعتماد الفواتير" },
      ],
      explanation: "The WBS decomposes scope into manageable work packages.",
      explanationAr: "يُجزّئ الهيكل النطاق إلى حزم عمل يمكن إدارتها.",
    },
  ],
  "exec-operational-leadership": [
    {
      prompt: "A leading indicator is one that:",
      promptAr: "المؤشر القائد هو الذي:",
      options: [
        { text: "Predicts future performance", textAr: "يتنبأ بالأداء المستقبلي", correct: true },
        { text: "Confirms past results", textAr: "يؤكّد النتائج الماضية" },
        { text: "Only measures revenue", textAr: "يقيس الإيراد فقط" },
        { text: "Is always financial", textAr: "يكون ماليًا دائمًا" },
      ],
      explanation: "Leading indicators (e.g. pipeline, training coverage) predict the future.",
      explanationAr: "المؤشرات القائدة (كخط الفرص وتغطية التدريب) تتنبأ بالمستقبل.",
    },
    {
      prompt: "In OKRs, Key Results should be:",
      promptAr: "في الأهداف والنتائج (OKRs)، ينبغي أن تكون النتائج الرئيسية:",
      options: [
        { text: "Measurable", textAr: "قابلة للقياس", correct: true },
        { text: "Vague and inspirational", textAr: "غامضة وملهمة" },
        { text: "Secret", textAr: "سرّية" },
        { text: "Set only once a decade", textAr: "تُحدّد مرة كل عقد" },
      ],
      explanation: "Objectives are qualitative; Key Results are measurable.",
      explanationAr: "الأهداف نوعية، أما النتائج الرئيسية فقابلة للقياس.",
    },
    {
      prompt: "According to the Theory of Constraints, to increase throughput you should focus on:",
      promptAr: "وفق نظرية القيود، لزيادة الإنتاجية ينبغي التركيز على:",
      options: [
        { text: "The bottleneck", textAr: "الاختناق", correct: true },
        { text: "Every step equally", textAr: "كل خطوة بالتساوي" },
        { text: "The fastest step", textAr: "أسرع خطوة" },
        { text: "Reducing headcount", textAr: "تقليل عدد الموظفين" },
      ],
      explanation: "Only improving the bottleneck increases total throughput.",
      explanationAr: "تحسين الاختناق وحده هو ما يزيد الإنتاجية الكلية.",
    },
    {
      prompt: "Reversible ('two-way door') decisions should generally be:",
      promptAr: "القرارات القابلة للعكس ('الباب ذو الاتجاهين') ينبغي عمومًا أن:",
      options: [
        { text: "Made quickly", textAr: "تُتخذ بسرعة", correct: true },
        { text: "Delayed until certain", textAr: "تؤجَّل حتى اليقين التام" },
        { text: "Escalated to the board", textAr: "تُرفع إلى مجلس الإدارة" },
        { text: "Avoided", textAr: "تُتجنَّب" },
      ],
      explanation: "Bias to action on reversible decisions; the cost of delay usually exceeds a correctable mistake.",
      explanationAr: "مِل إلى الفعل في القرارات القابلة للعكس؛ فكلفة التأخير تفوق عادةً خطأً قابلًا للتصحيح.",
    },
  ],
};

// Append each course's quiz as a final "Knowledge Check" module.
for (const program of CURRICULUM) {
  const questions = COURSE_QUIZZES[program.key];
  if (!questions) continue;
  program.modules.push({
    title: "Knowledge Check",
    titleAr: "اختبار المعرفة",
    lessons: [
      {
        title: "Course Quiz",
        titleAr: "اختبار الدورة",
        type: "QUIZ",
        durationMinutes: 10,
        content: "",
        contentAr: "",
        passMark: 70,
        questions,
      },
    ],
  });
}

/** Total lesson count across the whole starter library (used in docs/tests). */
export function totalLessonCount(programs: CurriculumProgram[] = CURRICULUM): number {
  return programs.reduce(
    (sum, p) => sum + p.modules.reduce((m, mod) => m + mod.lessons.length, 0),
    0
  );
}

/** Sum of lesson minutes for a program → rounded up to whole hours. */
export function programDurationHours(p: CurriculumProgram): number {
  const minutes = p.modules.reduce(
    (m, mod) => m + mod.lessons.reduce((l, les) => l + les.durationMinutes, 0),
    0
  );
  return Math.max(1, Math.round(minutes / 60));
}
