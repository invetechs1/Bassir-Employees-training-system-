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
  { key: "Construction & Contracting", en: "Construction & Contracting", ar: "الإنشاء والمقاولات" },
  { key: "Engineering & Design", en: "Engineering & Design", ar: "الهندسة والتصميم" },
  { key: "Logistics & Transportation", en: "Logistics & Transportation", ar: "الخدمات اللوجستية والنقل" },
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

  // =========================================================================
  // 11) CONSTRUCTION & CONTRACTING
  // =========================================================================
  {
    key: "construction-site-delivery",
    title: "Construction Project Delivery & Site Safety",
    titleAr: "تنفيذ مشاريع الإنشاء وسلامة الموقع",
    description:
      "Deliver construction projects on time and safely — project phases, planning and progress control, quality against the Saudi Building Code, and site safety with permit-to-work.",
    descriptionAr:
      "نفّذ مشاريع الإنشاء في الوقت المحدد وبأمان — مراحل المشروع والتخطيط وضبط التقدّم والجودة وفق كود البناء السعودي وسلامة الموقع بنظام تصريح العمل.",
    category: "Construction & Contracting",
    level: "INTERMEDIATE",
    competency: "Construction Management",
    competencyAr: "إدارة الإنشاء",
    modules: [
      {
        title: "Delivering the Project",
        titleAr: "تنفيذ المشروع",
        lessons: [
          {
            title: "Project Phases & the Construction Team",
            titleAr: "مراحل المشروع وفريق الإنشاء",
            type: "TEXT",
            durationMinutes: 15,
            content: `## How a construction project flows

A project moves through predictable **phases**, and each hand-off must be clean:

1. **Feasibility & design** — the client's brief becomes drawings and specifications.
2. **Tendering & award** — contractors price the work; a contract is signed.
3. **Mobilization** — site setup, access, utilities, and the site office.
4. **Construction** — groundworks, structure, MEP (mechanical, electrical, plumbing), finishes.
5. **Handover & closeout** — testing, snagging, as-built drawings, and the defects-liability period.

### Who does what

- **Client / owner** — pays for and will use the asset.
- **Consultant / engineer** — designs and supervises on the client's behalf.
- **Main contractor** — builds the works and manages subcontractors.
- **Subcontractors** — specialist trades (steel, HVAC, electrical).

> Most delays and disputes start at the hand-offs. Confirm scope, drawings and approvals before each phase begins.`,
            contentAr: `## كيف ينساب مشروع الإنشاء

يمرّ المشروع عبر **مراحل** متوقَّعة، ويجب أن يكون كل تسليم بينها نظيفًا:

1. **الجدوى والتصميم** — يتحوّل مطلب العميل إلى مخططات ومواصفات.
2. **المناقصة والترسية** — يسعّر المقاولون العمل ويُوقَّع العقد.
3. **التجهيز** — تهيئة الموقع والوصول والمرافق ومكتب الموقع.
4. **التنفيذ** — الأعمال الترابية والهيكل والأعمال الميكانيكية والكهربائية والصحية والتشطيبات.
5. **التسليم والإغلاق** — الاختبارات ومعالجة الملاحظات والمخططات كما نُفِّذت وفترة ضمان العيوب.

### من يفعل ماذا

- **العميل / المالك** — يموّل الأصل وسيستخدمه.
- **الاستشاري / المهندس** — يصمّم ويشرف نيابةً عن العميل.
- **المقاول الرئيسي** — ينفّذ الأعمال ويدير مقاولي الباطن.
- **مقاولو الباطن** — تخصّصات فنية (الحديد، التكييف، الكهرباء).

> معظم التأخيرات والنزاعات تبدأ عند نقاط التسليم. أكّد النطاق والمخططات والاعتمادات قبل بدء كل مرحلة.`,
          },
          {
            title: "Planning, Scheduling & Progress Control",
            titleAr: "التخطيط والجدولة وضبط التقدّم",
            type: "TEXT",
            durationMinutes: 16,
            content: `## Plan the work, then work the plan

- **Work Breakdown Structure (WBS)** — split the project into manageable packages.
- **Critical path** — the longest chain of dependent activities; a delay here delays the whole project.
- **Baseline programme** — the approved schedule you measure reality against.
- **Look-ahead** — a rolling 2–3 week plan that turns the programme into this week's tasks.

### Measuring progress honestly

- Compare **planned vs. actual** progress each week (an S-curve makes slippage obvious).
- Track **productivity** (output per crew-day) and the causes of lost time.
- Raise **early warnings** the moment the critical path is threatened — not after the milestone is missed.

> A schedule nobody updates is decoration. Short, frequent reviews keep the project recoverable.`,
            contentAr: `## خطّط للعمل ثم نفّذ الخطة

- **هيكل تجزئة العمل (WBS)** — قسّم المشروع إلى حِزم قابلة للإدارة.
- **المسار الحرج** — أطول سلسلة من الأنشطة المترابطة؛ وأي تأخير فيها يؤخّر المشروع كله.
- **البرنامج الأساسي** — الجدول المعتمد الذي تقيس الواقع مقابله.
- **خطة الاستباق** — خطة متجدّدة لأسبوعين إلى ثلاثة تحوّل البرنامج إلى مهام هذا الأسبوع.

### قياس التقدّم بصدق

- قارن **المخطَّط مقابل الفعلي** أسبوعيًا (منحنى S يُظهر الانحراف بوضوح).
- تابِع **الإنتاجية** (المُخرَج لكل يوم عمل لطاقم) وأسباب الوقت الضائع.
- أطلِق **الإنذارات المبكرة** فور تهديد المسار الحرج — لا بعد فوات المعلم.

> الجدول الذي لا يُحدِّثه أحد مجرّد زينة. المراجعات القصيرة المتكررة تُبقي المشروع قابلًا للإنقاذ.`,
          },
        ],
      },
      {
        title: "Quality & Site Safety",
        titleAr: "الجودة وسلامة الموقع",
        lessons: [
          {
            title: "Quality Control & the Saudi Building Code",
            titleAr: "ضبط الجودة وكود البناء السعودي",
            type: "TEXT",
            durationMinutes: 14,
            content: `## Build it right the first time

- **Specifications & the Saudi Building Code (SBC)** set the required standards for materials and workmanship.
- **Inspection & Test Plan (ITP)** — defines what is checked, when, and who signs off.
- **Request for Inspection (RFI)** — the contractor calls the consultant to approve work *before* it is covered up.
- **Material approval** — submit samples/data sheets for approval before ordering in bulk.

### Catching defects early

A defect found in a wall before plastering costs little; the same defect found after handover is expensive and damages trust. Use **hold points** (work cannot proceed until inspected) for critical activities like rebar and concrete pours.

> Quality is cheaper than rework. Inspect before you cover, not after you finish.`,
            contentAr: `## نفّذ بشكل صحيح من أول مرة

- **المواصفات وكود البناء السعودي (SBC)** تحدّد المعايير المطلوبة للمواد والصنعة.
- **خطة الفحص والاختبار (ITP)** — تحدّد ما يُفحَص ومتى ومَن يعتمده.
- **طلب الفحص (RFI)** — يستدعي المقاول الاستشاري لاعتماد العمل *قبل* أن يُغطّى.
- **اعتماد المواد** — قدّم العيّنات/بيانات المواد للاعتماد قبل الطلب بكميات كبيرة.

### اكتشاف العيوب مبكرًا

العيب المكتشَف في جدار قبل اللياسة يكلّف قليلًا؛ ونفس العيب بعد التسليم مكلف ويضرّ بالثقة. استخدم **نقاط التوقّف** (لا يتقدّم العمل حتى يُفحَص) للأنشطة الحرجة مثل التسليح وصبّ الخرسانة.

> الجودة أرخص من إعادة العمل. افحص قبل التغطية لا بعد الانتهاء.`,
          },
          {
            title: "Site Safety & Permit-to-Work",
            titleAr: "سلامة الموقع وتصريح العمل",
            type: "TEXT",
            durationMinutes: 15,
            content: `## Everyone goes home safe

Construction is high-risk. The biggest killers are the **"Fatal Four"**: falls from height, being struck by objects, caught-in/between, and electrocution.

### Core controls

- **Risk assessment & method statement (RAMS)** before high-risk work begins.
- **Permit-to-Work** for hot work, confined spaces, excavation and working at height — a documented authorization with specific controls.
- **PPE** — hard hat, safety boots, high-visibility vest, and task-specific gear (harness, goggles).
- **Toolbox talks** — short daily briefings on the day's hazards.
- **Scaffolding & edge protection** inspected and tagged before use.

> Stop-work authority belongs to everyone. If it is not safe, it does not proceed — no matter the deadline.`,
            contentAr: `## الجميع يعود إلى بيته سالمًا

الإنشاء عالي المخاطر. وأكبر المسبّبات للوفاة هي **"الأربعة القاتلة"**: السقوط من علوّ، والاصطدام بالأجسام، والانحشار، والصعق الكهربائي.

### الضوابط الأساسية

- **تقييم المخاطر وبيان الطريقة (RAMS)** قبل بدء الأعمال عالية الخطورة.
- **تصريح العمل** للأعمال الساخنة والأماكن المحصورة والحفر والعمل على ارتفاع — تفويض موثّق بضوابط محدّدة.
- **معدّات الوقاية الشخصية** — خوذة وحذاء سلامة وسترة عاكسة ومعدّات حسب المهمة (حزام، نظارات).
- **محادثات السلامة اليومية** — إحاطات قصيرة عن مخاطر اليوم.
- **السقالات وحماية الحواف** تُفحَص وتُوسَم قبل الاستخدام.

> صلاحية إيقاف العمل حقّ للجميع. إن لم يكن آمنًا فلا يتقدّم — مهما كان الموعد النهائي.`,
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
                prompt: "On a construction schedule, the 'critical path' is:",
                promptAr: "في جدول الإنشاء، 'المسار الحرج' هو:",
                options: [
                  { text: "The longest chain of dependent activities — a delay here delays the whole project", textAr: "أطول سلسلة من الأنشطة المترابطة — وأي تأخير فيها يؤخّر المشروع كله", correct: true },
                  { text: "The most expensive activity on site", textAr: "أغلى نشاط في الموقع" },
                  { text: "The route trucks take into the site", textAr: "المسار الذي تسلكه الشاحنات إلى الموقع" },
                  { text: "Any task done by subcontractors", textAr: "أي مهمة ينفّذها مقاولو الباطن" },
                ],
                explanation: "The critical path is the longest dependent sequence; slipping it slips the project.",
                explanationAr: "المسار الحرج أطول تسلسل مترابط؛ وانزلاقه يؤخّر المشروع.",
              },
              {
                prompt: "A Request for Inspection (RFI) is raised so that work is approved:",
                promptAr: "يُرفع طلب الفحص (RFI) ليُعتمَد العمل:",
                options: [
                  { text: "Before it is covered up", textAr: "قبل أن يُغطّى", correct: true },
                  { text: "Only after handover", textAr: "بعد التسليم فقط" },
                  { text: "At the end of the defects-liability period", textAr: "في نهاية فترة ضمان العيوب" },
                  { text: "After the client pays the final invoice", textAr: "بعد سداد العميل للفاتورة النهائية" },
                ],
                explanation: "You inspect before covering work up — catching defects early is far cheaper.",
                explanationAr: "تُفحَص الأعمال قبل تغطيتها — فاكتشاف العيوب مبكرًا أرخص بكثير.",
              },
              {
                prompt: "Which activity typically requires a Permit-to-Work?",
                promptAr: "أي نشاط يتطلّب عادةً تصريح عمل؟",
                options: [
                  { text: "Hot work, confined-space entry, excavation or working at height", textAr: "الأعمال الساخنة ودخول الأماكن المحصورة والحفر والعمل على ارتفاع", correct: true },
                  { text: "Reading drawings in the site office", textAr: "قراءة المخططات في مكتب الموقع" },
                  { text: "Attending a progress meeting", textAr: "حضور اجتماع متابعة التقدّم" },
                  { text: "Updating the schedule on a laptop", textAr: "تحديث الجدول على حاسب محمول" },
                ],
                explanation: "High-risk activities need a documented permit with specific controls before they start.",
                explanationAr: "الأنشطة عالية الخطورة تحتاج تصريحًا موثّقًا بضوابط محدّدة قبل بدئها.",
              },
              {
                prompt: "The Saudi Building Code (SBC) primarily defines:",
                promptAr: "كود البناء السعودي (SBC) يحدّد بشكل أساسي:",
                options: [
                  { text: "The required standards for materials and workmanship", textAr: "المعايير المطلوبة للمواد والصنعة", correct: true },
                  { text: "The contractor's profit margin", textAr: "هامش ربح المقاول" },
                  { text: "Employee salaries on site", textAr: "رواتب الموظفين في الموقع" },
                  { text: "The colour of safety helmets", textAr: "لون خوذ السلامة" },
                ],
                explanation: "The SBC sets mandatory technical standards for building works.",
                explanationAr: "يضع كود البناء السعودي المعايير الفنية الإلزامية لأعمال البناء.",
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 12) ENGINEERING & DESIGN
  // =========================================================================
  {
    key: "engineering-design-delivery",
    title: "Engineering Design & Project Delivery",
    titleAr: "التصميم الهندسي وتنفيذ المشاريع",
    description:
      "Produce sound, standards-compliant engineering — the design process, codes and standards, calculations and design reviews, drawings and BIM, and professional ethics under the Saudi Council of Engineers.",
    descriptionAr:
      "أنتج أعمالًا هندسية سليمة ومتوافقة مع المعايير — عملية التصميم والأكواد والمعايير والحسابات ومراجعات التصميم والمخططات ونمذجة معلومات البناء وأخلاقيات المهنة وفق الهيئة السعودية للمهندسين.",
    category: "Engineering & Design",
    level: "INTERMEDIATE",
    competency: "Engineering Practice",
    competencyAr: "الممارسة الهندسية",
    modules: [
      {
        title: "The Engineering Design Process",
        titleAr: "عملية التصميم الهندسي",
        lessons: [
          {
            title: "From Brief to Design: Codes & Standards",
            titleAr: "من المتطلبات إلى التصميم: الأكواد والمعايير",
            type: "TEXT",
            durationMinutes: 15,
            content: `## Good engineering starts with the requirements

- **Capture requirements** — function, loads, environment, budget, and the client's real need.
- **Design basis** — the agreed assumptions, loads and criteria the whole design rests on.
- **Codes & standards** — design to the applicable code (e.g. the Saudi Building Code SBC, ASHRAE, IEC, ISO). Codes encode hard-won safety lessons.
- **Factor of safety** — deliberately design capacity above the expected load to cover uncertainty.

### Concept → detail

Move from **concept** (options and feasibility) to **detailed design** (sized elements, specifications and drawings). Decisions get more expensive to change as you go, so resolve the big choices early.

> An elegant design that ignores the code or the brief is a failed design. Fit-for-purpose beats clever.`,
            contentAr: `## الهندسة الجيدة تبدأ من المتطلبات

- **التقاط المتطلبات** — الوظيفة والأحمال والبيئة والميزانية والحاجة الحقيقية للعميل.
- **أساس التصميم** — الافتراضات والأحمال والمعايير المتفق عليها التي يقوم عليها التصميم كله.
- **الأكواد والمعايير** — صمّم وفق الكود المعمول به (مثل كود البناء السعودي SBC وASHRAE وIEC وISO). الأكواد تختزن دروس سلامة مكلفة.
- **معامل الأمان** — صمّم السعة عمدًا فوق الحمل المتوقَّع لتغطية عدم اليقين.

### من المفهوم إلى التفصيل

انتقل من **التصميم المفاهيمي** (الخيارات والجدوى) إلى **التصميم التفصيلي** (عناصر محسوبة ومواصفات ومخططات). تزداد كلفة تغيير القرارات كلما تقدّمت، لذا احسم الخيارات الكبرى مبكرًا.

> التصميم الأنيق الذي يتجاهل الكود أو المتطلبات تصميم فاشل. المناسب للغرض يتفوّق على الذكي.`,
          },
          {
            title: "Calculations, Tolerances & Design Reviews",
            titleAr: "الحسابات والتفاوتات ومراجعات التصميم",
            type: "TEXT",
            durationMinutes: 14,
            content: `## Trust, but verify

- **Calculations** must be traceable: stated assumptions, units, and a method a peer can follow.
- **Tolerances** — nothing is built perfectly; specify the allowable range so parts fit and perform.
- **Checking** — an independent engineer checks the design. The author and the checker are never the same person.
- **Design review** — a structured meeting to challenge assumptions before issue (constructability, safety, cost, maintainability).

### Manage change

When a requirement changes, update the **design basis**, re-check the affected calculations, and re-issue drawings with a clear revision. Uncontrolled change is how errors reach site.

> "Looks about right" is not engineering. Show the numbers, state the units, and get it checked.`,
            contentAr: `## ثِق ولكن تحقّق

- **الحسابات** يجب أن تكون قابلة للتتبّع: افتراضات معلنة ووحدات وطريقة يستطيع زميل اتّباعها.
- **التفاوتات** — لا شيء يُبنى بكمالٍ تام؛ حدّد المدى المسموح لتتناسب الأجزاء وتؤدّي وظيفتها.
- **التدقيق** — يدقّق مهندس مستقل التصميم. ولا يكون المؤلّف والمدقّق الشخص نفسه أبدًا.
- **مراجعة التصميم** — اجتماع منظَّم لتحدّي الافتراضات قبل الإصدار (قابلية التنفيذ والسلامة والتكلفة وقابلية الصيانة).

### أدِر التغيير

عند تغيّر أي متطلب، حدّث **أساس التصميم**، وأعِد تدقيق الحسابات المتأثّرة، وأعِد إصدار المخططات بترقيم تعديل واضح. التغيير غير المنضبط هو كيف تصل الأخطاء إلى الموقع.

> "يبدو صحيحًا تقريبًا" ليست هندسة. أظهِر الأرقام، واذكر الوحدات، ودع غيرك يدقّقها.`,
          },
        ],
      },
      {
        title: "Delivering Engineering Work",
        titleAr: "تسليم الأعمال الهندسية",
        lessons: [
          {
            title: "Drawings, BIM & Document Control",
            titleAr: "المخططات ونمذجة معلومات البناء وضبط الوثائق",
            type: "TEXT",
            durationMinutes: 13,
            content: `## The drawing is the contract with the builder

- **Clear drawings** — correct scale, dimensions, notes and a complete title block (project, discipline, revision, date).
- **BIM (Building Information Modelling)** — a shared 3D model that coordinates disciplines and catches **clashes** (e.g. a duct through a beam) before they reach site.
- **Document control** — one controlled master; superseded revisions are withdrawn so nobody builds from an old drawing.
- **Revisions** — every change gets a new revision letter/number and a recorded reason.

> The most expensive clash is the one discovered on site. Coordinate in the model, not in concrete.`,
            contentAr: `## المخطط هو العقد مع المنفّذ

- **مخططات واضحة** — مقياس صحيح وأبعاد وملاحظات ومربّع عنوان كامل (المشروع، التخصص، التعديل، التاريخ).
- **نمذجة معلومات البناء (BIM)** — نموذج ثلاثي الأبعاد مشترك ينسّق التخصّصات ويكتشف **التعارضات** (مثل مجرى هواء يخترق جسرًا) قبل وصولها إلى الموقع.
- **ضبط الوثائق** — نسخة رئيسية واحدة مضبوطة؛ وتُسحَب التعديلات المُلغاة حتى لا يبني أحد من مخطط قديم.
- **التعديلات** — كل تغيير يأخذ حرف/رقم تعديل جديدًا وسببًا مسجَّلًا.

> أغلى تعارض هو ما يُكتشَف في الموقع. نسّق في النموذج لا في الخرسانة.`,
          },
          {
            title: "Professional Ethics & the Saudi Council of Engineers",
            titleAr: "أخلاقيات المهنة والهيئة السعودية للمهندسين",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Engineering is a public trust

- **Public safety first** — an engineer's primary duty is the safety and welfare of the public, above schedule or profit.
- **Competence** — only stamp or sign off work within your area of competence.
- **Honesty** — report findings truthfully; never hide a defect or sign off work you have not verified.
- **Professional registration** — in Saudi Arabia, engineers are accredited by the **Saudi Council of Engineers (SCE)**; accreditation carries ethical obligations.

### Conflicts of interest

Declare any interest that could bias your judgement. Integrity is the profession's foundation — one dishonest sign-off can cost lives and a career.

> You may be overruled on cost or time, but never on safety. If pressured to cut a safety margin, escalate in writing.`,
            contentAr: `## الهندسة أمانة عامة

- **سلامة الجمهور أولًا** — الواجب الأول للمهندس هو سلامة الجمهور ورفاهه، فوق الجدول أو الربح.
- **الكفاءة** — لا تعتمد أو توقّع إلا على عمل ضمن مجال كفاءتك.
- **الصدق** — أبلِغ عن النتائج بصدق؛ ولا تُخفِ عيبًا أو توقّع على عمل لم تتحقّق منه.
- **التسجيل المهني** — في السعودية يُعتمَد المهندسون من **الهيئة السعودية للمهندسين (SCE)**؛ والاعتماد يحمل التزامات أخلاقية.

### تضارب المصالح

أفصِح عن أي مصلحة قد تحيّز حكمك. النزاهة أساس المهنة — وتوقيع واحد غير أمين قد يكلّف أرواحًا ومسيرة مهنية.

> قد يُتجاوَز رأيك في التكلفة أو الوقت، لكن ليس في السلامة أبدًا. وإن ضُغِط عليك لخفض هامش أمان، فصعّد الأمر كتابةً.`,
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
                prompt: "The 'design basis' of an engineering project is:",
                promptAr: "'أساس التصميم' لمشروع هندسي هو:",
                options: [
                  { text: "The agreed assumptions, loads and criteria the whole design rests on", textAr: "الافتراضات والأحمال والمعايير المتفق عليها التي يقوم عليها التصميم كله", correct: true },
                  { text: "The final invoice to the client", textAr: "الفاتورة النهائية للعميل" },
                  { text: "The site access road", textAr: "طريق الوصول إلى الموقع" },
                  { text: "The contractor's staff list", textAr: "قائمة موظفي المقاول" },
                ],
                explanation: "The design basis is the foundation set of assumptions and criteria for the design.",
                explanationAr: "أساس التصميم هو مجموعة الافتراضات والمعايير التي يُبنى عليها التصميم.",
              },
              {
                prompt: "Independent checking of a design means:",
                promptAr: "التدقيق المستقل للتصميم يعني:",
                options: [
                  { text: "A different engineer, not the author, verifies the design", textAr: "مهندس مختلف غير المؤلّف يتحقّق من التصميم", correct: true },
                  { text: "The author checks their own work twice", textAr: "يدقّق المؤلّف عمله مرتين" },
                  { text: "The client approves the budget", textAr: "يعتمد العميل الميزانية" },
                  { text: "The drawing is printed in colour", textAr: "يُطبَع المخطط بالألوان" },
                ],
                explanation: "The checker and the author are never the same person.",
                explanationAr: "لا يكون المدقّق والمؤلّف الشخص نفسه أبدًا.",
              },
              {
                prompt: "In BIM, a 'clash' is:",
                promptAr: "في نمذجة معلومات البناء، 'التعارض' هو:",
                options: [
                  { text: "Two elements occupying the same space, e.g. a duct through a beam", textAr: "عنصران يشغلان الحيّز نفسه، مثل مجرى هواء يخترق جسرًا", correct: true },
                  { text: "A disagreement between two engineers", textAr: "خلاف بين مهندسين" },
                  { text: "A delay in the schedule", textAr: "تأخير في الجدول" },
                  { text: "A missing signature", textAr: "توقيع مفقود" },
                ],
                explanation: "Clash detection finds physical conflicts in the model before they reach site.",
                explanationAr: "كشف التعارضات يجد التعارضات المادية في النموذج قبل وصولها للموقع.",
              },
              {
                prompt: "An engineer's primary professional duty is to:",
                promptAr: "الواجب المهني الأول للمهندس هو:",
                options: [
                  { text: "The safety and welfare of the public", textAr: "سلامة الجمهور ورفاهه", correct: true },
                  { text: "Finishing ahead of schedule at any cost", textAr: "الإنهاء قبل الموعد بأي ثمن" },
                  { text: "Maximising the contractor's profit", textAr: "تعظيم ربح المقاول" },
                  { text: "Using the newest software", textAr: "استخدام أحدث البرمجيات" },
                ],
                explanation: "Public safety comes before schedule or profit — a core engineering ethic.",
                explanationAr: "سلامة الجمهور تسبق الجدول أو الربح — وهي من صميم أخلاقيات الهندسة.",
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 13) LOGISTICS & TRANSPORTATION
  // =========================================================================
  {
    key: "logistics-transportation",
    title: "Logistics & Transportation Management",
    titleAr: "إدارة الخدمات اللوجستية والنقل",
    description:
      "Move goods reliably and cost-effectively — transport modes and route planning, fleet management and delivery performance, Incoterms and shipping documents, and Saudi customs clearance (FASAH).",
    descriptionAr:
      "انقل البضائع بموثوقية وكفاءة في التكلفة — وسائط النقل وتخطيط المسارات وإدارة الأسطول وأداء التسليم وإنكوترمز ومستندات الشحن والتخليص الجمركي السعودي (فسح).",
    category: "Logistics & Transportation",
    level: "FOUNDATION",
    competency: "Logistics Management",
    competencyAr: "إدارة اللوجستيات",
    modules: [
      {
        title: "Transport & Fleet",
        titleAr: "النقل والأسطول",
        lessons: [
          {
            title: "Transport Modes & Route Planning",
            titleAr: "وسائط النقل وتخطيط المسارات",
            type: "TEXT",
            durationMinutes: 13,
            content: `## Choosing how goods move

Each mode trades **cost, speed and reach**:

- **Road** — flexible, door-to-door, ideal within the Kingdom and the GCC.
- **Sea** — cheapest per tonne for large volumes; slow; via ports such as Jeddah and Dammam.
- **Air** — fastest; most expensive; for urgent or high-value goods.
- **Rail** — efficient for heavy bulk over long land distances.

### Planning routes

- **Consolidate** loads to fill vehicles and cut cost per delivery.
- Plan for **drive-time rules, traffic and delivery windows**.
- Build routes that minimise empty running (the return leg still costs fuel and hours).

> The cheapest mode on paper is not always cheapest overall — factor in handling, delay risk and inventory cost in transit.`,
            contentAr: `## اختيار كيفية نقل البضائع

كل وسيط يوازن بين **التكلفة والسرعة والوصول**:

- **البرّي** — مرن ومن الباب إلى الباب، ومثالي داخل المملكة ودول الخليج.
- **البحري** — الأرخص للطن للكميات الكبيرة؛ وبطيء؛ عبر موانئ مثل جدة والدمام.
- **الجوّي** — الأسرع؛ والأغلى؛ للبضائع العاجلة أو عالية القيمة.
- **السككي** — فعّال للبضائع الثقيلة السائبة عبر مسافات برّية طويلة.

### تخطيط المسارات

- **ادمج** الأحمال لملء المركبات وخفض التكلفة لكل تسليم.
- خطّط لـ **ساعات القيادة والازدحام ونوافذ التسليم**.
- ابنِ مسارات تقلّل التشغيل الفارغ (رحلة العودة تظل تكلّف وقودًا وساعات).

> الوسيط الأرخص على الورق ليس دائمًا الأرخص إجمالًا — احسب المناولة ومخاطر التأخير وتكلفة المخزون أثناء النقل.`,
          },
          {
            title: "Fleet Management & Delivery Performance",
            titleAr: "إدارة الأسطول وأداء التسليم",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Keep the fleet running and the promises kept

- **Preventive maintenance** — service on a schedule to avoid breakdowns that strand loads.
- **Driver management** — licences, hours, safety and conduct; the driver represents the company at the customer's door.
- **Telematics / GPS** — track location, fuel and driving behaviour to cut cost and improve safety.

### Measuring delivery performance

- **On-Time In-Full (OTIF)** — delivered on time *and* complete and undamaged.
- **Cost per delivery / per km** — the efficiency of the operation.
- **Proof of Delivery (POD)** — signed confirmation the customer received the goods.

> On-time-but-wrong is still a failed delivery. OTIF measures the promise the customer actually cares about.`,
            contentAr: `## أبقِ الأسطول يعمل والوعود محفوظة

- **الصيانة الوقائية** — الصيانة وفق جدول لتفادي الأعطال التي تُعطّل الأحمال.
- **إدارة السائقين** — الرخص والساعات والسلامة والسلوك؛ فالسائق يمثّل الشركة عند باب العميل.
- **أنظمة التتبّع / GPS** — تتبّع الموقع والوقود وسلوك القيادة لخفض التكلفة وتحسين السلامة.

### قياس أداء التسليم

- **التسليم في الوقت وبالكامل (OTIF)** — مُسلَّم في الوقت *و* كاملًا وسليمًا.
- **التكلفة لكل تسليم / لكل كيلومتر** — كفاءة التشغيل.
- **إثبات التسليم (POD)** — تأكيد موقَّع باستلام العميل للبضائع.

> التسليم في الوقت لكنه خاطئ يظل تسليمًا فاشلًا. ومقياس OTIF يقيس الوعد الذي يهتمّ به العميل فعلًا.`,
          },
        ],
      },
      {
        title: "Freight, Incoterms & Customs",
        titleAr: "الشحن وإنكوترمز والجمارك",
        lessons: [
          {
            title: "Incoterms & Shipping Documentation",
            titleAr: "إنكوترمز ومستندات الشحن",
            type: "TEXT",
            durationMinutes: 13,
            content: `## Who is responsible, and until where?

**Incoterms** are international rules that define, for each shipment, where the seller's responsibility ends and the buyer's begins — covering cost, risk and insurance. Common terms:

- **EXW (Ex Works)** — buyer collects from the seller's premises and bears almost everything.
- **FOB (Free On Board)** — seller's risk ends once goods are on the vessel.
- **CIF (Cost, Insurance, Freight)** — seller pays freight and insurance to the destination port.
- **DDP (Delivered Duty Paid)** — seller delivers cleared through customs; maximum seller responsibility.

### Key documents

- **Commercial invoice**, **packing list**, **bill of lading** (sea) or **air waybill** (air), and the **certificate of origin**.

> Agree the Incoterm in writing before shipping. Most freight disputes are really arguments about who owned the risk at the moment something went wrong.`,
            contentAr: `## من المسؤول، وإلى أين؟

**إنكوترمز** قواعد دولية تحدّد، لكل شحنة، أين تنتهي مسؤولية البائع وأين تبدأ مسؤولية المشتري — شاملةً التكلفة والمخاطرة والتأمين. من أشهرها:

- **تسليم أرض المصنع (EXW)** — يستلم المشتري من مقرّ البائع ويتحمّل كل شيء تقريبًا.
- **التسليم على ظهر السفينة (FOB)** — تنتهي مخاطرة البائع بمجرد وضع البضائع على السفينة.
- **التكلفة والتأمين والشحن (CIF)** — يدفع البائع الشحن والتأمين حتى ميناء الوصول.
- **التسليم خالص الرسوم (DDP)** — يسلّم البائع البضاعة مخلَّصة جمركيًا؛ وهي أقصى مسؤولية على البائع.

### المستندات الأساسية

- **الفاتورة التجارية** و**قائمة التعبئة** و**بوليصة الشحن** (بحري) أو **بوليصة الشحن الجوي** (جوي) و**شهادة المنشأ**.

> اتّفق على شرط إنكوترمز كتابةً قبل الشحن. فمعظم نزاعات الشحن هي في الحقيقة خلاف حول من كان يملك المخاطرة لحظة حدوث الخطأ.`,
          },
          {
            title: "Saudi Customs Clearance (FASAH)",
            titleAr: "التخليص الجمركي السعودي (فسح)",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Clearing goods into the Kingdom

Imports into Saudi Arabia are processed through **FASAH**, the national single-window platform linking importers, customs and other authorities.

- **Accurate declaration** — the **HS code** (tariff classification), value and origin must be correct; errors cause delays, fines and inspections.
- **Duties & VAT** — customs duty plus VAT are assessed on import; budget and document them.
- **Required approvals** — some goods need approval from bodies such as **SFDA** (food/drugs) or **SASO/SABER** (product conformity) before release.
- **Clear paperwork** — a clean invoice, packing list and certificate of origin speed release.

### Avoiding demurrage

Containers left at the port beyond the free period incur **demurrage** charges. Prepare documents *before* arrival so clearance starts immediately.

> Customs delays are usually document problems, not customs problems. Get the declaration and approvals right the first time.`,
            contentAr: `## تخليص البضائع إلى المملكة

تُعالَج الواردات إلى السعودية عبر **فسح**، منصّة النافذة الواحدة الوطنية التي تربط المستوردين والجمارك والجهات الأخرى.

- **إقرار دقيق** — يجب أن يكون **رمز النظام المنسّق (HS)** (التصنيف الجمركي) والقيمة والمنشأ صحيحة؛ فالأخطاء تسبّب تأخيرًا وغرامات وتفتيشًا.
- **الرسوم وضريبة القيمة المضافة** — تُحتسَب الرسوم الجمركية وضريبة القيمة المضافة عند الاستيراد؛ فخطّط لها ووثّقها.
- **الاعتمادات المطلوبة** — بعض السلع تحتاج موافقة جهات مثل **الغذاء والدواء (SFDA)** أو **المواصفات (SASO/سابر)** قبل الإفراج.
- **مستندات واضحة** — فاتورة نظيفة وقائمة تعبئة وشهادة منشأ تُسرِّع الإفراج.

### تفادي أرضيات التأخير

الحاويات المتروكة في الميناء بعد الفترة المجانية تتكبّد رسوم **أرضيات (demurrage)**. جهّز المستندات *قبل* الوصول ليبدأ التخليص فورًا.

> تأخيرات الجمارك عادةً مشكلات مستندات لا مشكلات جمارك. اضبط الإقرار والاعتمادات من أول مرة.`,
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
                prompt: "Which transport mode is usually cheapest per tonne for large-volume shipments?",
                promptAr: "أي وسيط نقل عادةً الأرخص للطن في الشحنات كبيرة الحجم؟",
                options: [
                  { text: "Sea freight", textAr: "الشحن البحري", correct: true },
                  { text: "Air freight", textAr: "الشحن الجوي" },
                  { text: "Express courier", textAr: "البريد السريع" },
                  { text: "Motorcycle delivery", textAr: "التوصيل بالدرّاجة النارية" },
                ],
                explanation: "Sea is the lowest cost per tonne for large volumes, at the cost of speed.",
                explanationAr: "البحري هو الأقل تكلفة للطن للكميات الكبيرة، على حساب السرعة.",
              },
              {
                prompt: "The delivery metric 'OTIF' stands for:",
                promptAr: "مقياس التسليم 'OTIF' يعني:",
                options: [
                  { text: "On-Time In-Full — delivered on time, complete and undamaged", textAr: "في الوقت وبالكامل — مُسلَّم في الوقت وكاملًا وسليمًا", correct: true },
                  { text: "Over-Time In Fleet", textAr: "وقت إضافي في الأسطول" },
                  { text: "Order Tracking Internal Form", textAr: "نموذج تتبّع الطلب الداخلي" },
                  { text: "On The Internal Floor", textAr: "على الأرضية الداخلية" },
                ],
                explanation: "OTIF = On-Time In-Full: the complete, undamaged, on-time delivery the customer wants.",
                explanationAr: "OTIF تعني التسليم في الوقت وبالكامل: تسليم كامل وسليم وفي الوقت كما يريد العميل.",
              },
              {
                prompt: "Under the Incoterm DDP (Delivered Duty Paid):",
                promptAr: "وفق شرط إنكوترمز DDP (التسليم خالص الرسوم):",
                options: [
                  { text: "The seller delivers the goods cleared through customs — maximum seller responsibility", textAr: "يسلّم البائع البضائع مخلَّصة جمركيًا — أقصى مسؤولية على البائع", correct: true },
                  { text: "The buyer collects from the seller's factory", textAr: "يستلم المشتري من مصنع البائع" },
                  { text: "Risk passes once goods are on the vessel", textAr: "تنتقل المخاطرة بمجرد وضع البضائع على السفينة" },
                  { text: "The buyer pays all freight and insurance", textAr: "يدفع المشتري كل الشحن والتأمين" },
                ],
                explanation: "DDP puts the most responsibility on the seller, including customs clearance at destination.",
                explanationAr: "يضع DDP أكبر مسؤولية على البائع، بما فيها التخليص الجمركي في الوجهة.",
              },
              {
                prompt: "In Saudi import clearance, what most commonly causes delays?",
                promptAr: "في التخليص الجمركي السعودي، ما الذي يسبّب التأخير غالبًا؟",
                options: [
                  { text: "Incorrect declarations or missing documents/approvals (e.g. HS code, SFDA/SABER)", textAr: "الإقرارات غير الصحيحة أو نقص المستندات/الاعتمادات (مثل رمز HS وSFDA/سابر)", correct: true },
                  { text: "Using the FASAH single-window platform", textAr: "استخدام منصّة فسح للنافذة الواحدة" },
                  { text: "Paying VAT on import", textAr: "سداد ضريبة القيمة المضافة عند الاستيراد" },
                  { text: "Providing a certificate of origin", textAr: "تقديم شهادة المنشأ" },
                ],
                explanation: "Most customs delays are document/declaration problems — get the HS code and approvals right.",
                explanationAr: "معظم تأخيرات الجمارك مشكلات مستندات/إقرار — اضبط رمز HS والاعتمادات.",
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 14) CONSTRUCTION & CONTRACTING — COST / QUANTITY SURVEYING
  // =========================================================================
  {
    key: "construction-cost-qs",
    title: "Construction Cost Estimation & Quantity Surveying",
    titleAr: "تقدير التكاليف ومسح الكميات في الإنشاء",
    description:
      "Price construction work accurately and control cost on site — taking off quantities, building the BOQ, pricing, variations, interim valuations and value engineering.",
    descriptionAr:
      "سعّر أعمال الإنشاء بدقة واضبط التكلفة في الموقع — حصر الكميات وبناء جدول الكميات والتسعير والتغييرات والمستخلصات الدورية والهندسة القيمية.",
    category: "Construction & Contracting",
    level: "INTERMEDIATE",
    competency: "Quantity Surveying",
    competencyAr: "مسح الكميات",
    modules: [
      {
        title: "Estimating & the BOQ",
        titleAr: "التقدير وجدول الكميات",
        lessons: [
          {
            title: "Taking Off Quantities & the BOQ",
            titleAr: "حصر الكميات وجدول الكميات (BOQ)",
            type: "TEXT",
            durationMinutes: 15,
            content: `## Measure before you price

A **Bill of Quantities (BOQ)** lists every item of work with a measured quantity, so contractors price the same scope on the same basis.

- **Taking off** — measure quantities from the drawings (concrete m³, blockwork m², rebar tonnes).
- **Standard method of measurement** — a consistent set of rules so everyone measures the same way.
- **Units matter** — m, m², m³, tonne, number (No.); a wrong unit wrecks the price.

> Garbage in, garbage out: a BOQ built on careless take-off produces a price nobody can trust.`,
            contentAr: `## قِس قبل أن تسعّر

**جدول الكميات (BOQ)** يسرد كل بند عمل بكمية مقيسة، ليسعّر المقاولون النطاق نفسه على الأساس نفسه.

- **الحصر** — قِس الكميات من المخططات (خرسانة م³، بلوك م²، حديد بالأطنان).
- **طريقة القياس المعيارية** — مجموعة قواعد موحّدة ليقيس الجميع بالطريقة نفسها.
- **الوحدات مهمة** — م، م²، م³، طن، عدد؛ والوحدة الخاطئة تُفسد السعر.

> مدخلات رديئة تعني مخرجات رديئة: جدول كميات مبني على حصر غير دقيق يُنتج سعرًا لا يثق به أحد.`,
          },
          {
            title: "Pricing: Direct, Indirect & Contingency",
            titleAr: "التسعير: المباشر وغير المباشر والطوارئ",
            type: "TEXT",
            durationMinutes: 14,
            content: `## Build the rate from its parts

A unit rate is built from:

- **Direct costs** — materials, labour and plant/equipment for that item.
- **Indirect costs (preliminaries/overheads)** — site setup, supervision, insurance, head-office costs.
- **Risk & contingency** — an allowance for the unknowns.
- **Profit** — the margin the business needs.

### Don't forget wastage

Material take-off must add a **wastage allowance** (e.g. cutting losses). Under-pricing wins the job and loses money.

> Price the whole cost of doing the work, not just the shelf price of the material.`,
            contentAr: `## ابنِ السعر من مكوّناته

يُبنى سعر الوحدة من:

- **التكاليف المباشرة** — المواد والعمالة والمعدات لذلك البند.
- **التكاليف غير المباشرة (التمهيدية/العامة)** — تجهيز الموقع والإشراف والتأمين وتكاليف المكتب الرئيسي.
- **المخاطر والطوارئ** — مخصّص للمجهول.
- **الربح** — الهامش الذي يحتاجه العمل.

### لا تنسَ الهدر

يجب أن يضيف حصر المواد **مخصّص هدر** (مثل فاقد القص). فالتسعير المنخفض يربح العطاء ويخسر المال.

> سعّر كامل كلفة تنفيذ العمل، لا سعر رفّ المادة فقط.`,
          },
        ],
      },
      {
        title: "Controlling Cost on Site",
        titleAr: "ضبط التكلفة في الموقع",
        lessons: [
          {
            title: "Variations & Interim Payment Valuations",
            titleAr: "التغييرات والمستخلصات الدورية",
            type: "TEXT",
            durationMinutes: 13,
            content: `## Get paid for what you build

- **Variation** — an instructed change to the scope; it must be valued and agreed, ideally before the work is done.
- **Interim valuation / payment certificate** — a periodic measure of work done to date, so the contractor is paid progressively.
- **Measure what is built** — value actual progress, not the programme's plan.

> Unpriced variations and late valuations are how contractors fund projects out of their own pocket. Document and value changes promptly.`,
            contentAr: `## خُذ مستحقّك عمّا تنفّذه

- **التغيير (Variation)** — تعديل مُوجَّه للنطاق؛ ويجب تقييمه والاتفاق عليه، ويفضَّل قبل تنفيذ العمل.
- **المستخلص الدوري / شهادة الدفع** — قياس دوري للعمل المنجز حتى تاريخه، ليُدفع للمقاول تدريجيًا.
- **قِس ما نُفِّذ** — قيّم التقدّم الفعلي لا خطة البرنامج.

> التغييرات غير المسعّرة والمستخلصات المتأخرة هي كيف يموّل المقاولون المشاريع من جيوبهم. وثّق التغييرات وقيّمها فورًا.`,
          },
          {
            title: "Cost Control & Value Engineering",
            titleAr: "ضبط التكلفة والهندسة القيمية",
            type: "TEXT",
            durationMinutes: 13,
            content: `## Spend money where it adds value

- **Cost control** — compare actual cost against the budget continuously; investigate variances early.
- **Cash flow** — a project can be profitable on paper yet fail from poor cash timing.
- **Value engineering (VE)** — systematically improve value: deliver the required function at a lower whole-life cost, without cutting quality or safety.

> Cutting cost blindly is not VE. VE keeps the function and removes the waste around it.`,
            contentAr: `## أنفق المال حيث يضيف قيمة

- **ضبط التكلفة** — قارن التكلفة الفعلية بالميزانية باستمرار؛ وحقّق في الانحرافات مبكرًا.
- **التدفق النقدي** — قد يكون المشروع رابحًا على الورق لكنه يفشل بسبب سوء توقيت النقد.
- **الهندسة القيمية (VE)** — تحسين القيمة منهجيًا: تحقيق الوظيفة المطلوبة بأقل كلفة طوال العمر دون المساس بالجودة أو السلامة.

> خفض التكلفة الأعمى ليس هندسة قيمية. فالهندسة القيمية تُبقي الوظيفة وتزيل الهدر حولها.`,
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
                prompt: "A Bill of Quantities (BOQ) mainly exists so that:",
                promptAr: "جدول الكميات (BOQ) موجود أساسًا لكي:",
                options: [
                  { text: "Contractors price the same measured scope on the same basis", textAr: "يسعّر المقاولون النطاق المقيس نفسه على الأساس نفسه", correct: true },
                  { text: "The client can choose paint colours", textAr: "يختار العميل ألوان الدهان" },
                  { text: "Workers record their attendance", textAr: "يسجّل العمال حضورهم" },
                  { text: "The site office tracks the weather", textAr: "يتابع مكتب الموقع الطقس" },
                ],
                explanation: "A BOQ lists measured quantities so every bidder prices an identical scope.",
                explanationAr: "يسرد جدول الكميات كميات مقيسة ليسعّر كل متنافس نطاقًا مطابقًا.",
              },
              {
                prompt: "Which is a DIRECT cost in a unit rate?",
                promptAr: "أيٌّ مما يلي تكلفة مباشرة في سعر الوحدة؟",
                options: [
                  { text: "Materials, labour and plant for that item", textAr: "المواد والعمالة والمعدات لذلك البند", correct: true },
                  { text: "Head-office rent", textAr: "إيجار المكتب الرئيسي" },
                  { text: "Company-wide insurance", textAr: "تأمين الشركة بالكامل" },
                  { text: "The profit margin", textAr: "هامش الربح" },
                ],
                explanation: "Direct costs are the materials, labour and plant consumed by the item itself.",
                explanationAr: "التكاليف المباشرة هي المواد والعمالة والمعدات التي يستهلكها البند نفسه.",
              },
              {
                prompt: "An interim payment valuation is used to:",
                promptAr: "يُستخدم المستخلص الدوري لـ:",
                options: [
                  { text: "Pay the contractor progressively for work done to date", textAr: "دفع مستحقات المقاول تدريجيًا عن العمل المنجز حتى تاريخه", correct: true },
                  { text: "Fire underperforming workers", textAr: "فصل العمال ضعيفي الأداء" },
                  { text: "Order materials in bulk", textAr: "طلب المواد بكميات كبيرة" },
                  { text: "Close the project permanently", textAr: "إغلاق المشروع نهائيًا" },
                ],
                explanation: "Interim valuations measure progress so the contractor is paid as the work proceeds.",
                explanationAr: "تقيس المستخلصات الدورية التقدّم ليُدفع للمقاول مع سير العمل.",
              },
              {
                prompt: "Value engineering (VE) aims to:",
                promptAr: "تهدف الهندسة القيمية (VE) إلى:",
                options: [
                  { text: "Deliver the required function at a lower whole-life cost without cutting quality or safety", textAr: "تحقيق الوظيفة المطلوبة بأقل كلفة طوال العمر دون المساس بالجودة أو السلامة", correct: true },
                  { text: "Always choose the cheapest material regardless of function", textAr: "اختيار الأرخص دائمًا بغضّ النظر عن الوظيفة" },
                  { text: "Increase the contingency allowance", textAr: "زيادة مخصّص الطوارئ" },
                  { text: "Remove the safety budget", textAr: "إلغاء ميزانية السلامة" },
                ],
                explanation: "VE preserves the required function while removing cost that adds no value.",
                explanationAr: "تُبقي الهندسة القيمية الوظيفة المطلوبة وتزيل الكلفة التي لا تضيف قيمة.",
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 15) CONSTRUCTION & CONTRACTING — CONTRACTS & CLAIMS
  // =========================================================================
  {
    key: "construction-contracts-claims",
    title: "Construction Contracts & Claims Management",
    titleAr: "إدارة عقود الإنشاء والمطالبات",
    description:
      "Understand construction contracts and protect your entitlement — contract types and risk, FIDIC roles and clauses, variations, extensions of time, claims and dispute resolution.",
    descriptionAr:
      "افهم عقود الإنشاء واحمِ استحقاقك — أنواع العقود والمخاطر وأدوار فيديك وبنوده والتغييرات وتمديد المدة والمطالبات وتسوية النزاعات.",
    category: "Construction & Contracting",
    level: "ADVANCED",
    competency: "Contract Management",
    competencyAr: "إدارة العقود",
    modules: [
      {
        title: "Contracts & FIDIC",
        titleAr: "العقود وفيديك",
        lessons: [
          {
            title: "Contract Types & Risk Allocation",
            titleAr: "أنواع العقود وتوزيع المخاطر",
            type: "TEXT",
            durationMinutes: 14,
            content: `## Who carries which risk?

The contract type decides how risk is shared:

- **Lump sum** — a fixed price for a defined scope; the contractor carries most of the quantity/productivity risk.
- **Remeasurement (unit price)** — paid on actual measured quantities; suits uncertain quantities.
- **Cost-plus** — actual cost plus a fee; the client carries more risk, used when scope is unclear.

### Read the conditions

The **conditions of contract** define obligations, payment, time, variations and dispute routes. Price and perform to the contract you signed — not the one you assumed.

> The cheapest-looking contract can be the most expensive if the risk sits with the wrong party.`,
            contentAr: `## من يتحمّل أي مخاطرة؟

يحدّد نوع العقد كيفية تقاسم المخاطر:

- **المقطوعية (Lump sum)** — سعر ثابت لنطاق محدّد؛ ويتحمّل المقاول معظم مخاطر الكميات/الإنتاجية.
- **إعادة القياس (سعر الوحدة)** — يُدفع على الكميات الفعلية المقيسة؛ ويناسب الكميات غير المؤكدة.
- **التكلفة زائد (Cost-plus)** — التكلفة الفعلية زائد أتعاب؛ ويتحمّل العميل مخاطرة أكبر، ويُستخدم حين يكون النطاق غير واضح.

### اقرأ الشروط

تحدّد **شروط العقد** الالتزامات والدفع والمدة والتغييرات ومسارات النزاع. سعّر ونفّذ وفق العقد الذي وقّعته — لا الذي افترضته.

> العقد الأرخص مظهرًا قد يكون الأغلى إن وقعت المخاطرة على الطرف الخطأ.`,
          },
          {
            title: "FIDIC Roles & Key Clauses",
            titleAr: "أدوار فيديك والبنود الرئيسية",
            type: "TEXT",
            durationMinutes: 13,
            content: `## A common language for contracts

**FIDIC** publishes standard conditions of contract used widely across the GCC. Core ideas:

- **The Engineer** administers the contract, certifies payment and determines claims fairly between the parties.
- **Notices** — many rights are lost if the required notice is not given **within the time bar** in the contract.
- **Key clauses** — variations, payment, extension of time, and claims procedures.

> In FIDIC, a valid entitlement with no timely notice can become no entitlement at all. Notice first, argue later.`,
            contentAr: `## لغة مشتركة للعقود

تنشر **فيديك (FIDIC)** شروط عقد قياسية تُستخدم على نطاق واسع في الخليج. الأفكار الأساسية:

- **المهندس** يدير العقد ويعتمد الدفعات ويبتّ في المطالبات بإنصاف بين الطرفين.
- **الإخطارات** — تُفقَد حقوق كثيرة إن لم يُقدَّم الإخطار المطلوب **ضمن المهلة الزمنية** في العقد.
- **البنود الرئيسية** — التغييرات والدفع وتمديد المدة وإجراءات المطالبات.

> في فيديك، قد يتحوّل الاستحقاق الصحيح دون إخطار في الوقت إلى لا استحقاق. أخطِر أولًا وجادِل لاحقًا.`,
          },
        ],
      },
      {
        title: "Claims & Disputes",
        titleAr: "المطالبات والنزاعات",
        lessons: [
          {
            title: "Variations, Extension of Time & Claims",
            titleAr: "التغييرات وتمديد المدة والمطالبات",
            type: "TEXT",
            durationMinutes: 14,
            content: `## Entitlement must be proven, not asserted

- **Extension of Time (EOT)** — more time when a delay is caused by the client/employer or a listed risk event; it protects the contractor from liquidated damages.
- **Prolongation cost** — the extra cost of staying on site longer (only where the contract allows).
- **Records win claims** — dated progress records, correspondence, site diaries and photos are the evidence that turns an argument into an entitlement.

> A claim is a demonstration of cause, effect and entitlement — backed by records. Opinion without evidence is not a claim.`,
            contentAr: `## الاستحقاق يُثبَت لا يُدّعى

- **تمديد المدة (EOT)** — وقت إضافي عندما ينشأ التأخير من العميل/صاحب العمل أو حدث مخاطرة مدرَج؛ ويحمي المقاول من غرامات التأخير.
- **تكلفة الإطالة** — الكلفة الإضافية للبقاء في الموقع مدة أطول (حيث يسمح العقد فقط).
- **السجلات تكسب المطالبات** — سجلات التقدّم المؤرَّخة والمراسلات ويوميات الموقع والصور هي الدليل الذي يحوّل الجدال إلى استحقاق.

> المطالبة إثبات للسبب والأثر والاستحقاق — مدعومة بالسجلات. والرأي دون دليل ليس مطالبة.`,
          },
          {
            title: "Dispute Resolution & Avoidance",
            titleAr: "تسوية النزاعات وتفاديها",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Settle early, settle cheap

Disputes escalate through a ladder, each step slower and costlier:

1. **Negotiation** — the parties resolve it directly.
2. **Mediation / adjudication** — a neutral helps or gives an interim decision.
3. **Arbitration / litigation** — a binding, formal (and expensive) outcome.

### Avoidance beats resolution

Clear scope, prompt notices, agreed variations and good records prevent most disputes. The best dispute is the one that never forms.

> Every step up the ladder costs more and damages the relationship. Solve it at the lowest rung you can.`,
            contentAr: `## سَوِّ مبكرًا تُسوِّ بأقل كلفة

تتصاعد النزاعات عبر سُلّم، كل درجة أبطأ وأكثر كلفة:

1. **التفاوض** — يحلّه الطرفان مباشرةً.
2. **الوساطة / الفصل المؤقت** — يساعد محايد أو يصدر قرارًا مؤقتًا.
3. **التحكيم / التقاضي** — نتيجة ملزِمة ورسمية (ومكلفة).

### التفادي خير من التسوية

النطاق الواضح والإخطارات الفورية والتغييرات المتفق عليها والسجلات الجيدة تمنع معظم النزاعات. وأفضل نزاع ما لا ينشأ أصلًا.

> كل درجة أعلى في السلّم تكلّف أكثر وتضرّ بالعلاقة. حُلّه عند أدنى درجة ممكنة.`,
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
                prompt: "Under a lump-sum contract, who generally carries the quantity/productivity risk?",
                promptAr: "في عقد المقطوعية، من يتحمّل عمومًا مخاطرة الكميات/الإنتاجية؟",
                options: [
                  { text: "The contractor", textAr: "المقاول", correct: true },
                  { text: "The client only", textAr: "العميل فقط" },
                  { text: "The material supplier", textAr: "مورّد المواد" },
                  { text: "The end user", textAr: "المستخدم النهائي" },
                ],
                explanation: "A fixed price for a defined scope puts most quantity/productivity risk on the contractor.",
                explanationAr: "السعر الثابت لنطاق محدّد يضع معظم مخاطرة الكميات/الإنتاجية على المقاول.",
              },
              {
                prompt: "In FIDIC contracts, failing to give a required notice within the time bar can mean:",
                promptAr: "في عقود فيديك، عدم تقديم الإخطار المطلوب ضمن المهلة قد يعني:",
                options: [
                  { text: "Losing an otherwise valid entitlement", textAr: "فقدان استحقاق صحيح لولا ذلك", correct: true },
                  { text: "Automatically doubling the claim", textAr: "مضاعفة المطالبة تلقائيًا" },
                  { text: "The Engineer being replaced", textAr: "استبدال المهندس" },
                  { text: "Immediate termination of the client", textAr: "إنهاء تعاقد العميل فورًا" },
                ],
                explanation: "Time-bar clauses can extinguish a valid claim if notice is late.",
                explanationAr: "بنود المهلة الزمنية قد تُسقِط مطالبة صحيحة إذا تأخّر الإخطار.",
              },
              {
                prompt: "An Extension of Time (EOT) primarily protects the contractor from:",
                promptAr: "تمديد المدة (EOT) يحمي المقاول أساسًا من:",
                options: [
                  { text: "Liquidated damages for delay it is not responsible for", textAr: "غرامات التأخير عن تأخير ليس مسؤولًا عنه", correct: true },
                  { text: "Paying its own workers", textAr: "دفع أجور عمّاله" },
                  { text: "Buying materials", textAr: "شراء المواد" },
                  { text: "Training its staff", textAr: "تدريب موظفيه" },
                ],
                explanation: "An EOT shifts the time risk for excusable delays and avoids unfair delay damages.",
                explanationAr: "يمنح تمديد المدة غطاءً زمنيًا للتأخيرات المعذورة ويتجنّب غرامات تأخير غير عادلة.",
              },
              {
                prompt: "What most reliably turns a delay argument into a successful claim?",
                promptAr: "ما الذي يحوّل جدال التأخير إلى مطالبة ناجحة بأكثر موثوقية؟",
                options: [
                  { text: "Dated records: progress, correspondence, site diaries and photos", textAr: "سجلات مؤرَّخة: التقدّم والمراسلات ويوميات الموقع والصور", correct: true },
                  { text: "A strongly worded verbal complaint", textAr: "شكوى شفهية بعبارات قوية" },
                  { text: "Waiting until the end of the project", textAr: "الانتظار حتى نهاية المشروع" },
                  { text: "A larger workforce", textAr: "عمالة أكبر" },
                ],
                explanation: "Contemporaneous records prove cause, effect and entitlement.",
                explanationAr: "السجلات الآنية تُثبت السبب والأثر والاستحقاق.",
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 16) ENGINEERING & DESIGN — STRUCTURAL FUNDAMENTALS
  // =========================================================================
  {
    key: "engineering-structural-fundamentals",
    title: "Structural Engineering Fundamentals",
    titleAr: "أساسيات الهندسة الإنشائية",
    description:
      "Understand how structures carry load safely — types of loads, load paths and structural systems, concrete and steel behaviour, and limit-state design with factors of safety.",
    descriptionAr:
      "افهم كيف تحمل المنشآت الأحمال بأمان — أنواع الأحمال ومساراتها والأنظمة الإنشائية وسلوك الخرسانة والفولاذ والتصميم بحالات الحد ومعاملات الأمان.",
    category: "Engineering & Design",
    level: "INTERMEDIATE",
    competency: "Structural Design",
    competencyAr: "التصميم الإنشائي",
    modules: [
      {
        title: "Loads & Load Paths",
        titleAr: "الأحمال ومساراتها",
        lessons: [
          {
            title: "Types of Loads",
            titleAr: "أنواع الأحمال",
            type: "TEXT",
            durationMinutes: 13,
            content: `## What a structure must resist

- **Dead load** — the permanent weight of the structure itself (slabs, beams, walls).
- **Live (imposed) load** — movable loads: people, furniture, stored goods.
- **Environmental loads** — wind, seismic (earthquake), and temperature effects.

### Combinations

Codes require loads to be combined (e.g. dead + live + wind) because the worst case rarely comes from a single load acting alone.

> Design for the realistic worst combination, not the average day.`,
            contentAr: `## ما الذي يجب أن تقاومه المنشأة

- **الحمل الميت** — الوزن الدائم للمنشأة نفسها (البلاطات والجسور والجدران).
- **الحمل الحي (المفروض)** — الأحمال المتحركة: الأشخاص والأثاث والبضائع المخزّنة.
- **الأحمال البيئية** — الرياح والزلازل وتأثيرات الحرارة.

### التوافيق

تتطلّب الأكواد دمج الأحمال (مثل الميت + الحي + الرياح) لأن الحالة الأسوأ نادرًا ما تنتج عن حمل واحد منفردًا.

> صمّم للحالة الأسوأ الواقعية لا ليومٍ متوسط.`,
          },
          {
            title: "Load Paths & Structural Systems",
            titleAr: "مسارات الأحمال والأنظمة الإنشائية",
            type: "TEXT",
            durationMinutes: 13,
            content: `## Every load must reach the ground

A **load path** traces how force travels from where it is applied down to the foundations:

**Slab → Beam → Column → Foundation → Soil**

- **Beams** carry loads in bending to their supports.
- **Columns** carry axial load down.
- **Foundations** spread the load safely into the soil.
- **Lateral systems** (shear walls, bracing, frames) resist wind and seismic forces.

> A structure is only as strong as its weakest link in the load path. Break the path and it collapses — however strong the other members are.`,
            contentAr: `## كل حمل يجب أن يصل إلى الأرض

يتتبّع **مسار الحمل** كيف تنتقل القوة من موضع تطبيقها نزولًا إلى الأساسات:

**البلاطة ← الجسر ← العمود ← الأساس ← التربة**

- **الجسور** تحمل الأحمال بالانحناء إلى مساندها.
- **الأعمدة** تنقل الحمل المحوري نزولًا.
- **الأساسات** توزّع الحمل بأمان في التربة.
- **الأنظمة الجانبية** (جدران القص والتربيط والإطارات) تقاوم قوى الرياح والزلازل.

> قوة المنشأة بقوة أضعف حلقة في مسار الحمل. اقطع المسار تنهَر — مهما كانت بقية العناصر قوية.`,
          },
        ],
      },
      {
        title: "Materials & Safety",
        titleAr: "المواد والأمان",
        lessons: [
          {
            title: "Concrete & Steel Behaviour",
            titleAr: "سلوك الخرسانة والفولاذ",
            type: "TEXT",
            durationMinutes: 13,
            content: `## Two materials, opposite strengths

- **Concrete** is strong in **compression** but weak in **tension**.
- **Steel** is strong in **tension**.
- **Reinforced concrete** places steel bars where tension occurs (e.g. the bottom of a simply-supported beam), so the two work together.

### Detailing matters

Correct **cover** (concrete over the rebar) protects steel from corrosion; correct bar size, spacing and anchorage make the design real on site.

> A perfect calculation with poor rebar detailing still fails. The drawing and the bar schedule carry the design.`,
            contentAr: `## مادتان بقوّتين متعاكستين

- **الخرسانة** قوية في **الانضغاط** وضعيفة في **الشدّ**.
- **الفولاذ** قوي في **الشدّ**.
- **الخرسانة المسلّحة** تضع قضبان الفولاذ حيث يحدث الشدّ (مثل أسفل جسر بسيط الإسناد)، فتعمل المادتان معًا.

### التفاصيل مهمة

**الغطاء الخرساني** الصحيح فوق التسليح يحمي الفولاذ من الصدأ؛ والمقاس والتباعد والتماسك الصحيح يجعل التصميم واقعيًا في الموقع.

> الحساب المثالي مع تفاصيل تسليح رديئة يفشل أيضًا. فالمخطط وجدول التسليح يحملان التصميم.`,
          },
          {
            title: "Limit States & Factor of Safety",
            titleAr: "حالات الحد ومعامل الأمان",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Design for strength and for service

Modern codes use **limit-state design**:

- **Ultimate Limit State (ULS)** — the structure must not collapse; loads are factored up and material strengths factored down.
- **Serviceability Limit State (SLS)** — the structure must remain usable: deflection, cracking and vibration stay within limits.

### Why factors of safety

Factors cover real uncertainty: variable material quality, heavier-than-expected loads, and construction tolerances.

> Safety factors are not waste — they are the margin between "stands up" and "falls down" when reality differs from the calculation.`,
            contentAr: `## صمّم للقوة وللخدمة

تستخدم الأكواد الحديثة **التصميم بحالات الحد**:

- **حالة الحد الأقصى (ULS)** — يجب ألا تنهار المنشأة؛ تُضخَّم الأحمال وتُخفَّض مقاومات المواد بمعاملات.
- **حالة حد الخدمة (SLS)** — يجب أن تبقى المنشأة قابلة للاستخدام: الهبوط والتشقّق والاهتزاز ضمن الحدود.

### لماذا معاملات الأمان

تغطّي المعاملات عدم اليقين الحقيقي: تباين جودة المواد، وأحمال أثقل من المتوقَّع، وتفاوتات التنفيذ.

> معاملات الأمان ليست هدرًا — بل الهامش بين "تصمد" و"تنهار" حين يختلف الواقع عن الحساب.`,
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
                prompt: "The permanent self-weight of the structure is called the:",
                promptAr: "الوزن الدائم للمنشأة نفسها يُسمّى:",
                options: [
                  { text: "Dead load", textAr: "الحمل الميت", correct: true },
                  { text: "Live load", textAr: "الحمل الحي" },
                  { text: "Wind load", textAr: "حمل الرياح" },
                  { text: "Seismic load", textAr: "الحمل الزلزالي" },
                ],
                explanation: "Dead load is the permanent weight of the structure itself.",
                explanationAr: "الحمل الميت هو الوزن الدائم للمنشأة نفسها.",
              },
              {
                prompt: "A typical vertical load path in a building is:",
                promptAr: "مسار الحمل الرأسي النموذجي في مبنى هو:",
                options: [
                  { text: "Slab → beam → column → foundation → soil", textAr: "البلاطة ← الجسر ← العمود ← الأساس ← التربة", correct: true },
                  { text: "Soil → column → slab → roof", textAr: "التربة ← العمود ← البلاطة ← السقف" },
                  { text: "Foundation → beam → soil → column", textAr: "الأساس ← الجسر ← التربة ← العمود" },
                  { text: "Column → slab → beam → air", textAr: "العمود ← البلاطة ← الجسر ← الهواء" },
                ],
                explanation: "Load flows from slabs through beams and columns to the foundation and soil.",
                explanationAr: "ينتقل الحمل من البلاطات عبر الجسور والأعمدة إلى الأساس والتربة.",
              },
              {
                prompt: "In reinforced concrete, steel reinforcement is placed mainly to resist:",
                promptAr: "في الخرسانة المسلّحة، يُوضع التسليح الفولاذي أساسًا لمقاومة:",
                options: [
                  { text: "Tension, where concrete is weak", textAr: "الشدّ، حيث تكون الخرسانة ضعيفة", correct: true },
                  { text: "Compression, where concrete is weak", textAr: "الانضغاط، حيث تكون الخرسانة ضعيفة" },
                  { text: "The colour of the concrete", textAr: "لون الخرسانة" },
                  { text: "The curing temperature only", textAr: "حرارة المعالجة فقط" },
                ],
                explanation: "Concrete is weak in tension, so steel is placed where tension occurs.",
                explanationAr: "الخرسانة ضعيفة في الشدّ، لذا يُوضع الفولاذ حيث يحدث الشدّ.",
              },
              {
                prompt: "The Ultimate Limit State (ULS) is primarily concerned with:",
                promptAr: "حالة الحد الأقصى (ULS) تُعنى أساسًا بـ:",
                options: [
                  { text: "Preventing collapse / loss of strength", textAr: "منع الانهيار / فقدان المقاومة", correct: true },
                  { text: "Keeping the paint fresh", textAr: "إبقاء الدهان جديدًا" },
                  { text: "Minor deflection comfort only", textAr: "راحة الهبوط البسيط فقط" },
                  { text: "The project's cash flow", textAr: "التدفق النقدي للمشروع" },
                ],
                explanation: "ULS guards against collapse; serviceability (SLS) handles deflection/cracking.",
                explanationAr: "تحمي حالة الحد الأقصى من الانهيار؛ بينما تعالج حالة الخدمة الهبوط/التشقّق.",
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 17) ENGINEERING & DESIGN — MEP ESSENTIALS
  // =========================================================================
  {
    key: "engineering-mep-essentials",
    title: "MEP Engineering Essentials",
    titleAr: "أساسيات هندسة الميكانيكا والكهرباء والصحية",
    description:
      "The building services that make a building work — HVAC fundamentals, electrical systems and loads, water supply and drainage, and MEP coordination to avoid clashes.",
    descriptionAr:
      "خدمات المبنى التي تجعله يعمل — أساسيات التكييف والتهوية والأنظمة الكهربائية والأحمال والتغذية بالمياه والصرف وتنسيق MEP لتفادي التعارضات.",
    category: "Engineering & Design",
    level: "INTERMEDIATE",
    competency: "MEP Engineering",
    competencyAr: "هندسة الميكانيكا والكهرباء والصحية",
    modules: [
      {
        title: "Mechanical & Electrical",
        titleAr: "الميكانيكا والكهرباء",
        lessons: [
          {
            title: "HVAC Fundamentals",
            titleAr: "أساسيات التكييف والتهوية",
            type: "TEXT",
            durationMinutes: 13,
            content: `## Comfort, air quality and energy

**HVAC** = Heating, Ventilation and Air Conditioning. In the Gulf climate, cooling and fresh-air ventilation dominate.

- **Cooling load** — the heat a space gains (people, equipment, solar, outdoor air) that the system must remove.
- **Ventilation** — fresh air for health and air quality.
- **Efficiency** — chillers, duct sizing and controls drive a building's biggest energy bill.

> Oversize and you waste energy and money; undersize and the space never cools. Size to the real load.`,
            contentAr: `## الراحة وجودة الهواء والطاقة

**HVAC** = التدفئة والتهوية وتكييف الهواء. وفي مناخ الخليج يغلب التبريد والتهوية بالهواء النقي.

- **حمل التبريد** — الحرارة التي يكتسبها الحيّز (الأشخاص والأجهزة والإشعاع الشمسي والهواء الخارجي) ويجب أن يزيلها النظام.
- **التهوية** — هواء نقي للصحة وجودة الهواء.
- **الكفاءة** — المبرّدات وتحجيم المجاري وأنظمة التحكّم تحرّك أكبر فاتورة طاقة في المبنى.

> التحجيم الزائد يهدر الطاقة والمال؛ والناقص لا يبرّد الحيّز أبدًا. حجّم وفق الحمل الحقيقي.`,
          },
          {
            title: "Electrical Systems & Loads",
            titleAr: "الأنظمة الكهربائية والأحمال",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Power delivered safely

- **Load estimation** — add up the connected load, apply diversity (not everything runs at once) to size cables and boards.
- **Distribution** — main board → sub-boards → final circuits, each protected by the right breaker.
- **Protection & earthing** — circuit breakers, earthing and bonding protect people and equipment from faults.
- **Backup** — generators/UPS keep critical systems running.

> Undersized cables overheat; missing earthing kills. Protection and correct sizing are not optional extras.`,
            contentAr: `## طاقة تُوصَّل بأمان

- **تقدير الأحمال** — اجمع الحمل الموصَّل، وطبّق معامل التنوّع (لا يعمل كل شيء دفعةً واحدة) لتحجيم الكابلات واللوحات.
- **التوزيع** — اللوحة الرئيسية ← اللوحات الفرعية ← الدوائر النهائية، كلٌّ محميّة بالقاطع المناسب.
- **الحماية والتأريض** — القواطع والتأريض والربط تحمي الأشخاص والأجهزة من الأعطال.
- **الاحتياطي** — المولّدات/UPS تُبقي الأنظمة الحرجة تعمل.

> الكابلات الأصغر من اللازم تسخن؛ وغياب التأريض يقتل. فالحماية والتحجيم الصحيح ليسا إضافات اختيارية.`,
          },
        ],
      },
      {
        title: "Plumbing & Coordination",
        titleAr: "الصحية والتنسيق",
        lessons: [
          {
            title: "Water Supply & Drainage",
            titleAr: "التغذية بالمياه والصرف",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Clean in, dirty out — never mixed

- **Water supply** — sized for adequate pressure and flow at every outlet, with no cross-connection to foul water.
- **Drainage** — relies on gradients (falls), traps and vents so waste flows away and smells stay out.
- **Hot water** — storage and distribution sized for demand.

> Plumbing has one golden rule: clean water and foul water must never meet. Backflow prevention protects public health.`,
            contentAr: `## نظيف داخلًا وملوّث خارجًا — دون اختلاط

- **التغذية بالمياه** — تُحجَّم لضغط وتدفّق كافيين عند كل مخرج، دون أي ربط عكسي بمياه الصرف.
- **الصرف** — يعتمد على الميول والسيفونات والتهوية لتصريف الفضلات ومنع الروائح.
- **الماء الساخن** — تخزين وتوزيع يُحجَّم حسب الطلب.

> للصحية قاعدة ذهبية: يجب ألا يلتقي الماء النظيف بمياه الصرف أبدًا. ومنع الارتداد يحمي الصحة العامة.`,
          },
          {
            title: "MEP Coordination & Clash Avoidance",
            titleAr: "تنسيق MEP وتفادي التعارضات",
            type: "TEXT",
            durationMinutes: 13,
            content: `## Many services, one ceiling void

Mechanical ducts, electrical trays, water and drainage pipes all compete for the same space above the ceiling.

- **Coordinate in a BIM model** — resolve **clashes** (a duct through a beam, two pipes in one spot) before site.
- **Priority rules** — gravity drainage has little flexibility and usually routes first; flexible cabling bends around it.
- **Access & maintenance** — leave room to reach valves, dampers and junctions later.

> An uncoordinated ceiling means cutting, rework and delay on site. Solve the geometry in the model first.`,
            contentAr: `## خدمات كثيرة وفراغ سقف واحد

تتنافس مجاري الميكانيكا وأحواض الكهرباء وأنابيب المياه والصرف على الحيّز نفسه فوق السقف.

- **نسّق في نموذج BIM** — عالِج **التعارضات** (مجرى يخترق جسرًا، أنبوبان في موضع واحد) قبل الموقع.
- **قواعد الأولوية** — صرف الجاذبية قليل المرونة ويُوجَّه عادةً أولًا؛ والكابلات المرنة تلتفّ حوله.
- **الوصول والصيانة** — اترك حيّزًا للوصول إلى المحابس والخوانق والوصلات لاحقًا.

> السقف غير المنسّق يعني قصًّا وإعادة عمل وتأخيرًا في الموقع. حُلّ الهندسة في النموذج أولًا.`,
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
                prompt: "In the Gulf climate, the dominant HVAC concern for most buildings is:",
                promptAr: "في مناخ الخليج، الاهتمام الغالب في التكييف لمعظم المباني هو:",
                options: [
                  { text: "Cooling and fresh-air ventilation", textAr: "التبريد والتهوية بالهواء النقي", correct: true },
                  { text: "Snow loading on ducts", textAr: "حمل الثلوج على المجاري" },
                  { text: "Heating only", textAr: "التدفئة فقط" },
                  { text: "Preventing frozen pipes", textAr: "منع تجمّد الأنابيب" },
                ],
                explanation: "The hot climate makes cooling load and ventilation the main HVAC drivers.",
                explanationAr: "المناخ الحار يجعل حمل التبريد والتهوية المحرّكين الرئيسيين للتكييف.",
              },
              {
                prompt: "Applying 'diversity' when estimating electrical load means:",
                promptAr: "تطبيق 'معامل التنوّع' عند تقدير الحمل الكهربائي يعني:",
                options: [
                  { text: "Allowing that not all equipment runs at full load at the same time", textAr: "مراعاة أن ليست كل الأجهزة تعمل بكامل حملها في الوقت نفسه", correct: true },
                  { text: "Using cables of different colours", textAr: "استخدام كابلات بألوان مختلفة" },
                  { text: "Hiring diverse contractors", textAr: "توظيف مقاولين متنوّعين" },
                  { text: "Doubling every circuit", textAr: "مضاعفة كل دائرة" },
                ],
                explanation: "Diversity recognises that peak loads don't all coincide, so boards/cables are sized realistically.",
                explanationAr: "يراعي معامل التنوّع أن الأحمال القصوى لا تتزامن كلها، فتُحجَّم اللوحات/الكابلات واقعيًا.",
              },
              {
                prompt: "The golden rule of plumbing is that:",
                promptAr: "القاعدة الذهبية للأعمال الصحية هي أن:",
                options: [
                  { text: "Clean water and foul water must never cross-connect", textAr: "يجب ألا يُربط الماء النظيف بمياه الصرف إطلاقًا", correct: true },
                  { text: "All pipes must be copper", textAr: "يجب أن تكون كل الأنابيب نحاسية" },
                  { text: "Drainage flows uphill", textAr: "يسري الصرف إلى أعلى" },
                  { text: "Hot and cold pipes must touch", textAr: "يجب أن يتلامس أنبوبا الحار والبارد" },
                ],
                explanation: "Preventing cross-connection/backflow protects drinking water and public health.",
                explanationAr: "منع الربط العكسي/الارتداد يحمي مياه الشرب والصحة العامة.",
              },
              {
                prompt: "MEP coordination in a BIM model is done mainly to:",
                promptAr: "يُجرى تنسيق MEP في نموذج BIM أساسًا لـ:",
                options: [
                  { text: "Resolve clashes between services before they reach site", textAr: "حلّ التعارضات بين الخدمات قبل وصولها إلى الموقع", correct: true },
                  { text: "Decide the paint colour", textAr: "تحديد لون الدهان" },
                  { text: "Set worker salaries", textAr: "تحديد رواتب العمال" },
                  { text: "Choose the project name", textAr: "اختيار اسم المشروع" },
                ],
                explanation: "Clash detection in the model avoids costly cutting and rework on site.",
                explanationAr: "كشف التعارضات في النموذج يتجنّب القصّ وإعادة العمل المكلفين في الموقع.",
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 18) LOGISTICS & TRANSPORTATION — SUPPLY CHAIN PLANNING
  // =========================================================================
  {
    key: "logistics-supply-planning",
    title: "Supply Chain Planning & Inventory Optimization",
    titleAr: "تخطيط سلسلة الإمداد وتحسين المخزون",
    description:
      "Plan supply to meet demand at the right cost — demand forecasting, sales & operations planning, and inventory optimization with reorder points, safety stock and ABC analysis.",
    descriptionAr:
      "خطّط الإمداد لتلبية الطلب بالتكلفة المناسبة — التنبؤ بالطلب وتخطيط المبيعات والعمليات وتحسين المخزون بنقاط إعادة الطلب والمخزون الأماني وتحليل ABC.",
    category: "Logistics & Transportation",
    level: "INTERMEDIATE",
    competency: "Supply Chain Planning",
    competencyAr: "تخطيط سلسلة الإمداد",
    modules: [
      {
        title: "Demand & Planning",
        titleAr: "الطلب والتخطيط",
        lessons: [
          {
            title: "Demand Forecasting",
            titleAr: "التنبؤ بالطلب",
            type: "TEXT",
            durationMinutes: 13,
            content: `## Plan for what you will sell

- **Forecast** future demand from history, trend and seasonality — plus known events (promotions, Ramadan, Hajj season).
- **No forecast is exact** — measure error (e.g. bias and accuracy) and improve it over time.
- **Bullwhip effect** — small swings in customer demand amplify upstream, causing wild over- and under-stocking. Share real demand data to dampen it.

> A forecast is a plan, not a prophecy. Track the error and adjust — don't trust a single number blindly.`,
            contentAr: `## خطّط لما ستبيعه

- **تنبّأ** بالطلب المستقبلي من التاريخ والاتجاه والموسمية — إضافةً إلى الأحداث المعروفة (العروض، رمضان، موسم الحج).
- **لا تنبؤ دقيق تمامًا** — قِس الخطأ (مثل التحيّز والدقة) وحسّنه مع الوقت.
- **أثر السوط (Bullwhip)** — تتضخّم التقلّبات الصغيرة في طلب العميل صعودًا في السلسلة، مسبّبةً إفراطًا ونقصًا حادّين في المخزون. شارِك بيانات الطلب الحقيقية لتخفيفه.

> التنبؤ خطة لا نبوءة. تابِع الخطأ وعدّل — ولا تثق برقم واحد بشكل أعمى.`,
          },
          {
            title: "Sales & Operations Planning (S&OP)",
            titleAr: "تخطيط المبيعات والعمليات (S&OP)",
            type: "TEXT",
            durationMinutes: 12,
            content: `## One plan everyone agrees on

**S&OP** is a monthly cycle that aligns demand (sales/marketing) with supply (operations/procurement) and finance into a single agreed plan.

- **Balance** expected demand against capacity and inventory.
- **Decide** trade-offs: build ahead, add capacity, or manage demand.
- **One set of numbers** — sales, operations and finance stop working from different spreadsheets.

> Without S&OP, sales promises what operations can't deliver. One agreed plan beats three private ones.`,
            contentAr: `## خطة واحدة يتفق عليها الجميع

**S&OP** دورة شهرية تُواءم بين الطلب (المبيعات/التسويق) والإمداد (العمليات/المشتريات) والمالية في خطة واحدة متفق عليها.

- **وازِن** الطلب المتوقَّع مقابل الطاقة والمخزون.
- **قرّر** المفاضلات: البناء مسبقًا، أو زيادة الطاقة، أو إدارة الطلب.
- **مجموعة أرقام واحدة** — تتوقف المبيعات والعمليات والمالية عن العمل بجداول مختلفة.

> بدون S&OP تَعِد المبيعات بما لا تستطيع العمليات تسليمه. خطة واحدة متفق عليها خير من ثلاث خطط منفصلة.`,
          },
        ],
      },
      {
        title: "Inventory Optimization",
        titleAr: "تحسين المخزون",
        lessons: [
          {
            title: "Reorder Point, EOQ & Safety Stock",
            titleAr: "نقطة إعادة الطلب وكمية الطلب الاقتصادية والمخزون الأماني",
            type: "TEXT",
            durationMinutes: 14,
            content: `## How much to order, and when

- **Reorder point** — the stock level that triggers a new order, set to cover demand during the **lead time**.
- **Economic Order Quantity (EOQ)** — the order size that balances ordering cost against holding cost.
- **Safety stock** — a buffer for demand and lead-time variability, so a normal fluctuation doesn't cause a stockout.

### The balance

Too much stock ties up cash and risks obsolescence; too little causes stockouts and lost sales. Optimization finds the middle.

> Inventory is frozen cash. Hold enough to serve customers — and not one riyal more than you must.`,
            contentAr: `## كم تطلب ومتى

- **نقطة إعادة الطلب** — مستوى المخزون الذي يُطلِق طلبًا جديدًا، ويُضبَط لتغطية الطلب خلال **مدة التوريد**.
- **كمية الطلب الاقتصادية (EOQ)** — حجم الطلب الذي يوازن بين كلفة الطلب وكلفة الاحتفاظ.
- **المخزون الأماني** — مخزون احتياطي لتقلّب الطلب ومدة التوريد، كي لا يسبّب تقلّبٌ عاديّ نفادًا.

### التوازن

المخزون الزائد يجمّد النقد ويخاطر بالتقادم؛ والقليل يسبّب نفادًا ومبيعات ضائعة. والتحسين يجد الوسط.

> المخزون نقد مجمَّد. احتفظ بما يكفي لخدمة العملاء — ولا ريالًا واحدًا فوق ما يلزم.`,
          },
          {
            title: "ABC Analysis & Service Levels",
            titleAr: "تحليل ABC ومستويات الخدمة",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Focus effort where it matters

- **ABC analysis** — classify items by value/impact: **A** items (few items, most of the value) get tight control; **C** items (many, low value) get simple rules.
- **Service level** — the target probability of not running out; higher service needs more safety stock.
- **Pareto (80/20)** — roughly 80% of value often comes from 20% of items.

> You cannot manage every SKU with equal attention. Guard the A items closely; keep the C items simple.`,
            contentAr: `## ركّز الجهد حيث يهم

- **تحليل ABC** — صنّف البنود حسب القيمة/الأثر: بنود **A** (قليلة وتمثّل معظم القيمة) تحظى بضبط دقيق؛ وبنود **C** (كثيرة ومنخفضة القيمة) تُدار بقواعد بسيطة.
- **مستوى الخدمة** — الاحتمال المستهدف لعدم النفاد؛ وكلما ارتفع لزِم مخزون أماني أكبر.
- **باريتو (80/20)** — غالبًا ما يأتي ٨٠٪ من القيمة من ٢٠٪ من البنود.

> لا يمكنك إدارة كل صنف باهتمام متساوٍ. احرُس بنود A عن قرب وأبقِ بنود C بسيطة.`,
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
                prompt: "The 'bullwhip effect' in a supply chain refers to:",
                promptAr: "'أثر السوط' في سلسلة الإمداد يشير إلى:",
                options: [
                  { text: "Small swings in customer demand amplifying into larger swings upstream", textAr: "تضخّم تقلّبات صغيرة في طلب العميل إلى تقلّبات أكبر صعودًا في السلسلة", correct: true },
                  { text: "Faster delivery trucks", textAr: "شاحنات توصيل أسرع" },
                  { text: "A discount on bulk orders", textAr: "خصم على الطلبات الكبيرة" },
                  { text: "A type of warehouse rack", textAr: "نوع من رفوف المستودعات" },
                ],
                explanation: "Demand variability amplifies upstream, causing over- and under-stocking; sharing real demand reduces it.",
                explanationAr: "يتضخّم تقلّب الطلب صعودًا مسبّبًا إفراطًا ونقصًا؛ ومشاركة الطلب الحقيقي تقلّله.",
              },
              {
                prompt: "The main purpose of S&OP is to:",
                promptAr: "الغرض الرئيسي من S&OP هو:",
                options: [
                  { text: "Align demand, supply and finance into one agreed plan", textAr: "مواءمة الطلب والإمداد والمالية في خطة واحدة متفق عليها", correct: true },
                  { text: "Replace the accounting system", textAr: "استبدال النظام المحاسبي" },
                  { text: "Design the warehouse layout", textAr: "تصميم مخطّط المستودع" },
                  { text: "Hire delivery drivers", textAr: "توظيف سائقي التوصيل" },
                ],
                explanation: "S&OP reconciles demand and supply with finance so everyone works to one plan.",
                explanationAr: "توائم S&OP بين الطلب والإمداد والمالية ليعمل الجميع بخطة واحدة.",
              },
              {
                prompt: "Safety stock exists mainly to:",
                promptAr: "يوجد المخزون الأماني أساسًا لـ:",
                options: [
                  { text: "Buffer against variability in demand and lead time", textAr: "امتصاص تقلّب الطلب ومدة التوريد", correct: true },
                  { text: "Fill the warehouse completely", textAr: "ملء المستودع بالكامل" },
                  { text: "Avoid ever placing orders", textAr: "تجنّب تقديم أي طلبات" },
                  { text: "Increase obsolescence on purpose", textAr: "زيادة التقادم عمدًا" },
                ],
                explanation: "Safety stock absorbs normal variability so a fluctuation doesn't cause a stockout.",
                explanationAr: "يمتصّ المخزون الأماني التقلّب العادي كي لا يسبّب نفادًا.",
              },
              {
                prompt: "In ABC analysis, 'A' items are:",
                promptAr: "في تحليل ABC، بنود 'A' هي:",
                options: [
                  { text: "A small number of items that represent most of the value — tightly controlled", textAr: "عدد قليل من البنود تمثّل معظم القيمة — وتُضبَط بدقة", correct: true },
                  { text: "The cheapest, least important items", textAr: "الأرخص والأقل أهمية" },
                  { text: "Items stored alphabetically", textAr: "بنود مخزّنة أبجديًا" },
                  { text: "Items with no demand", textAr: "بنود بلا طلب" },
                ],
                explanation: "A items are the high-value few that justify the tightest inventory control.",
                explanationAr: "بنود A هي القلّة عالية القيمة التي تستحق أدقّ ضبط للمخزون.",
              },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 19) LOGISTICS & TRANSPORTATION — COLD CHAIN & DANGEROUS GOODS
  // =========================================================================
  {
    key: "logistics-coldchain-dg",
    title: "Cold Chain & Dangerous Goods Logistics",
    titleAr: "لوجستيات سلسلة التبريد والبضائع الخطرة",
    description:
      "Move sensitive and hazardous cargo safely and legally — temperature-controlled cold chain with monitoring and SFDA/HACCP compliance, and dangerous-goods classes, labelling, handling and documentation.",
    descriptionAr:
      "انقل الشحنات الحسّاسة والخطرة بأمان وقانونية — سلسلة تبريد متحكَّم بها مع المراقبة والامتثال لهيئة الغذاء والدواء/HACCP، وأصناف البضائع الخطرة ووسمها ومناولتها ومستنداتها.",
    category: "Logistics & Transportation",
    level: "INTERMEDIATE",
    competency: "Specialized Logistics",
    competencyAr: "اللوجستيات المتخصصة",
    modules: [
      {
        title: "Cold Chain",
        titleAr: "سلسلة التبريد",
        lessons: [
          {
            title: "Temperature-Controlled Logistics",
            titleAr: "اللوجستيات المتحكَّم بحرارتها",
            type: "TEXT",
            durationMinutes: 13,
            content: `## Keep it cold, end to end

The **cold chain** keeps temperature-sensitive goods (food, pharmaceuticals, vaccines) within a required range from origin to delivery.

- **Unbroken chain** — storage, loading, transit and the last mile must all stay in range; one warm gap can spoil the whole load.
- **Pre-cooling** — chill the vehicle/box before loading, not after.
- **Right equipment** — reefer trucks, insulated boxes and cold-storage warehouses.

> In the cold chain the weakest link sets the quality. A single unmonitored hour on a hot loading bay can ruin a shipment.`,
            contentAr: `## أبقِها باردة من الطرف إلى الطرف

تُبقي **سلسلة التبريد** البضائع الحسّاسة للحرارة (الأغذية والأدوية واللقاحات) ضمن نطاق مطلوب من المصدر حتى التسليم.

- **سلسلة غير مكسورة** — التخزين والتحميل والنقل والميل الأخير يجب أن تبقى كلها ضمن النطاق؛ وفجوة دافئة واحدة قد تُفسد الحمل كله.
- **التبريد المسبق** — برّد المركبة/الصندوق قبل التحميل لا بعده.
- **المعدات المناسبة** — شاحنات مبرَّدة وصناديق معزولة ومستودعات تبريد.

> في سلسلة التبريد تحدّد أضعف حلقة الجودة. وساعة واحدة غير مراقَبة على رصيف تحميل حار قد تُتلف شحنة.`,
          },
          {
            title: "Monitoring & Compliance (HACCP / SFDA)",
            titleAr: "المراقبة والامتثال (HACCP / هيئة الغذاء والدواء)",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Prove the temperature, don't assume it

- **Data loggers / IoT sensors** record temperature continuously and alert on excursions.
- **HACCP** — a food-safety system that identifies critical control points (like holding temperature) and sets limits and corrective actions.
- **Saudi compliance** — temperature-sensitive food and pharma are regulated by the **SFDA**; keep records to demonstrate the chain held.

> "It looked fine" is not evidence. A continuous temperature record is what proves — to the regulator and the customer — that the product is safe.`,
            contentAr: `## أثبِت الحرارة ولا تفترضها

- **مسجّلات البيانات / حسّاسات إنترنت الأشياء** تسجّل الحرارة باستمرار وتنبّه عند التجاوزات.
- **HACCP** — نظام سلامة غذائية يحدّد نقاط التحكّم الحرجة (مثل حرارة الحفظ) ويضع الحدود والإجراءات التصحيحية.
- **الامتثال السعودي** — الأغذية والأدوية الحسّاسة للحرارة تنظّمها **هيئة الغذاء والدواء (SFDA)**؛ احتفظ بالسجلات لإثبات بقاء السلسلة.

> "بدت سليمة" ليست دليلًا. فالسجل الحراري المستمر هو ما يُثبت — للجهة التنظيمية وللعميل — أن المنتج آمن.`,
          },
        ],
      },
      {
        title: "Dangerous Goods",
        titleAr: "البضائع الخطرة",
        lessons: [
          {
            title: "Dangerous Goods Classes & Labelling",
            titleAr: "أصناف البضائع الخطرة ووسمها",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Know what you are moving

**Dangerous goods (DG)** are classified into hazard classes, for example:

- **Class 1** — explosives
- **Class 2** — gases
- **Class 3** — flammable liquids (fuel, solvents)
- **Class 6** — toxic substances
- **Class 8** — corrosives

Each has a **label/placard** and a **UN number** identifying the substance. Correct classification drives packaging, labelling, segregation and the route.

> Mislabelling dangerous goods is not paperwork — it is a safety failure that endangers handlers, drivers and the public.`,
            contentAr: `## اعرف ما الذي تنقله

تُصنَّف **البضائع الخطرة (DG)** إلى فئات خطورة، مثل:

- **الفئة 1** — المتفجرات
- **الفئة 2** — الغازات
- **الفئة 3** — السوائل القابلة للاشتعال (الوقود والمذيبات)
- **الفئة 6** — المواد السامة
- **الفئة 8** — المواد الأكّالة

لكلٍّ **ملصق/لوحة تحذير** و**رقم أممي (UN)** يحدّد المادة. والتصنيف الصحيح يحدّد التغليف والوسم والفصل والمسار.

> الوسم الخاطئ للبضائع الخطرة ليس إجراءً ورقيًا — بل إخفاق سلامة يهدّد المناولين والسائقين والجمهور.`,
          },
          {
            title: "Safe Handling & Documentation",
            titleAr: "المناولة الآمنة والمستندات",
            type: "TEXT",
            durationMinutes: 12,
            content: `## Handle, segregate, document

- **Segregation** — incompatible goods (e.g. oxidizers and flammables) must be kept apart.
- **Packaging** — UN-approved packaging rated for the substance and quantity.
- **Training** — only trained staff may handle and sign off DG.
- **Documentation** — a dangerous-goods declaration and the **Safety Data Sheet (SDS)** must travel with the shipment.

### Emergencies

Know the spill/fire response for what you carry before you move it — not during an incident.

> With dangerous goods, "don't know" means "don't move." Verify classification, packaging and paperwork first.`,
            contentAr: `## ناوِل وافصِل ووثّق

- **الفصل** — يجب إبقاء البضائع غير المتوافقة متباعدة (مثل المؤكسِدات والمواد القابلة للاشتعال).
- **التغليف** — تغليف معتمد أمميًا ومصنَّف للمادة والكمية.
- **التدريب** — لا يناوِل البضائع الخطرة ويعتمدها إلا موظفون مدرَّبون.
- **المستندات** — يجب أن يرافق الشحنةَ إقرارُ بضائع خطرة و**صحيفة بيانات السلامة (SDS)**.

### الطوارئ

اعرف استجابة الانسكاب/الحريق لما تنقله قبل تحريكه — لا أثناء الحادث.

> مع البضائع الخطرة، "لا أعرف" تعني "لا تنقل". تحقّق من التصنيف والتغليف والمستندات أولًا.`,
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
                prompt: "A 'broken cold chain' means:",
                promptAr: "'سلسلة تبريد مكسورة' تعني:",
                options: [
                  { text: "The temperature went out of the required range at some point, risking the product", textAr: "خروج الحرارة عن النطاق المطلوب في مرحلة ما، مع تعريض المنتج للخطر", correct: true },
                  { text: "A refrigerator door that won't open", textAr: "باب ثلاجة لا يُفتح" },
                  { text: "A delayed invoice", textAr: "فاتورة متأخرة" },
                  { text: "A truck with a flat tyre", textAr: "شاحنة بإطار مثقوب" },
                ],
                explanation: "Any out-of-range gap — storage, transit or last mile — breaks the chain and can spoil goods.",
                explanationAr: "أي فجوة خارج النطاق — تخزينًا أو نقلًا أو ميلًا أخيرًا — تكسر السلسلة وقد تُفسد البضائع.",
              },
              {
                prompt: "What best proves a cold-chain shipment stayed in range?",
                promptAr: "ما الذي يُثبت أفضل أن شحنة سلسلة التبريد بقيت ضمن النطاق؟",
                options: [
                  { text: "A continuous temperature record from data loggers/sensors", textAr: "سجل حراري مستمر من مسجّلات البيانات/الحسّاسات", correct: true },
                  { text: "The driver saying it felt cold", textAr: "قول السائق إنها بدت باردة" },
                  { text: "The colour of the box", textAr: "لون الصندوق" },
                  { text: "A low fuel receipt", textAr: "إيصال وقود منخفض" },
                ],
                explanation: "Continuous temperature logging is the evidence regulators and customers require.",
                explanationAr: "التسجيل الحراري المستمر هو الدليل الذي تطلبه الجهات التنظيمية والعملاء.",
              },
              {
                prompt: "In dangerous-goods transport, flammable liquids such as fuel and solvents are:",
                promptAr: "في نقل البضائع الخطرة، السوائل القابلة للاشتعال كالوقود والمذيبات هي:",
                options: [
                  { text: "Class 3", textAr: "الفئة 3", correct: true },
                  { text: "Class 1 (explosives)", textAr: "الفئة 1 (المتفجرات)" },
                  { text: "Class 8 (corrosives)", textAr: "الفئة 8 (الأكّالة)" },
                  { text: "Not classified at all", textAr: "غير مصنّفة إطلاقًا" },
                ],
                explanation: "Flammable liquids are dangerous-goods Class 3.",
                explanationAr: "السوائل القابلة للاشتعال هي الفئة 3 من البضائع الخطرة.",
              },
              {
                prompt: "Which document must travel with a dangerous-goods shipment?",
                promptAr: "أي مستند يجب أن يرافق شحنة البضائع الخطرة؟",
                options: [
                  { text: "The dangerous-goods declaration and the Safety Data Sheet (SDS)", textAr: "إقرار البضائع الخطرة وصحيفة بيانات السلامة (SDS)", correct: true },
                  { text: "A holiday calendar", textAr: "تقويم الإجازات" },
                  { text: "The driver's lunch receipt", textAr: "إيصال غداء السائق" },
                  { text: "A marketing brochure", textAr: "كتيّب تسويقي" },
                ],
                explanation: "DG shipments require a declaration and the SDS so handlers know the hazard and response.",
                explanationAr: "تتطلّب شحنات البضائع الخطرة إقرارًا وصحيفة بيانات سلامة ليعرف المناولون الخطر والاستجابة.",
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
