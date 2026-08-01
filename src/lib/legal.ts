import type { Locale } from "@/lib/i18n";

/**
 * Bilingual legal document content (Terms of Service, Privacy Policy).
 *
 * IMPORTANT: These are configurable TEMPLATES, aligned with Saudi Arabia's
 * Personal Data Protection Law (PDPL) concepts, provided so the platform ships
 * with complete, coherent policy pages. They are NOT a substitute for legal
 * advice — the operator must review and adapt them with qualified counsel and
 * fill in the company details in LEGAL_ENTITY before going live.
 */

export const LEGAL_ENTITY = {
  // Fill these in for the operating company before launch. Kept in one place so
  // the policy pages and contact details stay consistent.
  name: process.env.LEGAL_ENTITY_NAME ?? "Bassir Technology",
  productName: "Bassir Corporate Academy Platform (BCAP)",
  contactEmail: process.env.LEGAL_CONTACT_EMAIL ?? "privacy@bassir-academy.com",
  jurisdiction: "the Kingdom of Saudi Arabia",
  lastUpdated: "2026-08-01",
};

export interface LegalSection {
  heading: { en: string; ar: string };
  body: { en: string[]; ar: string[] };
}

export interface LegalDoc {
  slug: "terms" | "privacy";
  title: { en: string; ar: string };
  intro: { en: string; ar: string };
  sections: LegalSection[];
}

const E = LEGAL_ENTITY;

/** Shown at the top of every policy page — flags these as reviewable templates. */
export const LEGAL_DISCLAIMER = {
  en: `This document is a template provided with ${E.productName}. It should be reviewed and adapted by the operating company's legal counsel before commercial use. It does not constitute legal advice.`,
  ar: `هذه الوثيقة نموذج مُرفق مع ${E.productName}، ويجب مراجعتها وتكييفها من قبل المستشار القانوني للشركة المشغّلة قبل الاستخدام التجاري. ولا تُعدّ استشارة قانونية.`,
};

export const LEGAL_META = {
  entity: E,
  updatedLabel: { en: "Last updated", ar: "آخر تحديث" },
  disclaimerLabel: { en: "Template notice", ar: "تنويه بشأن النموذج" },
  backHome: { en: "Back to home", ar: "العودة للرئيسية" },
  terms: { en: "Terms of Service", ar: "شروط الخدمة" },
  privacy: { en: "Privacy Policy", ar: "سياسة الخصوصية" },
};

const TERMS: LegalDoc = {
  slug: "terms",
  title: { en: "Terms of Service", ar: "شروط الخدمة" },
  intro: {
    en: `These Terms govern access to and use of ${E.productName} (the "Service"), operated by ${E.name}. By subscribing to or using the Service, the customer organisation ("Customer") and its authorised users agree to these Terms.`,
    ar: `تحكم هذه الشروط الوصول إلى ${E.productName} ("الخدمة") واستخدامها، والمشغّلة من قبل ${E.name}. وباشتراك المؤسسة العميلة ("العميل") ومستخدميها المصرّح لهم في الخدمة أو استخدامها، فإنهم يوافقون على هذه الشروط.`,
  },
  sections: [
    {
      heading: { en: "1. The Service", ar: "١. الخدمة" },
      body: {
        en: [
          `${E.productName} is a multi-tenant software-as-a-service platform for employee development, competency management, corporate learning, and workforce analytics.`,
          "Each Customer operates within an isolated tenant workspace. The Customer is responsible for configuring roles, inviting users, and the content it uploads.",
        ],
        ar: [
          `${E.productName} منصّة برمجية كخدمة متعددة المستأجرين لتطوير الموظفين وإدارة الكفاءات والتعلّم المؤسسي وتحليلات القوى العاملة.`,
          "يعمل كل عميل ضمن مساحة عمل معزولة خاصة به، وهو المسؤول عن ضبط الأدوار ودعوة المستخدمين والمحتوى الذي يرفعه.",
        ],
      },
    },
    {
      heading: { en: "2. Accounts and access", ar: "٢. الحسابات والوصول" },
      body: {
        en: [
          "Users must provide accurate information and keep their credentials confidential. The Customer's administrators control who may access the workspace and at what permission level.",
          "The Customer is responsible for activity performed under its users' accounts and must promptly disable access for departing personnel.",
        ],
        ar: [
          "يجب على المستخدمين تقديم معلومات دقيقة والحفاظ على سرية بيانات الدخول. ويتحكّم مسؤولو العميل في من يجوز له الوصول إلى مساحة العمل وبأي مستوى صلاحية.",
          "يتحمّل العميل مسؤولية النشاط الذي يتم عبر حسابات مستخدميه، وعليه تعطيل وصول الموظفين المغادرين دون تأخير.",
        ],
      },
    },
    {
      heading: { en: "3. Subscriptions and fees", ar: "٣. الاشتراكات والرسوم" },
      body: {
        en: [
          "Access is provided on a subscription basis according to the plan selected (including any seat limits and feature entitlements). Fees, billing cycle, and applicable taxes (including VAT where applicable) are presented at checkout.",
          "Unless stated otherwise, subscriptions renew automatically for successive terms until cancelled. Cancellation takes effect at the end of the current billing period.",
        ],
        ar: [
          "يُتاح الوصول على أساس اشتراك وفق الباقة المختارة (بما في ذلك حدود المقاعد والميزات). وتُعرض الرسوم ودورة الفوترة والضرائب المطبّقة (بما فيها ضريبة القيمة المضافة عند الاقتضاء) عند الدفع.",
          "ما لم يُذكر خلاف ذلك، تتجدّد الاشتراكات تلقائيًا لمدد متعاقبة حتى الإلغاء، ويسري الإلغاء في نهاية دورة الفوترة الحالية.",
        ],
      },
    },
    {
      heading: { en: "4. Acceptable use", ar: "٤. الاستخدام المقبول" },
      body: {
        en: [
          "Customers and users must not misuse the Service, including attempting to breach tenant isolation or security, uploading unlawful content, or infringing others' rights.",
          "The Customer must ensure it has the necessary rights and lawful basis for any personal data it processes through the Service.",
        ],
        ar: [
          "يجب على العملاء والمستخدمين عدم إساءة استخدام الخدمة، بما في ذلك محاولة اختراق عزل المستأجرين أو الأمن، أو رفع محتوى غير مشروع، أو التعدّي على حقوق الغير.",
          "يجب على العميل التأكّد من امتلاكه الحقوق والأساس النظامي اللازمين لأي بيانات شخصية يعالجها عبر الخدمة.",
        ],
      },
    },
    {
      heading: { en: "5. Data ownership", ar: "٥. ملكية البيانات" },
      body: {
        en: [
          "The Customer retains ownership of the data it and its users submit. The operator processes that data only to provide and support the Service, as described in the Privacy Policy and the Data Processing terms.",
        ],
        ar: [
          "يحتفظ العميل بملكية البيانات التي يقدّمها هو ومستخدموه. ويعالج المشغّل تلك البيانات فقط لتقديم الخدمة ودعمها، وفق ما هو موضّح في سياسة الخصوصية وشروط معالجة البيانات.",
        ],
      },
    },
    {
      heading: { en: "6. Availability and support", ar: "٦. التوافر والدعم" },
      body: {
        en: [
          "The operator aims to provide a reliable Service but does not warrant uninterrupted availability. Planned maintenance and any applicable service levels are communicated separately.",
        ],
        ar: [
          "يسعى المشغّل لتقديم خدمة موثوقة، لكنه لا يضمن توافرًا دون انقطاع. ويُبلَّغ عن الصيانة المخطّطة ومستويات الخدمة المطبّقة بشكل منفصل.",
        ],
      },
    },
    {
      heading: { en: "7. Liability", ar: "٧. المسؤولية" },
      body: {
        en: [
          "To the extent permitted by law, the operator's aggregate liability is limited to the fees paid for the Service in the twelve months preceding the claim. The operator is not liable for indirect or consequential losses.",
        ],
        ar: [
          "إلى الحد الذي يسمح به النظام، تقتصر المسؤولية الإجمالية للمشغّل على الرسوم المدفوعة عن الخدمة خلال الاثني عشر شهرًا السابقة للمطالبة. ولا يتحمّل المشغّل الخسائر غير المباشرة أو التبعية.",
        ],
      },
    },
    {
      heading: { en: "8. Term and termination", ar: "٨. المدة والإنهاء" },
      body: {
        en: [
          "Either party may terminate as set out in the subscription agreement. On termination, the Customer may export its data for a limited period, after which it is deleted in line with the retention policy.",
        ],
        ar: [
          "يجوز لأي من الطرفين الإنهاء وفق ما هو منصوص عليه في اتفاقية الاشتراك. وعند الإنهاء، يجوز للعميل تصدير بياناته خلال فترة محدودة، وبعدها تُحذف وفق سياسة الاحتفاظ.",
        ],
      },
    },
    {
      heading: { en: "9. Governing law", ar: "٩. القانون الحاكم" },
      body: {
        en: [
          `These Terms are governed by the laws of ${E.jurisdiction}, and disputes are subject to its competent courts, without prejudice to any mandatory consumer or data-protection rights.`,
        ],
        ar: [
          `تخضع هذه الشروط لأنظمة ${E.jurisdiction}، وتختص محاكمها المختصة بالنظر في النزاعات، دون الإخلال بأي حقوق إلزامية للمستهلك أو حماية البيانات.`,
        ],
      },
    },
    {
      heading: { en: "10. Contact", ar: "١٠. التواصل" },
      body: {
        en: [`Questions about these Terms: ${E.contactEmail}.`],
        ar: [`للاستفسار عن هذه الشروط: ${E.contactEmail}.`],
      },
    },
  ],
};

const PRIVACY: LegalDoc = {
  slug: "privacy",
  title: { en: "Privacy Policy", ar: "سياسة الخصوصية" },
  intro: {
    en: `This Policy explains how personal data is handled within ${E.productName}, consistent with the Personal Data Protection Law (PDPL) of ${E.jurisdiction}. In most cases the Customer organisation is the data controller and ${E.name} acts as a data processor on its behalf.`,
    ar: `توضّح هذه السياسة كيفية التعامل مع البيانات الشخصية داخل ${E.productName}، بما يتوافق مع نظام حماية البيانات الشخصية (PDPL) في ${E.jurisdiction}. وفي معظم الحالات تكون المؤسسة العميلة هي جهة التحكّم في البيانات، وتعمل ${E.name} كجهة معالجة نيابةً عنها.`,
  },
  sections: [
    {
      heading: { en: "1. Data we process", ar: "١. البيانات التي نعالجها" },
      body: {
        en: [
          "Account and profile data (name, work email, job title, department, branch), authentication data (hashed passwords, session records), and development data (training, competencies, certifications, succession and performance ratings).",
          "Technical logs (audit events, sign-in timestamps) needed for security and support. Passwords are stored only as salted hashes and are never readable.",
        ],
        ar: [
          "بيانات الحساب والملف الشخصي (الاسم، البريد الوظيفي، المسمّى الوظيفي، الإدارة، الفرع)، وبيانات المصادقة (كلمات المرور المشفّرة، سجلات الجلسات)، وبيانات التطوير (التدريب، الكفاءات، الشهادات، التعاقب وتقييمات الأداء).",
          "سجلات تقنية (أحداث التدقيق، أوقات تسجيل الدخول) لازمة للأمن والدعم. وتُخزَّن كلمات المرور كقيم مشفّرة (hash) فقط ولا يمكن قراءتها.",
        ],
      },
    },
    {
      heading: { en: "2. Purpose and lawful basis", ar: "٢. الغرض والأساس النظامي" },
      body: {
        en: [
          "Data is processed to provide the Service: authentication, delivering development modules, analytics for the employer, billing, and security.",
          "The lawful basis is typically the performance of the employment or service relationship and the legitimate interests of the employer in developing its workforce, consistent with the PDPL. Data is not sold.",
        ],
        ar: [
          "تُعالَج البيانات لتقديم الخدمة: المصادقة، وتقديم وحدات التطوير، والتحليلات لصاحب العمل، والفوترة، والأمن.",
          "الأساس النظامي عادةً هو تنفيذ علاقة العمل أو الخدمة والمصلحة المشروعة لصاحب العمل في تطوير قواه العاملة، بما يتوافق مع نظام حماية البيانات. ولا تُباع البيانات.",
        ],
      },
    },
    {
      heading: { en: "3. Data subject rights", ar: "٣. حقوق صاحب البيانات" },
      body: {
        en: [
          "Under the PDPL, data subjects have the right to be informed, to access their data, to request correction, to request deletion, and to withdraw consent where processing relies on it.",
          `Because the employer is usually the controller, requests should first be directed to the employer's administrator; they may also be sent to ${E.contactEmail} and will be routed appropriately.`,
        ],
        ar: [
          "بموجب نظام حماية البيانات الشخصية، يحقّ لأصحاب البيانات: العلم بالمعالجة، والوصول إلى بياناتهم، وطلب تصحيحها، وطلب حذفها، وسحب الموافقة حيثما اعتمدت المعالجة عليها.",
          `ولأن صاحب العمل هو جهة التحكّم عادةً، تُوجَّه الطلبات أولًا إلى مسؤول صاحب العمل، ويمكن كذلك إرسالها إلى ${E.contactEmail} لتوجيهها بشكل مناسب.`,
        ],
      },
    },
    {
      heading: { en: "4. Data retention", ar: "٤. الاحتفاظ بالبيانات" },
      body: {
        en: [
          "Personal data is retained for as long as the Customer's account is active and for the period necessary to meet legal, accounting, and security obligations.",
          "On account termination, Customer data is available for export for a limited window and is then deleted or irreversibly anonymised.",
        ],
        ar: [
          "يُحتفظ بالبيانات الشخصية طوال فترة نشاط حساب العميل وللمدة اللازمة للوفاء بالالتزامات النظامية والمحاسبية والأمنية.",
          "وعند إنهاء الحساب، تتاح بيانات العميل للتصدير خلال فترة محدودة ثم تُحذف أو تُجهَّل بصورة لا رجعة فيها.",
        ],
      },
    },
    {
      heading: { en: "5. Security", ar: "٥. الأمن" },
      body: {
        en: [
          "Tenant data is isolated at the database level using row-level security. Access is role-based, passwords are hashed, sessions are signed, and administrative actions are audit-logged.",
          "Data is encrypted in transit. Operators should also ensure encryption at rest, backups, and monitoring in their deployment environment.",
        ],
        ar: [
          "تُعزل بيانات كل مستأجر على مستوى قاعدة البيانات باستخدام أمان مستوى الصف (RLS). والوصول قائم على الأدوار، وكلمات المرور مشفّرة، والجلسات موقّعة، وتُسجَّل الإجراءات الإدارية في سجل التدقيق.",
          "تُشفَّر البيانات أثناء النقل. وينبغي على المشغّل كذلك ضمان التشفير أثناء التخزين والنسخ الاحتياطي والمراقبة في بيئة التشغيل.",
        ],
      },
    },
    {
      heading: { en: "6. Sub-processors", ar: "٦. جهات المعالجة الفرعية" },
      body: {
        en: [
          "The Service may rely on sub-processors for hosting, email delivery, and payment processing. These are engaged under agreements requiring appropriate safeguards, and a current list is available on request.",
        ],
        ar: [
          "قد تعتمد الخدمة على جهات معالجة فرعية للاستضافة وإرسال البريد ومعالجة المدفوعات. ويتم التعاقد معها بموجب اتفاقيات تتطلّب ضمانات مناسبة، وتتوفّر قائمة محدّثة عند الطلب.",
        ],
      },
    },
    {
      heading: { en: "7. Cross-border transfers", ar: "٧. النقل عبر الحدود" },
      body: {
        en: [
          "Where data is transferred outside the Kingdom, such transfers are made only in accordance with the PDPL and its implementing regulations, including appropriate safeguards or the data subject's rights being preserved.",
        ],
        ar: [
          "حيثما تُنقل البيانات خارج المملكة، لا يتم ذلك إلا وفقًا لنظام حماية البيانات الشخصية ولائحته التنفيذية، بما في ذلك توفير الضمانات المناسبة أو الحفاظ على حقوق صاحب البيانات.",
        ],
      },
    },
    {
      heading: { en: "8. Breach notification", ar: "٨. الإبلاغ عن الانتهاكات" },
      body: {
        en: [
          "In the event of a personal-data breach that poses a risk, the operator will notify the affected Customer without undue delay so the controller can meet its notification obligations to the competent authority and data subjects.",
        ],
        ar: [
          "في حال وقوع انتهاك للبيانات الشخصية يترتّب عليه خطر، سيُخطِر المشغّل العميل المتأثّر دون تأخير غير مبرّر، ليتمكّن المتحكّم من الوفاء بالتزامات الإخطار للجهة المختصة ولأصحاب البيانات.",
        ],
      },
    },
    {
      heading: { en: "9. Contact", ar: "٩. التواصل" },
      body: {
        en: [
          `For privacy questions or to exercise your rights, contact ${E.contactEmail}. If your employer operates this workspace, you may also contact your administrator.`,
        ],
        ar: [
          `للاستفسارات المتعلّقة بالخصوصية أو لممارسة حقوقك، تواصل عبر ${E.contactEmail}. وإذا كان صاحب عملك يشغّل مساحة العمل هذه، يمكنك أيضًا التواصل مع مسؤولك.`,
        ],
      },
    },
  ],
};

const DOCS: Record<"terms" | "privacy", LegalDoc> = {
  terms: TERMS,
  privacy: PRIVACY,
};

export function legalDoc(slug: "terms" | "privacy"): LegalDoc {
  return DOCS[slug];
}

/** Pick the string for the active locale. */
export function pick<T>(pair: { en: T; ar: T }, locale: Locale): T {
  return locale === "ar" ? pair.ar : pair.en;
}
