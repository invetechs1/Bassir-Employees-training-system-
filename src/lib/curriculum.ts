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
  /**
   * Internal identifier for this course. Used to attach the knowledge-check
   * quiz below and to keep programs distinct in this file. NOTE: idempotent
   * install actually de-dupes by `title` (there is no key column on
   * TrainingProgram), so keep titles stable — renaming a course's title will
   * make a re-install create a new program instead of skipping it.
   */
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

/** The specialist tracks shipped in the starter library. */
export const TRACKS = [
  { key: "Accounting & Finance", en: "Accounting & Finance", ar: "المحاسبة والمالية" },
  { key: "Human Resources", en: "Human Resources", ar: "الموارد البشرية" },
  { key: "Project Management", en: "Project Management", ar: "إدارة المشاريع" },
  { key: "Executive / COO", en: "Executive / COO", ar: "القيادة التنفيذية" },
  { key: "Sales & Business Development", en: "Sales & Business Development", ar: "المبيعات وتطوير الأعمال" },
  { key: "Information Technology", en: "Information Technology", ar: "تقنية المعلومات" },
  { key: "Health, Safety & Environment", en: "Health, Safety & Environment", ar: "الصحة والسلامة والبيئة" },
  { key: "Procurement & Supply Chain", en: "Procurement & Supply Chain", ar: "المشتريات وسلسلة الإمداد" },
  { key: "Operations & Warehousing", en: "Operations & Warehousing", ar: "العمليات والمستودعات" },
  { key: "Customer Service", en: "Customer Service", ar: "خدمة العملاء" },
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
  // =========================================================================
  // 5) SALES & BUSINESS DEVELOPMENT
  // =========================================================================
  {
    key: "sales-fundamentals",
    title: "Sales Fundamentals",
    titleAr: "أساسيات المبيعات",
    description:
      "A practical sales process — understanding buyers, qualifying leads, handling objections, closing, and growing accounts.",
    descriptionAr:
      "عملية بيع عملية — فهم المشترين وتأهيل العملاء المحتملين ومعالجة الاعتراضات والإغلاق وتنمية الحسابات.",
    category: "Sales & Business Development",
    level: "FOUNDATION",
    competency: "Sales & Negotiation",
    competencyAr: "المبيعات والتفاوض",
    modules: [
      {
        title: "The Sales Process",
        titleAr: "عملية البيع",
        lessons: [
          {
            title: "Understanding the Buyer & Their Needs",
            titleAr: "فهم المشتري واحتياجاته",
            type: "TEXT",
            durationMinutes: 14,
            content: `## Sell by understanding, not pushing

Great salespeople **diagnose before they prescribe**. Before pitching, understand the buyer's situation, problems and goals.

- **Ask open questions** — "What are you trying to achieve?" "What's not working today?"
- **Listen more than you talk** — aim for the buyer speaking most of the time.
- **Map value to needs** — connect your product's benefits to *their* specific problem, not a generic feature list.

> People buy outcomes, not features. Frame everything as the result the customer gets.`,
            contentAr: `## بِع بالفهم لا بالإلحاح

البائع المتميّز **يشخّص قبل أن يصف**. قبل العرض، افهم وضع المشتري ومشكلاته وأهدافه.

- **اطرح أسئلة مفتوحة** — "ما الذي تسعى لتحقيقه؟" "ما الذي لا يعمل اليوم؟"
- **استمع أكثر مما تتحدث** — اجعل المشتري هو من يتكلم معظم الوقت.
- **اربط القيمة بالاحتياج** — اربط منافع منتجك بمشكلته *هو* تحديدًا لا بقائمة ميزات عامة.

> الناس يشترون النتائج لا الميزات. اعرض كل شيء بوصفه النتيجة التي يحصل عليها العميل.`,
          },
          {
            title: "The Sales Funnel & Qualifying Leads",
            titleAr: "قمع المبيعات وتأهيل العملاء المحتملين",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Focus effort where it pays

A **sales funnel** tracks prospects from awareness to a closed deal: *Lead → Qualified → Proposal → Negotiation → Won/Lost*.

**Qualifying** stops you wasting time on poor-fit prospects. A simple test — does the lead have:

- **Need** — a real problem you solve?
- **Budget** — the means to buy?
- **Authority** — access to the decision-maker?
- **Timing** — a reason to act now?

> Disqualify early and honestly. A fast "no" is more valuable than a slow "maybe."`,
            contentAr: `## ركّز الجهد حيث يُثمر

يتتبّع **قمع المبيعات** العملاء المحتملين من الوعي حتى إتمام الصفقة: *عميل محتمل ← مؤهَّل ← عرض ← تفاوض ← ربح/خسارة*.

**التأهيل** يمنعك من إهدار الوقت على غير المناسبين. اختبار بسيط — هل لدى العميل:

- **حاجة** — مشكلة حقيقية تحلّها؟
- **ميزانية** — القدرة على الشراء؟
- **صلاحية** — الوصول إلى متّخذ القرار؟
- **توقيت** — سبب للتحرّك الآن؟

> استبعد مبكرًا وبصدق. فـ"لا" سريعة أثمن من "ربما" بطيئة.`,
          },
        ],
      },
      {
        title: "Closing & Relationships",
        titleAr: "الإغلاق والعلاقات",
        lessons: [
          {
            title: "Handling Objections & Closing",
            titleAr: "معالجة الاعتراضات والإغلاق",
            type: "TEXT",
            durationMinutes: 14,
            content: `## Objections are buying signals

An objection usually means the buyer is engaged but has a concern. Handle it calmly:

1. **Listen** fully — don't interrupt.
2. **Acknowledge** the concern genuinely.
3. **Respond** with evidence (a proof point, case, or trial).
4. **Confirm** the concern is resolved.

### Closing

Ask for the decision clearly once value is agreed: *"Shall we go ahead?"* Silence after asking is fine — let the buyer answer. A clear ask, at the right time, closes more than pressure ever will.`,
            contentAr: `## الاعتراضات إشارات شراء

الاعتراض غالبًا يعني أن المشتري مهتم لكن لديه قلق. عالجه بهدوء:

1. **استمع** كاملًا — دون مقاطعة.
2. **أقرّ** بالقلق بصدق.
3. **استجب** بدليل (برهان أو حالة أو تجربة).
4. **تأكّد** من أن القلق قد زال.

### الإغلاق

اطلب القرار بوضوح بعد الاتفاق على القيمة: *"هل نمضي قدمًا؟"* والصمت بعد السؤال أمر جيد — دع المشتري يجيب. الطلب الواضح في الوقت المناسب يُغلق أكثر مما يفعله الضغط.`,
          },
          {
            title: "Account Management & Follow-up",
            titleAr: "إدارة الحسابات والمتابعة",
            type: "TEXT",
            durationMinutes: 12,
            content: `## The sale is the start, not the end

Keeping a customer is cheaper than winning a new one. After the deal:

- **Deliver on promises** — set realistic expectations and meet them.
- **Follow up** proactively — check they're getting value.
- **Grow the account** — spot upsell/cross-sell opportunities that genuinely help.
- **Ask for referrals** from happy customers.

> Track your pipeline and follow-ups in a CRM so nothing slips. Consistency beats brilliance in account management.`,
            contentAr: `## البيع بداية لا نهاية

الحفاظ على العميل أرخص من كسب عميل جديد. بعد الصفقة:

- **أوفِ بالوعود** — ضع توقعات واقعية وحقّقها.
- **تابع** بشكل استباقي — تأكّد من حصولهم على القيمة.
- **نمِّ الحساب** — اكتشف فرص البيع الإضافي والمتقاطع التي تنفعهم فعلًا.
- **اطلب الترشيحات** من العملاء الراضين.

> تابع خط الفرص والمتابعات في نظام إدارة علاقات العملاء (CRM) كي لا يضيع شيء. فالاستمرارية تتفوّق على التألق في إدارة الحسابات.`,
          },
        ],
      },
      {
        title: "Knowledge Check",
        titleAr: "اختبار المعرفة",
        lessons: [
          {
            title: "Course Quiz",
            titleAr: "اختبار الدورة",
            type: "QUIZ",
            durationMinutes: 8,
            content: "",
            contentAr: "",
            passMark: 70,
            questions: [
              {
                prompt: "In qualifying a lead, 'Authority' refers to:",
                promptAr: "في تأهيل العميل المحتمل، تشير 'الصلاحية' إلى:",
                options: [
                  { text: "Access to the decision-maker", textAr: "الوصول إلى متّخذ القرار", correct: true },
                  { text: "The size of the company", textAr: "حجم الشركة" },
                  { text: "The product price", textAr: "سعر المنتج" },
                  { text: "The sales region", textAr: "منطقة البيع" },
                ],
                explanation: "Authority means the prospect can reach or is the decision-maker.",
                explanationAr: "الصلاحية تعني قدرة العميل على الوصول إلى متّخذ القرار أو كونه هو.",
              },
              {
                prompt: "A customer objection usually indicates:",
                promptAr: "اعتراض العميل عادةً يدل على:",
                options: [
                  { text: "Engagement with a concern to resolve", textAr: "اهتمامًا مع قلق يحتاج معالجة", correct: true },
                  { text: "A definite rejection", textAr: "رفضًا نهائيًا" },
                  { text: "That you should lower the price immediately", textAr: "وجوب خفض السعر فورًا" },
                  { text: "The end of the conversation", textAr: "نهاية المحادثة" },
                ],
                explanation: "Objections are buying signals — a concern to address, not a rejection.",
                explanationAr: "الاعتراضات إشارات شراء — قلق يُعالَج لا رفض.",
              },
              {
                prompt: "Compared to winning a new customer, retaining one is usually:",
                promptAr: "مقارنةً بكسب عميل جديد، فإن الحفاظ على عميل حالي عادةً:",
                options: [
                  { text: "Cheaper", textAr: "أرخص", correct: true },
                  { text: "More expensive", textAr: "أغلى" },
                  { text: "Impossible", textAr: "مستحيل" },
                  { text: "Irrelevant", textAr: "غير مهم" },
                ],
                explanation: "Retention is cheaper than acquisition — nurture existing accounts.",
                explanationAr: "الاستبقاء أرخص من الاكتساب — فاعتنِ بالحسابات الحالية.",
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 6) INFORMATION TECHNOLOGY
  // =========================================================================
  {
    key: "it-essentials",
    title: "IT & Cybersecurity Essentials",
    titleAr: "أساسيات تقنية المعلومات والأمن السيبراني",
    description:
      "Core IT concepts plus the everyday security habits — passwords, phishing, data protection — every employee needs.",
    descriptionAr:
      "مفاهيم تقنية المعلومات الأساسية إضافةً إلى عادات الأمن اليومية — كلمات المرور والتصيّد وحماية البيانات — التي يحتاجها كل موظف.",
    category: "Information Technology",
    level: "INTERMEDIATE",
    competency: "IT & Security",
    competencyAr: "تقنية المعلومات والأمن",
    modules: [
      {
        title: "IT Foundations",
        titleAr: "أسس تقنية المعلومات",
        lessons: [
          {
            title: "Core IT Concepts",
            titleAr: "المفاهيم الأساسية لتقنية المعلومات",
            type: "TEXT",
            durationMinutes: 14,
            content: `## The building blocks

- **Hardware** — physical devices (servers, laptops, phones).
- **Software** — programs and apps that run on hardware.
- **Network** — how devices connect and share data (LAN, internet, VPN).
- **Cloud** — computing and storage delivered over the internet (SaaS, IaaS) instead of on-premises.

Most business systems today are a mix: local devices connecting to cloud services. Understanding these layers helps you describe issues clearly to IT support.`,
            contentAr: `## اللبنات الأساسية

- **العتاد** — الأجهزة المادية (خوادم، حواسيب محمولة، هواتف).
- **البرمجيات** — البرامج والتطبيقات التي تعمل على العتاد.
- **الشبكة** — كيفية اتصال الأجهزة وتبادلها للبيانات (شبكة محلية، إنترنت، VPN).
- **السحابة** — الحوسبة والتخزين عبر الإنترنت (SaaS وIaaS) بدل الاستضافة المحلية.

معظم أنظمة الأعمال اليوم مزيج: أجهزة محلية تتصل بخدمات سحابية. وفهم هذه الطبقات يساعدك على وصف المشكلات بوضوح للدعم التقني.`,
          },
          {
            title: "Data, Backups & Availability",
            titleAr: "البيانات والنسخ الاحتياطي والإتاحة",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Data is the business

If data is lost, the business stops. Two ideas protect it:

- **Backups** — regular copies kept separately, so you can restore after loss, corruption or ransomware. An untested backup is not a backup — restores must be tested.
- **Availability** — systems stay reachable when needed (redundancy, monitoring, uptime targets).

> Follow the 3-2-1 rule: **3** copies of data, on **2** types of media, with **1** copy off-site.`,
            contentAr: `## البيانات هي العمل

إذا فُقدت البيانات، توقّف العمل. فكرتان تحميانها:

- **النسخ الاحتياطي** — نسخ منتظمة تُحفظ منفصلة، لتستعيد بعد الفقد أو التلف أو برامج الفدية. والنسخة غير المختبَرة ليست نسخة — فالاستعادة يجب أن تُختبر.
- **الإتاحة** — بقاء الأنظمة قابلة للوصول عند الحاجة (التكرار والمراقبة ومستهدفات وقت التشغيل).

> اتّبع قاعدة ٣-٢-١: **٣** نسخ من البيانات، على **٢** من أنواع الوسائط، مع **١** نسخة خارج الموقع.`,
          },
        ],
      },
      {
        title: "Security Basics",
        titleAr: "أساسيات الأمن",
        lessons: [
          {
            title: "Passwords, Phishing & Social Engineering",
            titleAr: "كلمات المرور والتصيّد والهندسة الاجتماعية",
            type: "TEXT",
            durationMinutes: 14,
            content: `## Most breaches start with a person

Attackers trick people more often than they hack systems.

- **Strong, unique passwords** — long passphrases, never reused. Use a password manager.
- **Multi-factor authentication (MFA)** — a second factor blocks most account takeovers.
- **Phishing** — fake emails/messages that lure you to click a link or share credentials. Check the sender, hover links, and never enter passwords from an email link.
- **Social engineering** — urgency and authority are red flags ("the CEO needs this wire now").

> When in doubt, stop and verify through a known channel. Report suspicious messages to IT.`,
            contentAr: `## معظم الاختراقات تبدأ بشخص

المهاجمون يخدعون الناس أكثر مما يخترقون الأنظمة.

- **كلمات مرور قوية وفريدة** — عبارات طويلة لا تُعاد. استخدم مدير كلمات مرور.
- **المصادقة متعددة العوامل (MFA)** — عامل ثانٍ يوقف معظم عمليات الاستيلاء على الحسابات.
- **التصيّد** — رسائل مزيّفة تغريك بالضغط على رابط أو مشاركة بياناتك. تحقّق من المُرسِل وحوّم فوق الروابط ولا تُدخل كلمة المرور من رابط بريد.
- **الهندسة الاجتماعية** — الاستعجال والسلطة إشارات خطر ("الرئيس التنفيذي يحتاج هذا التحويل الآن").

> عند الشك، توقّف وتحقّق عبر قناة معروفة. وأبلغ الدعم التقني عن الرسائل المشبوهة.`,
          },
          {
            title: "Protecting Company & Customer Data",
            titleAr: "حماية بيانات الشركة والعملاء",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Handle data like it's yours

- **Least privilege** — access only what your job needs.
- **Classify** — know what is public, internal or confidential, and treat each accordingly.
- **Encrypt** sensitive data and use secure channels; avoid personal email/USB for company data.
- **Lock screens**, log out, and keep devices updated.

In Saudi Arabia, personal data is protected by the **PDPL** — collect only what's needed, keep it secure, and don't share it improperly. Good data hygiene is everyone's job, not just IT's.`,
            contentAr: `## تعامل مع البيانات كأنها ملكك

- **أقل صلاحية** — لا تصل إلا لما يحتاجه عملك.
- **صنّف** — اعرف ما هو عام أو داخلي أو سري، وعامل كلًّا وفقًا لذلك.
- **شفّر** البيانات الحساسة واستخدم قنوات آمنة؛ وتجنّب البريد الشخصي وذاكرة USB لبيانات الشركة.
- **اقفل الشاشة** وسجّل الخروج وأبقِ الأجهزة محدّثة.

في السعودية، البيانات الشخصية محمية بـ**نظام حماية البيانات الشخصية (PDPL)** — اجمع ما يلزم فقط واحفظه آمنًا ولا تشاركه بغير حق. فنظافة البيانات مسؤولية الجميع لا تقنية المعلومات وحدها.`,
          },
        ],
      },
      {
        title: "Knowledge Check",
        titleAr: "اختبار المعرفة",
        lessons: [
          {
            title: "Course Quiz",
            titleAr: "اختبار الدورة",
            type: "QUIZ",
            durationMinutes: 8,
            content: "",
            contentAr: "",
            passMark: 70,
            questions: [
              {
                prompt: "The 3-2-1 backup rule recommends how many copies of your data?",
                promptAr: "توصي قاعدة النسخ الاحتياطي ٣-٢-١ بعدد كم من نسخ البيانات؟",
                options: [
                  { text: "3", textAr: "٣", correct: true },
                  { text: "1", textAr: "١" },
                  { text: "2", textAr: "٢" },
                  { text: "5", textAr: "٥" },
                ],
                explanation: "3 copies, on 2 media types, with 1 copy off-site.",
                explanationAr: "٣ نسخ، على نوعين من الوسائط، مع نسخة واحدة خارج الموقع.",
              },
              {
                prompt: "What most effectively blocks account takeover even if a password leaks?",
                promptAr: "ما الذي يمنع الاستيلاء على الحساب بفعالية حتى لو تسرّبت كلمة المرور؟",
                options: [
                  { text: "Multi-factor authentication (MFA)", textAr: "المصادقة متعددة العوامل (MFA)", correct: true },
                  { text: "A longer username", textAr: "اسم مستخدم أطول" },
                  { text: "Clearing the browser cache", textAr: "مسح ذاكرة المتصفح" },
                  { text: "Using dark mode", textAr: "استخدام الوضع الداكن" },
                ],
                explanation: "MFA adds a second factor that blocks most takeovers.",
                explanationAr: "تضيف MFA عاملًا ثانيًا يوقف معظم عمليات الاستيلاء.",
              },
              {
                prompt: "A suspicious email urgently demanding a payment is a sign of:",
                promptAr: "بريد مشبوه يطلب دفعة بإلحاح هو علامة على:",
                options: [
                  { text: "Phishing / social engineering", textAr: "التصيّد / الهندسة الاجتماعية", correct: true },
                  { text: "A software update", textAr: "تحديث برمجي" },
                  { text: "A normal IT request", textAr: "طلب تقني عادي" },
                  { text: "A backup notification", textAr: "إشعار نسخ احتياطي" },
                ],
                explanation: "Urgency + authority are classic phishing red flags — verify first.",
                explanationAr: "الاستعجال والسلطة إشارتا تصيّد كلاسيكيتان — تحقّق أولًا.",
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 7) HEALTH, SAFETY & ENVIRONMENT (HSE)
  // =========================================================================
  {
    key: "hse-essentials",
    title: "Workplace Safety (HSE) Essentials",
    titleAr: "أساسيات الصحة والسلامة المهنية",
    description:
      "Identify hazards, control risk, use PPE, report incidents and respond to emergencies — the core of a safe workplace.",
    descriptionAr:
      "تحديد المخاطر وضبطها واستخدام معدات الوقاية والإبلاغ عن الحوادث والاستجابة للطوارئ — جوهر بيئة عمل آمنة.",
    category: "Health, Safety & Environment",
    level: "FOUNDATION",
    competency: "Workplace Safety",
    competencyAr: "السلامة المهنية",
    modules: [
      {
        title: "Safety Foundations",
        titleAr: "أسس السلامة",
        lessons: [
          {
            title: "Hazards, Risk & the Hierarchy of Controls",
            titleAr: "المخاطر والخطورة وتسلسل الضوابط",
            type: "TEXT",
            durationMinutes: 14,
            content: `## Control hazards at the source

A **hazard** is anything that can cause harm; **risk** is how likely and severe that harm is. Control risks using the **hierarchy of controls**, most effective first:

1. **Eliminate** — remove the hazard entirely.
2. **Substitute** — replace it with something safer.
3. **Engineering controls** — guards, ventilation, barriers.
4. **Administrative controls** — procedures, training, signage.
5. **PPE** — personal protective equipment, the last line of defense.

> PPE alone is the weakest control. Always ask first: can we eliminate or engineer the hazard out?`,
            contentAr: `## اضبط المخاطر من المصدر

**الخطر** أي شيء قد يسبب ضررًا؛ و**الخطورة** مدى احتمال ذلك الضرر وشدّته. اضبط المخاطر عبر **تسلسل الضوابط**، الأكثر فعالية أولًا:

1. **الإزالة** — إزالة الخطر كليًا.
2. **الاستبدال** — استبداله بأكثر أمانًا.
3. **الضوابط الهندسية** — حواجز وتهوية وعوازل.
4. **الضوابط الإدارية** — إجراءات وتدريب ولوحات إرشادية.
5. **معدات الوقاية الشخصية (PPE)** — خط الدفاع الأخير.

> معدات الوقاية وحدها أضعف الضوابط. اسأل دائمًا أولًا: هل يمكن إزالة الخطر أو هندسته بعيدًا؟`,
          },
          {
            title: "PPE & Safe Work Practices",
            titleAr: "معدات الوقاية وممارسات العمل الآمن",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Everyday habits that prevent injury

- **Wear the right PPE** — helmet, safety glasses, gloves, boots, hi-vis, hearing protection as required — and keep it in good condition.
- **Follow procedures** — permits to work, lockout/tagout for machinery, safe lifting (bend the knees, not the back).
- **Housekeeping** — keep walkways clear; spills and clutter cause slips and trips.
- **Stop unsafe work** — everyone has the right and duty to stop a task that is unsafe.

> If it isn't safe, it doesn't happen. No deadline is worth an injury.`,
            contentAr: `## عادات يومية تمنع الإصابة

- **ارتدِ معدات الوقاية المناسبة** — خوذة ونظارات وقفازات وأحذية وسترة عاكسة وواقي سمع حسب الحاجة — وحافظ على سلامتها.
- **اتّبع الإجراءات** — تصاريح العمل، وفصل وتأمين الطاقة للآلات، والرفع الآمن (اثنِ الركبتين لا الظهر).
- **النظافة والترتيب** — أبقِ الممرات خالية؛ فالانسكاب والفوضى يسببان الانزلاق والتعثّر.
- **أوقف العمل غير الآمن** — للجميع الحق والواجب في إيقاف أي مهمة غير آمنة.

> إن لم يكن آمنًا، فلا يحدث. لا موعد نهائي يستحق إصابة.`,
          },
        ],
      },
      {
        title: "On-site & Emergencies",
        titleAr: "الموقع والطوارئ",
        lessons: [
          {
            title: "Incident Reporting & Investigation",
            titleAr: "الإبلاغ عن الحوادث والتحقيق فيها",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Report everything — including near misses

A **near miss** is an incident that could have caused harm but didn't. Reporting it lets you fix the cause before someone is hurt.

- **Report promptly** to your supervisor and log it.
- **Investigate the root cause**, not just the surface — ask "why" repeatedly.
- **Act** — put a corrective action in place and share the lesson.

> A blame-free reporting culture surfaces problems early. Punishing reporters just hides the next accident.`,
            contentAr: `## أبلِغ عن كل شيء — بما فيها الحوادث الوشيكة

**الحادث الوشيك** واقعة كان يمكن أن تسبب ضررًا لكنها لم تفعل. والإبلاغ عنها يتيح إصلاح السبب قبل أن يُصاب أحد.

- **أبلِغ فورًا** مشرفك وسجّل الواقعة.
- **حقّق في السبب الجذري** لا السطح فقط — اسأل "لماذا" مرارًا.
- **تصرّف** — ضع إجراءً تصحيحيًا وشارك الدرس.

> ثقافة الإبلاغ دون لوم تُظهر المشكلات مبكرًا. ومعاقبة المُبلِّغين تُخفي الحادث التالي فقط.`,
          },
          {
            title: "Emergency Response & Fire Safety",
            titleAr: "الاستجابة للطوارئ وسلامة الحريق",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Know what to do before it happens

- **Know your exits** and the assembly point.
- **On a fire alarm** — stop work, leave calmly by the nearest safe exit, do not use lifts, go to the assembly point.
- **Fire needs three things** — heat, fuel, oxygen. Extinguishers remove one; only tackle small fires if trained and safe.
- **First aid** — know who the first aiders are and where the kit is.

> Practise drills seriously. In a real emergency you fall back on what you rehearsed, not what you read once.`,
            contentAr: `## اعرف ما تفعله قبل وقوعه

- **اعرف المخارج** ونقطة التجمّع.
- **عند إنذار الحريق** — أوقف العمل، وغادر بهدوء من أقرب مخرج آمن، ولا تستخدم المصاعد، وتوجّه لنقطة التجمّع.
- **الحريق يحتاج ثلاثة أشياء** — حرارة ووقود وأكسجين. وطفّايات الحريق تزيل أحدها؛ ولا تتعامل إلا مع حريق صغير إن كنت مدرَّبًا وآمنًا.
- **الإسعافات الأولية** — اعرف المسعفين ومكان حقيبة الإسعاف.

> تدرّب على الإخلاء بجدية. ففي طارئ حقيقي تعتمد على ما تدرّبت عليه لا على ما قرأته مرة.`,
          },
        ],
      },
      {
        title: "Knowledge Check",
        titleAr: "اختبار المعرفة",
        lessons: [
          {
            title: "Course Quiz",
            titleAr: "اختبار الدورة",
            type: "QUIZ",
            durationMinutes: 8,
            content: "",
            contentAr: "",
            passMark: 70,
            questions: [
              {
                prompt: "In the hierarchy of controls, which is the MOST effective?",
                promptAr: "في تسلسل الضوابط، أيها الأكثر فعالية؟",
                options: [
                  { text: "Eliminate the hazard", textAr: "إزالة الخطر", correct: true },
                  { text: "Personal protective equipment (PPE)", textAr: "معدات الوقاية الشخصية" },
                  { text: "Warning signs", textAr: "لوحات التحذير" },
                  { text: "Procedures", textAr: "الإجراءات" },
                ],
                explanation: "Elimination is the most effective; PPE is the last resort.",
                explanationAr: "الإزالة الأكثر فعالية؛ ومعدات الوقاية هي الملاذ الأخير.",
              },
              {
                prompt: "A 'near miss' should be:",
                promptAr: "الحادث الوشيك ينبغي:",
                options: [
                  { text: "Reported and investigated", textAr: "الإبلاغ عنه والتحقيق فيه", correct: true },
                  { text: "Ignored since no one was hurt", textAr: "تجاهله ما دام لم يُصب أحد" },
                  { text: "Kept secret", textAr: "إبقاؤه سرًا" },
                  { text: "Celebrated", textAr: "الاحتفال به" },
                ],
                explanation: "Near misses reveal causes before an injury happens — report them.",
                explanationAr: "الحوادث الوشيكة تكشف الأسباب قبل وقوع إصابة — فأبلِغ عنها.",
              },
              {
                prompt: "On hearing a fire alarm you should:",
                promptAr: "عند سماع إنذار الحريق ينبغي أن:",
                options: [
                  { text: "Leave calmly via the nearest safe exit, no lifts", textAr: "تغادر بهدوء من أقرب مخرج آمن دون مصاعد", correct: true },
                  { text: "Finish your task first", textAr: "تُنهي مهمتك أولًا" },
                  { text: "Take the lift down quickly", textAr: "تنزل بالمصعد بسرعة" },
                  { text: "Wait at your desk", textAr: "تنتظر عند مكتبك" },
                ],
                explanation: "Evacuate calmly by the nearest safe exit; never use lifts.",
                explanationAr: "أخلِ بهدوء من أقرب مخرج آمن؛ ولا تستخدم المصاعد أبدًا.",
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 8) PROCUREMENT & SUPPLY CHAIN
  // =========================================================================
  {
    key: "procurement-basics",
    title: "Procurement & Supply Chain Basics",
    titleAr: "أساسيات المشتريات وسلسلة الإمداد",
    description:
      "The procurement cycle, supplier selection, and the inventory and logistics fundamentals that control cost and service.",
    descriptionAr:
      "دورة المشتريات واختيار الموردين وأساسيات المخزون واللوجستيات التي تضبط التكلفة ومستوى الخدمة.",
    category: "Procurement & Supply Chain",
    level: "FOUNDATION",
    competency: "Procurement & Supply Chain",
    competencyAr: "المشتريات وسلسلة الإمداد",
    modules: [
      {
        title: "Procurement",
        titleAr: "المشتريات",
        lessons: [
          {
            title: "The Procurement Cycle",
            titleAr: "دورة المشتريات",
            type: "TEXT",
            durationMinutes: 13,
            content: `## From need to payment

A controlled purchase follows a cycle:

1. **Identify need** and specify it clearly.
2. **Request/approve** (purchase requisition) within authority limits.
3. **Source** — get quotes / run a tender for larger spend.
4. **Purchase order (PO)** — the formal commitment.
5. **Receive & inspect** goods against the PO.
6. **Three-way match** — PO, delivery note and invoice must agree before payment.

> The three-way match prevents overpaying and fraud. No match, no payment.`,
            contentAr: `## من الحاجة إلى الدفع

الشراء المنضبط يتبع دورة:

1. **تحديد الحاجة** وتوصيفها بوضوح.
2. **الطلب/الاعتماد** (طلب شراء) ضمن حدود الصلاحية.
3. **التوريد** — الحصول على عروض / طرح مناقصة للإنفاق الأكبر.
4. **أمر الشراء (PO)** — الالتزام الرسمي.
5. **الاستلام والفحص** للبضائع مقابل أمر الشراء.
6. **المطابقة الثلاثية** — يجب توافق أمر الشراء وسند التسليم والفاتورة قبل الدفع.

> المطابقة الثلاثية تمنع الدفع الزائد والاحتيال. لا مطابقة، لا دفع.`,
          },
          {
            title: "Supplier Selection & Evaluation",
            titleAr: "اختيار الموردين وتقييمهم",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Choose on value, not just price

Compare suppliers on **total value**, not the lowest quote alone:

- **Quality** — does it meet specification reliably?
- **Price & total cost** — including delivery, warranty, and rework.
- **Delivery** — lead time and on-time reliability.
- **Service & risk** — support, financial stability, single-source risk.

Keep it fair and transparent — clear criteria, documented decisions. Review supplier performance regularly (scorecards) and build relationships with your critical vendors.

> The cheapest supplier is expensive if they deliver late or fail on quality.`,
            contentAr: `## اختر على القيمة لا السعر فقط

قارن الموردين على **القيمة الإجمالية** لا أقل عرض وحده:

- **الجودة** — هل تحقّق المواصفة بموثوقية؟
- **السعر والتكلفة الإجمالية** — شاملةً التوصيل والضمان وإعادة العمل.
- **التسليم** — مدة التوريد والالتزام بالمواعيد.
- **الخدمة والمخاطر** — الدعم والاستقرار المالي ومخاطر المصدر الوحيد.

اجعلها عادلة وشفافة — معايير واضحة وقرارات موثّقة. راجع أداء الموردين دوريًا (بطاقات أداء) وابنِ علاقات مع مورّديك الحرجين.

> المورّد الأرخص باهظ إن تأخّر في التسليم أو أخفق في الجودة.`,
          },
        ],
      },
      {
        title: "Supply Chain",
        titleAr: "سلسلة الإمداد",
        lessons: [
          {
            title: "Inventory & Demand Basics",
            titleAr: "أساسيات المخزون والطلب",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Balance the cost of stock against the cost of running out

- **Too much stock** ties up cash and risks obsolescence.
- **Too little** causes stockouts and lost sales.

Key tools:

- **Reorder point** — reorder when stock hits a level that covers demand during the lead time.
- **Safety stock** — a buffer for demand/supply variability.
- **ABC analysis** — focus tight control on the few high-value items (A) that drive most of the value.

> Match inventory policy to demand: tight control for critical items, simpler rules for the rest.`,
            contentAr: `## وازن بين كلفة المخزون وكلفة نفاده

- **المخزون الزائد** يجمّد النقد ويخاطر بالتقادم.
- **القليل جدًا** يسبّب النفاد وخسارة المبيعات.

أدوات رئيسية:

- **نقطة إعادة الطلب** — أعد الطلب حين يبلغ المخزون مستوى يغطي الطلب خلال مدة التوريد.
- **مخزون الأمان** — احتياطي لتقلّب الطلب/التوريد.
- **تحليل ABC** — ركّز الضبط المُحكَم على البنود القليلة عالية القيمة (A) التي تصنع معظم القيمة.

> واءم سياسة المخزون مع الطلب: ضبط مُحكَم للبنود الحرجة وقواعد أبسط للبقية.`,
          },
          {
            title: "Logistics & Cost Control",
            titleAr: "اللوجستيات وضبط التكلفة",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Move goods reliably and affordably

**Logistics** is getting the right goods to the right place, on time, at the right cost — transport, warehousing and distribution.

- **Total landed cost** — include freight, customs/duties, insurance and handling, not just unit price.
- **Incoterms** — international shipping terms that define who pays and bears risk at each step.
- **Plan for reliability** — buffer critical routes; a cheap route that's often late costs more overall.

> Optimise the whole chain, not one link. Local savings that break the flow downstream cost more than they save.`,
            contentAr: `## انقل البضائع بموثوقية وباقتصاد

**اللوجستيات** إيصال البضائع الصحيحة للمكان الصحيح في الوقت المناسب وبالتكلفة المناسبة — النقل والتخزين والتوزيع.

- **التكلفة الإجمالية حتى الوصول** — تشمل الشحن والجمارك والتأمين والمناولة لا سعر الوحدة فقط.
- **الإنكوترمز (Incoterms)** — شروط الشحن الدولية التي تحدّد من يدفع ويتحمّل المخاطرة في كل خطوة.
- **خطّط للموثوقية** — احتَط للمسارات الحرجة؛ فالمسار الرخيص كثير التأخير أغلى إجمالًا.

> حسّن السلسلة كاملة لا حلقة واحدة. فالوفورات المحلية التي تكسر الانسياب لاحقًا تكلّف أكثر مما توفّر.`,
          },
        ],
      },
      {
        title: "Knowledge Check",
        titleAr: "اختبار المعرفة",
        lessons: [
          {
            title: "Course Quiz",
            titleAr: "اختبار الدورة",
            type: "QUIZ",
            durationMinutes: 8,
            content: "",
            contentAr: "",
            passMark: 70,
            questions: [
              {
                prompt: "The 'three-way match' checks that which documents agree before payment?",
                promptAr: "تتحقق 'المطابقة الثلاثية' من توافق أي مستندات قبل الدفع؟",
                options: [
                  { text: "Purchase order, delivery note, invoice", textAr: "أمر الشراء وسند التسليم والفاتورة", correct: true },
                  { text: "Contract, email, phone call", textAr: "العقد والبريد والمكالمة" },
                  { text: "Budget, forecast, actual", textAr: "الميزانية والتوقّع والفعلي" },
                  { text: "Quote, brochure, receipt", textAr: "العرض والكتيّب والإيصال" },
                ],
                explanation: "PO, delivery note and invoice must match before paying.",
                explanationAr: "يجب توافق أمر الشراء وسند التسليم والفاتورة قبل الدفع.",
              },
              {
                prompt: "In ABC analysis, 'A' items are those that are:",
                promptAr: "في تحليل ABC، بنود 'A' هي التي:",
                options: [
                  { text: "Few but high-value", textAr: "قليلة لكن عالية القيمة", correct: true },
                  { text: "Many and low-value", textAr: "كثيرة ومنخفضة القيمة" },
                  { text: "Always imported", textAr: "مستوردة دائمًا" },
                  { text: "Out of stock", textAr: "نافدة" },
                ],
                explanation: "A items are the few high-value items needing tight control.",
                explanationAr: "بنود A هي القليلة عالية القيمة التي تحتاج ضبطًا مُحكَمًا.",
              },
              {
                prompt: "When comparing suppliers, the best basis is:",
                promptAr: "عند مقارنة الموردين، الأساس الأفضل هو:",
                options: [
                  { text: "Total value (quality, delivery, risk, cost)", textAr: "القيمة الإجمالية (الجودة والتسليم والمخاطر والتكلفة)", correct: true },
                  { text: "Lowest quote only", textAr: "أقل عرض سعر فقط" },
                  { text: "Nearest office", textAr: "أقرب مكتب" },
                  { text: "Largest company", textAr: "أكبر شركة" },
                ],
                explanation: "Choose on total value, not the lowest price alone.",
                explanationAr: "اختر على القيمة الإجمالية لا أقل سعر وحده.",
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 9) OPERATIONS & WAREHOUSING
  // =========================================================================
  {
    key: "operations-warehousing",
    title: "Operations & Warehouse Management",
    titleAr: "إدارة العمليات والمستودعات",
    description:
      "Run efficient, accurate and safe warehouse operations — from receiving to dispatch — with lean and 5S practices.",
    descriptionAr:
      "تشغيل مستودع فعّال ودقيق وآمن — من الاستلام حتى الإرسال — بممارسات اللين و5S.",
    category: "Operations & Warehousing",
    level: "FOUNDATION",
    competency: "Operations Management",
    competencyAr: "إدارة العمليات",
    modules: [
      {
        title: "Warehouse Operations",
        titleAr: "عمليات المستودع",
        lessons: [
          {
            title: "Receiving, Put-away & Picking",
            titleAr: "الاستلام والتخزين والانتقاء",
            type: "TEXT",
            durationMinutes: 13,
            content: `## The core warehouse flow

1. **Receiving** — check incoming goods against the PO/delivery note for quantity, quality and damage before accepting.
2. **Put-away** — store items in the correct, labelled location so they can be found fast.
3. **Picking** — retrieve items accurately for each order.
4. **Dispatch** — pack, verify and ship.

Accurate locations and clear labelling drive everything: they cut search time, errors and returns.

> "A place for everything, and everything in its place" is the foundation of a fast warehouse.`,
            contentAr: `## الانسياب الأساسي للمستودع

1. **الاستلام** — افحص البضائع الواردة مقابل أمر الشراء/سند التسليم من حيث الكمية والجودة والتلف قبل القبول.
2. **التخزين** — خزّن البنود في موقع صحيح ومُعلَّم ليسهل إيجادها بسرعة.
3. **الانتقاء** — استرجع البنود بدقة لكل طلب.
4. **الإرسال** — غلّف وتحقّق واشحن.

المواقع الدقيقة والتعليم الواضح يحرّكان كل شيء: يقلّلان وقت البحث والأخطاء والمرتجعات.

> "مكان لكل شيء، وكل شيء في مكانه" أساس المستودع السريع.`,
          },
          {
            title: "Inventory Accuracy & 5S",
            titleAr: "دقة المخزون و5S",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Accuracy you can trust

If the system says 100 and the shelf has 90, every plan built on that number is wrong.

- **Cycle counting** — count a subset of items regularly instead of one big annual count; fix root causes of discrepancies.
- **5S** — a workplace-organization method: **Sort, Set in order, Shine, Standardize, Sustain** — for a clean, orderly, efficient space.

> Inventory accuracy is a discipline, not an event. Small, frequent counts beat one big year-end scramble.`,
            contentAr: `## دقة يمكن الوثوق بها

إذا قال النظام ١٠٠ وعلى الرف ٩٠، فكل خطة مبنية على ذلك الرقم خاطئة.

- **الجرد الدوري** — عُدّ مجموعة فرعية من البنود بانتظام بدل جرد سنوي كبير واحد؛ وعالِج الأسباب الجذرية للفروقات.
- **5S** — منهج لتنظيم مكان العمل: **الفرز، الترتيب، التنظيف، التوحيد، الاستدامة** — لمساحة نظيفة ومرتّبة وفعّالة.

> دقة المخزون انضباط لا حدث. فالجرد الصغير المتكرر يتفوّق على فوضى نهاية العام الكبيرة.`,
          },
        ],
      },
      {
        title: "Efficiency & Safety",
        titleAr: "الكفاءة والسلامة",
        lessons: [
          {
            title: "Lean & Continuous Improvement",
            titleAr: "اللين والتحسين المستمر",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Remove waste, improve flow

**Lean** targets waste — anything the customer wouldn't pay for: waiting, excess motion, over-processing, defects, excess inventory, and unnecessary transport.

- **Map the process** and question every step: does it add value?
- **Standardize** the best-known method so quality is consistent.
- **Kaizen** — small, continuous improvements from the people doing the work.

> Big leaps are rare; compounding small improvements is how great operations are built.`,
            contentAr: `## أزل الهدر وحسّن الانسياب

يستهدف **اللين** الهدر — كل ما لا يدفع العميل مقابله: الانتظار، الحركة الزائدة، الإفراط في المعالجة، العيوب، المخزون الزائد، والنقل غير الضروري.

- **ارسم العملية** وشكّك في كل خطوة: هل تضيف قيمة؟
- **وحّد** أفضل طريقة معروفة لتثبات الجودة.
- **كايزن** — تحسينات صغيرة مستمرة من منفّذي العمل أنفسهم.

> القفزات الكبيرة نادرة؛ وتراكم التحسينات الصغيرة هو كيف تُبنى العمليات العظيمة.`,
          },
          {
            title: "Warehouse Safety",
            titleAr: "سلامة المستودع",
            type: "TEXT",
            durationMinutes: 11,
            content: `## Speed never overrides safety

- **Forklift & vehicle safety** — trained operators only, marked pedestrian routes, safe speeds, spotters where needed.
- **Safe stacking & racking** — respect load limits; don't overload shelves; inspect racking for damage.
- **Manual handling** — use aids, get help for heavy loads, lift with the legs.
- **Housekeeping** — clear aisles, clean spills immediately, keep fire exits unobstructed.

> Most warehouse injuries are preventable. Report hazards, follow the rules, and look out for teammates.`,
            contentAr: `## السرعة لا تتقدّم على السلامة أبدًا

- **سلامة الرافعات والمركبات** — مشغّلون مدرَّبون فقط، ومسارات مشاة مُعلَّمة، وسرعات آمنة، ومراقبون عند الحاجة.
- **التستيف والرفوف الآمنة** — احترم حدود الأحمال؛ ولا تُحمّل الرفوف فوق طاقتها؛ وافحصها من التلف.
- **المناولة اليدوية** — استخدم المساعدات واطلب العون للأحمال الثقيلة وارفع بالساقين.
- **النظافة والترتيب** — ممرات خالية، وتنظيف فوري للانسكاب، وإبقاء مخارج الحريق دون عوائق.

> معظم إصابات المستودعات يمكن منعها. أبلِغ عن المخاطر واتّبع القواعد واحرص على زملائك.`,
          },
        ],
      },
      {
        title: "Knowledge Check",
        titleAr: "اختبار المعرفة",
        lessons: [
          {
            title: "Course Quiz",
            titleAr: "اختبار الدورة",
            type: "QUIZ",
            durationMinutes: 8,
            content: "",
            contentAr: "",
            passMark: 70,
            questions: [
              {
                prompt: "What does the '5S' method stand for?",
                promptAr: "ماذا يمثّل منهج '5S'؟",
                options: [
                  { text: "Sort, Set in order, Shine, Standardize, Sustain", textAr: "الفرز، الترتيب، التنظيف، التوحيد، الاستدامة", correct: true },
                  { text: "Store, Sell, Ship, Split, Scan", textAr: "التخزين، البيع، الشحن، التقسيم، المسح" },
                  { text: "Safety, Speed, Service, Sales, Stock", textAr: "السلامة، السرعة، الخدمة، المبيعات، المخزون" },
                  { text: "Start, Stop, Study, Solve, Share", textAr: "ابدأ، توقّف، ادرس، حل، شارك" },
                ],
                explanation: "5S = Sort, Set in order, Shine, Standardize, Sustain.",
                explanationAr: "5S = الفرز، الترتيب، التنظيف، التوحيد، الاستدامة.",
              },
              {
                prompt: "Counting a subset of inventory regularly instead of one annual count is called:",
                promptAr: "عدّ مجموعة فرعية من المخزون بانتظام بدل جرد سنوي واحد يُسمّى:",
                options: [
                  { text: "Cycle counting", textAr: "الجرد الدوري", correct: true },
                  { text: "Overstocking", textAr: "الإفراط في التخزين" },
                  { text: "Backordering", textAr: "الطلب المؤجّل" },
                  { text: "Cross-docking", textAr: "المناولة العابرة" },
                ],
                explanation: "Cycle counting keeps accuracy high without a big annual count.",
                explanationAr: "الجرد الدوري يبقي الدقة عالية دون جرد سنوي كبير.",
              },
              {
                prompt: "In Lean, 'waste' means:",
                promptAr: "في اللين، 'الهدر' يعني:",
                options: [
                  { text: "Anything the customer wouldn't pay for", textAr: "كل ما لا يدفع العميل مقابله", correct: true },
                  { text: "Only physical scrap", textAr: "الخردة المادية فقط" },
                  { text: "Employee break time", textAr: "وقت استراحة الموظفين" },
                  { text: "Spending on training", textAr: "الإنفاق على التدريب" },
                ],
                explanation: "Waste is any step that doesn't add value the customer would pay for.",
                explanationAr: "الهدر أي خطوة لا تضيف قيمة يدفع العميل مقابلها.",
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 10) CUSTOMER SERVICE
  // =========================================================================
  {
    key: "customer-service-excellence",
    title: "Customer Service Excellence",
    titleAr: "التميّز في خدمة العملاء",
    description:
      "Deliver great service — the customer mindset, communication, handling complaints, and turning problems into loyalty.",
    descriptionAr:
      "قدّم خدمة متميّزة — عقلية العميل والتواصل ومعالجة الشكاوى وتحويل المشكلات إلى ولاء.",
    category: "Customer Service",
    level: "FOUNDATION",
    competency: "Customer Service",
    competencyAr: "خدمة العملاء",
    modules: [
      {
        title: "Service Foundations",
        titleAr: "أسس الخدمة",
        lessons: [
          {
            title: "The Customer Experience Mindset",
            titleAr: "عقلية تجربة العميل",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Every interaction is the brand

Customers judge the whole company by the person in front of them. A service mindset means:

- **Own the problem** — even if you didn't cause it, you can help solve it.
- **Empathy first** — acknowledge how the customer feels before jumping to a fix.
- **Be reliable** — do what you say, when you said, every time.

> A customer rarely remembers the exact issue; they remember how you made them feel while solving it.`,
            contentAr: `## كل تفاعل هو العلامة التجارية

يحكم العملاء على الشركة كلها من خلال الشخص أمامهم. وعقلية الخدمة تعني:

- **تبنَّ المشكلة** — حتى لو لم تتسبّب بها، يمكنك المساعدة في حلها.
- **التعاطف أولًا** — أقرّ بشعور العميل قبل القفز إلى الحل.
- **كن موثوقًا** — افعل ما تقوله في وقته، في كل مرة.

> نادرًا ما يتذكّر العميل المشكلة بالضبط؛ لكنه يتذكّر كيف جعلته يشعر أثناء حلها.`,
          },
          {
            title: "Communication & Active Listening",
            titleAr: "التواصل والإنصات الفعّال",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Listen to understand, not to reply

- **Active listening** — let the customer finish, then paraphrase back ("So what you need is…") to confirm you understood.
- **Clear, positive language** — say what you *can* do, not just what you can't.
- **Tone matters** — calm, respectful and patient, in person, on the phone and in writing.
- **Set expectations** — tell them what happens next and by when.

> Most complaints escalate not because of the problem, but because the customer felt unheard.`,
            contentAr: `## أنصت لتفهم لا لتردّ

- **الإنصات الفعّال** — دع العميل يُكمل ثم أعد الصياغة ("إذًا ما تحتاجه هو…") لتأكيد فهمك.
- **لغة واضحة وإيجابية** — قل ما *تستطيع* فعله لا ما لا تستطيع فقط.
- **النبرة مهمة** — هادئة ومحترمة وصبورة، شخصيًا وهاتفيًا وكتابيًا.
- **حدّد التوقعات** — أخبرهم بما سيحدث لاحقًا ومتى.

> معظم الشكاوى تتصاعد لا بسبب المشكلة، بل لأن العميل شعر أنه لم يُسمَع.`,
          },
        ],
      },
      {
        title: "Handling Difficulty",
        titleAr: "التعامل مع الصعوبات",
        lessons: [
          {
            title: "Managing Complaints & Difficult Customers",
            titleAr: "إدارة الشكاوى والعملاء الصعبين",
            type: "TEXT",
            durationMinutes: 13,
            content: `## Stay calm and solve

A simple method for complaints — **LAST**:

1. **Listen** — hear the full issue without defensiveness.
2. **Apologize** — sincerely, for the impact on them (not necessarily fault).
3. **Solve** — offer a concrete fix or options; act quickly.
4. **Thank** — thank them for raising it; it's a chance to improve.

With an angry customer, keep your tone calm, don't take it personally, and focus on what you *can* do next.

> Never argue to win. You can win the argument and lose the customer.`,
            contentAr: `## ابقَ هادئًا وحُلّ

طريقة بسيطة للشكاوى — **LAST**:

1. **أنصت** — استمع للمشكلة كاملة دون تحفّز.
2. **اعتذر** — بصدق، عن الأثر عليهم (لا عن الخطأ بالضرورة).
3. **حُلّ** — قدّم حلًا ملموسًا أو خيارات؛ وتصرّف بسرعة.
4. **اشكر** — اشكرهم على الإبلاغ؛ فهي فرصة للتحسين.

مع العميل الغاضب، أبقِ نبرتك هادئة، ولا تأخذها بشكل شخصي، وركّز على ما *تستطيع* فعله تاليًا.

> لا تجادل لتنتصر. فقد تكسب الجدال وتخسر العميل.`,
          },
          {
            title: "Service Recovery & Follow-through",
            titleAr: "استرداد الخدمة والمتابعة",
            type: "TEXT",
            durationMinutes: 11,
            content: `## A great recovery builds loyalty

The **service recovery paradox**: a problem handled brilliantly can leave a customer *more* loyal than if nothing had gone wrong.

- **Fix it fully** — don't leave loose ends.
- **Follow up** — check the solution actually worked.
- **Close the loop internally** — feed the root cause back so it doesn't recur for the next customer.

> Complaints are free feedback. Each one is a chance to fix a process and keep a customer for life.`,
            contentAr: `## الاسترداد الرائع يبني الولاء

**مفارقة استرداد الخدمة**: المشكلة التي تُعالَج ببراعة قد تترك العميل *أكثر* ولاءً مما لو لم يحدث خطأ أصلًا.

- **حُلّها كاملة** — لا تترك أطرافًا معلّقة.
- **تابِع** — تأكّد أن الحل نجح فعلًا.
- **أغلِق الحلقة داخليًا** — أعد السبب الجذري كي لا يتكرّر مع العميل التالي.

> الشكاوى تغذية راجعة مجانية. كل واحدة فرصة لإصلاح عملية والاحتفاظ بعميل مدى الحياة.`,
          },
        ],
      },
      {
        title: "Knowledge Check",
        titleAr: "اختبار المعرفة",
        lessons: [
          {
            title: "Course Quiz",
            titleAr: "اختبار الدورة",
            type: "QUIZ",
            durationMinutes: 8,
            content: "",
            contentAr: "",
            passMark: 70,
            questions: [
              {
                prompt: "In the LAST method for complaints, the 'A' stands for:",
                promptAr: "في طريقة LAST للشكاوى، يمثّل حرف 'A':",
                options: [
                  { text: "Apologize", textAr: "الاعتذار", correct: true },
                  { text: "Argue", textAr: "الجدال" },
                  { text: "Avoid", textAr: "التجنّب" },
                  { text: "Assign blame", textAr: "إلقاء اللوم" },
                ],
                explanation: "LAST = Listen, Apologize, Solve, Thank.",
                explanationAr: "LAST = أنصت، اعتذر، حُلّ، اشكر.",
              },
              {
                prompt: "Active listening includes:",
                promptAr: "يتضمّن الإنصات الفعّال:",
                options: [
                  { text: "Paraphrasing back to confirm understanding", textAr: "إعادة الصياغة لتأكيد الفهم", correct: true },
                  { text: "Interrupting to save time", textAr: "المقاطعة لتوفير الوقت" },
                  { text: "Talking more than the customer", textAr: "التحدّث أكثر من العميل" },
                  { text: "Ignoring their tone", textAr: "تجاهل نبرتهم" },
                ],
                explanation: "Confirm understanding by paraphrasing what the customer said.",
                explanationAr: "أكّد الفهم بإعادة صياغة ما قاله العميل.",
              },
              {
                prompt: "The 'service recovery paradox' means:",
                promptAr: "تعني 'مفارقة استرداد الخدمة':",
                options: [
                  { text: "A well-handled problem can increase loyalty", textAr: "المشكلة المُعالَجة جيدًا قد تزيد الولاء", correct: true },
                  { text: "Customers always leave after a problem", textAr: "العملاء يغادرون دائمًا بعد أي مشكلة" },
                  { text: "Complaints should be ignored", textAr: "ينبغي تجاهل الشكاوى" },
                  { text: "Recovery is impossible", textAr: "الاسترداد مستحيل" },
                ],
                explanation: "A brilliant recovery can leave a customer more loyal than before.",
                explanationAr: "الاسترداد الرائع قد يترك العميل أكثر ولاءً من قبل.",
              },
            ],
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
