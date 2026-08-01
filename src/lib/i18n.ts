import { cookies } from "next/headers";

export type Locale = "en" | "ar";
export const LOCALES: Locale[] = ["en", "ar"];
export const LOCALE_COOKIE = "bcap_locale";
export const DEFAULT_LOCALE: Locale = "en";

export function dir(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Read the current UI locale from the cookie (server components / actions). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const v = store.get(LOCALE_COOKIE)?.value;
  return v === "ar" ? "ar" : "en";
}

/**
 * Translation dictionary. Keys are grouped by area but live in one flat map so
 * `t(key)` is simple. Add entries here to translate more of the UI.
 */
type Entry = { en: string; ar: string };

export const DICT: Record<string, Entry> = {
  // Brand / chrome
  poweredByBcap: { en: "Powered by BCAP", ar: "مدعوم من BCAP" },
  signOut: { en: "Sign out", ar: "تسجيل الخروج" },
  switchAccount: { en: "Switch account / sign out", ar: "تبديل الحساب / خروج" },
  language: { en: "Language", ar: "اللغة" },
  platformName: { en: "Bassir Corporate Academy Platform", ar: "منصة بشير لأكاديمية الشركات" },

  // Nav groups + items
  "group.Develop": { en: "Develop", ar: "التطوير" },
  "group.Talent": { en: "Talent", ar: "المواهب" },
  "group.Intelligence": { en: "Intelligence", ar: "الذكاء" },
  "group.Company": { en: "Company", ar: "الشركة" },
  "nav.Dashboard": { en: "Dashboard", ar: "لوحة القيادة" },
  "nav.Training Programs": { en: "Training Programs", ar: "البرامج التدريبية" },
  "nav.Competencies": { en: "Competencies", ar: "الجدارات" },
  "nav.Certifications": { en: "Certifications", ar: "الشهادات" },
  "nav.People": { en: "People", ar: "الموظفون" },
  "nav.Leadership & Succession": { en: "Leadership & Succession", ar: "القيادة والإحلال" },
  "nav.Analytics": { en: "Analytics", ar: "التحليلات" },
  "nav.AI Insights": { en: "AI Insights", ar: "رؤى الذكاء الاصطناعي" },
  "nav.Billing & Plan": { en: "Billing & Plan", ar: "الفوترة والباقة" },
  "nav.Settings": { en: "Settings", ar: "الإعدادات" },

  // Dashboard
  "dash.welcome": { en: "Welcome back", ar: "مرحبًا بعودتك" },
  "dash.subtitle": { en: "Here is how your academy is performing.", ar: "إليك أداء أكاديميتك." },
  "dash.employees": { en: "Active employees", ar: "الموظفون النشطون" },
  "dash.readiness": { en: "Avg. readiness", ar: "متوسط الجاهزية" },
  "dash.activeEnrollments": { en: "Active enrollments", ar: "التسجيلات النشطة" },
  "dash.trainingPrograms": { en: "Training programs", ar: "البرامج التدريبية" },
  "dash.completions": { en: "Completions", ar: "حالات الإتمام" },
  "dash.openGaps": { en: "Open skill gaps", ar: "فجوات المهارات" },
  "dash.more": {
    en: "More modules — competency growth, leadership pipelines and AI workforce insights — plug into this dashboard.",
    ar: "وحدات إضافية — نمو الجدارات ومسارات القيادة ورؤى الذكاء الاصطناعي — تتكامل مع هذه اللوحة.",
  },
  "dash.devGlance": { en: "Workforce development at a glance", ar: "تطوير القوى العاملة بلمحة" },
  "dash.covNote": {
    en: "Average competency coverage across the organization — the metric that sets BCAP apart from a course-completion LMS.",
    ar: "متوسط تغطية الجدارات عبر المنشأة — المقياس الذي يميّز BCAP عن أنظمة إدارة التعلم التقليدية.",
  },
  "dash.isoTitle": { en: "Multi-tenant isolation:", ar: "العزل متعدد المؤسسات:" },
  "dash.isoBody": {
    en: "every number above is scoped to this company only, enforced by database Row-Level Security.",
    ar: "كل رقم أعلاه مقصور على هذه الشركة فقط، ومفروض عبر أمان مستوى الصف في قاعدة البيانات.",
  },

  // Login
  "login.title": { en: "Sign in to BCAP", ar: "تسجيل الدخول إلى BCAP" },
  "login.subtitle": { en: "Bassir Corporate Academy Platform", ar: "منصة بشير لأكاديمية الشركات" },
  "login.company": { en: "Company", ar: "الشركة" },
  "login.email": { en: "Email", ar: "البريد الإلكتروني" },
  "login.password": { en: "Password", ar: "كلمة المرور" },
  "login.signIn": { en: "Sign in", ar: "دخول" },
  "login.signingIn": { en: "Signing in…", ar: "جارٍ الدخول…" },
  "login.back": { en: "Back to home", ar: "العودة للرئيسية" },
  "login.sso": { en: "Sign in with company SSO", ar: "الدخول عبر SSO للشركة" },
  "login.err.sso": {
    en: "SSO sign-in failed. Please try again or contact your administrator.",
    ar: "فشل تسجيل الدخول عبر SSO. حاول مجددًا أو تواصل مع المسؤول.",
  },
  "login.err.sso_nouser": {
    en: "No account matches your SSO identity. Ask an administrator to invite you.",
    ar: "لا يوجد حساب مطابق لهويتك عبر SSO. اطلب من المسؤول دعوتك.",
  },
  "login.err.disabled": { en: "Your account is disabled.", ar: "حسابك معطّل." },
  "login.forgot": { en: "Forgot password?", ar: "نسيت كلمة المرور؟" },

  // Forgot password
  "forgot.title": { en: "Reset your password", ar: "إعادة تعيين كلمة المرور" },
  "forgot.subtitle": {
    en: "Enter your company and email and we'll send you a reset link.",
    ar: "أدخل اسم الشركة والبريد الإلكتروني وسنرسل لك رابط إعادة التعيين.",
  },
  "forgot.submit": { en: "Send reset link", ar: "إرسال رابط إعادة التعيين" },
  "forgot.submitting": { en: "Sending…", ar: "جارٍ الإرسال…" },
  "forgot.done": {
    en: "If an account matches those details, we've sent a password reset link. Please check your inbox.",
    ar: "إذا كان هناك حساب مطابق لهذه البيانات، فقد أرسلنا رابط إعادة تعيين كلمة المرور. يرجى مراجعة بريدك.",
  },
  "forgot.backToLogin": { en: "Back to sign in", ar: "العودة لتسجيل الدخول" },

  // Reset password
  "reset.title": { en: "Choose a new password", ar: "اختر كلمة مرور جديدة" },
  "reset.subtitle": {
    en: "Set a new password for your account.",
    ar: "عيّن كلمة مرور جديدة لحسابك.",
  },
  "reset.invalidTitle": { en: "Link unavailable", ar: "الرابط غير متاح" },
  "reset.invalidBody": {
    en: "This reset link is invalid or has expired.",
    ar: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية.",
  },
  "reset.password": { en: "New password", ar: "كلمة المرور الجديدة" },
  "reset.hint": { en: "At least 8 characters.", ar: "٨ أحرف على الأقل." },
  "reset.confirm": { en: "Confirm password", ar: "تأكيد كلمة المرور" },
  "reset.submit": { en: "Reset password & sign in", ar: "إعادة التعيين والدخول" },
  "reset.submitting": { en: "Resetting…", ar: "جارٍ إعادة التعيين…" },
  "reset.requestNew": { en: "Request a new link", ar: "طلب رابط جديد" },

  // Email verification
  "verify.okTitle": { en: "Email confirmed", ar: "تم تأكيد البريد" },
  "verify.okBody": {
    en: "Thanks — your email address is now verified.",
    ar: "شكرًا — تم تأكيد عنوان بريدك الإلكتروني الآن.",
  },
  "verify.badTitle": { en: "Link unavailable", ar: "الرابط غير متاح" },
  "verify.badBody": {
    en: "This confirmation link is invalid or has expired.",
    ar: "رابط التأكيد غير صالح أو منتهي الصلاحية.",
  },
  "verify.continue": { en: "Continue to sign in", ar: "المتابعة لتسجيل الدخول" },

  // Legal
  "legal.terms": { en: "Terms", ar: "الشروط" },
  "legal.privacy": { en: "Privacy", ar: "الخصوصية" },

  // Common
  "common.settings": { en: "Settings", ar: "الإعدادات" },
  "common.readOnly": { en: "Read-only", ar: "للعرض فقط" },
  "common.cancel": { en: "Cancel", ar: "إلغاء" },
  "common.save": { en: "Save", ar: "حفظ" },

  // Levels / statuses / readiness / plans / features (shared labels)
  "level.FOUNDATION": { en: "Foundation", ar: "تأسيسي" },
  "level.INTERMEDIATE": { en: "Intermediate", ar: "متوسط" },
  "level.ADVANCED": { en: "Advanced", ar: "متقدم" },
  "level.LEADERSHIP": { en: "Leadership", ar: "قيادي" },
  "estatus.ENROLLED": { en: "Enrolled", ar: "مُسجّل" },
  "estatus.IN_PROGRESS": { en: "In progress", ar: "قيد التقدم" },
  "estatus.COMPLETED": { en: "Completed", ar: "مكتمل" },
  "readiness.READY_NOW": { en: "Ready now", ar: "جاهز الآن" },
  "readiness.ONE_TO_TWO_YEARS": { en: "1–2 yrs", ar: "1–2 سنة" },
  "readiness.THREE_PLUS_YEARS": { en: "3+ yrs", ar: "3+ سنوات" },
  "plan.STARTER": { en: "Starter", ar: "المبتدئة" },
  "plan.GROWTH": { en: "Growth", ar: "النمو" },
  "plan.ENTERPRISE": { en: "Enterprise", ar: "المؤسسات" },
  "feat.training": { en: "Training programs", ar: "البرامج التدريبية" },
  "feat.competencies": { en: "Competency assessments", ar: "تقييمات الجدارات" },
  "feat.certifications": { en: "Certifications", ar: "الشهادات" },
  "feat.people": { en: "People management", ar: "إدارة الموظفين" },
  "feat.analytics": { en: "Analytics", ar: "التحليلات" },
  "feat.succession": { en: "Leadership & succession", ar: "القيادة والإحلال" },
  "feat.insights": { en: "AI workforce insights", ar: "رؤى الذكاء الاصطناعي للقوى العاملة" },
  "feat.sso": { en: "Single sign-on (SSO)", ar: "الدخول الموحّد (SSO)" },

  // Training
  "training.subtitle": { en: "Build capability through structured, competency-linked programs.", ar: "ابنِ القدرات عبر برامج منظّمة مرتبطة بالجدارات." },
  "training.new": { en: "New program", ar: "برنامج جديد" },
  "training.myLearning": { en: "My learning", ar: "تعلّمي" },
  "training.catalog": { en: "Program catalog", ar: "دليل البرامج" },
  "training.enroll": { en: "Enroll", ar: "سجّل" },
  "training.enrolled": { en: "Enrolled", ar: "مُسجّل" },
  "training.markComplete": { en: "Complete", ar: "إتمام" },
  "training.noEnroll": { en: "You haven't enrolled in any programs yet. Pick one from the catalog below to start growing.", ar: "لم تسجّل في أي برنامج بعد. اختر برنامجًا من الدليل أدناه لتبدأ." },
  "training.noPrograms": { en: "No published programs yet.", ar: "لا توجد برامج منشورة بعد." },
  "training.hours": { en: "h", ar: "س" },
  "training.enrolledCount": { en: "enrolled", ar: "مُسجّل" },

  // Competencies
  "comp.subtitle": { en: "Measure real capability — self, manager and target levels across the competency framework.", ar: "قِس القدرة الحقيقية — مستويات التقييم الذاتي والمدير والهدف عبر إطار الجدارات." },
  "comp.matrix": { en: "Competency matrix", ar: "مصفوفة الجدارات" },
  "comp.gaps": { en: "Organization skill gaps", ar: "فجوات المهارات في المنشأة" },
  "comp.level": { en: "Level", ar: "المستوى" },
  "comp.target": { en: "target", ar: "الهدف" },
  "comp.gap": { en: "gap", ar: "فجوة" },
  "comp.clickCell": { en: "Click any cell to update an employee's manager rating and target.", ar: "انقر على أي خلية لتحديث تقييم المدير والهدف للموظف." },
  "comp.employee": { en: "Employee", ar: "الموظف" },
  "comp.assessTitle": { en: "Assess", ar: "تقييم" },
  "comp.managerLevel": { en: "Manager level (1–5)", ar: "مستوى المدير (1–5)" },
  "comp.targetLevel": { en: "Target level (1–5)", ar: "المستوى المستهدف (1–5)" },
  "comp.self": { en: "Self", ar: "ذاتي" },
  "comp.current": { en: "Current", ar: "الحالي" },
  "comp.saving": { en: "Saving…", ar: "جارٍ الحفظ…" },

  // Certifications
  "cert.subtitle": { en: "Internal certifications from your corporate university — issued, tracked and renewed.", ar: "شهادات داخلية من جامعة شركتك — تُصدر وتُتابع وتُجدَّد." },
  "cert.status.ACTIVE": { en: "Active", ar: "سارية" },
  "cert.status.EXPIRING": { en: "Expiring soon", ar: "قرب الانتهاء" },
  "cert.status.EXPIRED": { en: "Expired", ar: "منتهية" },
  "cert.holders": { en: "holders", ar: "حاصلون" },
  "cert.valid": { en: "valid", ar: "صالحة" },
  "cert.months": { en: "months", ar: "شهرًا" },
  "cert.issue": { en: "Issue", ar: "إصدار" },
  "cert.selectEmp": { en: "Select employee…", ar: "اختر موظفًا…" },
  "cert.allCertified": { en: "All certified", ar: "الجميع معتمد" },

  // People
  "people.subManage": { en: "Add employees, assign roles and manage access.", ar: "أضف موظفين وعيّن الأدوار وأدر الوصول." },
  "people.subView": { en: "Everyone in this company workspace.", ar: "جميع من في مساحة عمل هذه الشركة." },
  "people.add": { en: "Add employee", ar: "إضافة موظف" },
  "people.th.name": { en: "Name", ar: "الاسم" },
  "people.th.email": { en: "Email", ar: "البريد" },
  "people.th.dept": { en: "Department", ar: "القسم" },
  "people.th.role": { en: "Role", ar: "الدور" },
  "people.th.status": { en: "Status", ar: "الحالة" },
  "people.th.actions": { en: "Actions", ar: "إجراءات" },
  "people.st.active": { en: "Active", ar: "نشط" },
  "people.st.invited": { en: "Invited", ar: "مدعو" },
  "people.st.disabled": { en: "Disabled", ar: "معطّل" },
  "people.st.pending": { en: "Pending first login", ar: "بانتظار أول دخول" },
  "people.reset": { en: "Reset password", ar: "إعادة تعيين" },
  "people.enable": { en: "Enable", ar: "تفعيل" },
  "people.disable": { en: "Disable", ar: "تعطيل" },
  // People modals
  "pm.inviteTitle": { en: "Invite employee", ar: "دعوة موظف" },
  "pm.inviteHint": { en: "We'll email them an invitation link to set their own password. You'll also get the link to share.", ar: "سنرسل لهم رابط دعوة لتعيين كلمة المرور. وستحصل أيضًا على الرابط للمشاركة." },
  "pm.firstName": { en: "First name", ar: "الاسم الأول" },
  "pm.lastName": { en: "Last name", ar: "اسم العائلة" },
  "pm.email": { en: "Work email", ar: "البريد الإلكتروني" },
  "pm.jobTitle": { en: "Job title (optional)", ar: "المسمى الوظيفي (اختياري)" },
  "pm.role": { en: "Role", ar: "الدور" },
  "pm.department": { en: "Department", ar: "القسم" },
  "pm.send": { en: "Send invitation", ar: "إرسال الدعوة" },
  "pm.sending": { en: "Sending…", ar: "جارٍ الإرسال…" },
  "pm.cancel": { en: "Cancel", ar: "إلغاء" },
  "pm.inviteCreated": { en: "Invitation created", ar: "تم إنشاء الدعوة" },
  "pm.emailSentTo": { en: "An invitation email was sent to", ar: "تم إرسال بريد دعوة إلى" },
  "pm.shareLink": { en: "Email isn't configured yet — share this link directly with", ar: "البريد غير مُهيّأ بعد — شارك هذا الرابط مباشرةً مع" },
  "pm.inviteLink": { en: "Invitation link", ar: "رابط الدعوة" },
  "pm.linkExpiry": { en: "The link expires in 7 days and can only be used once.", ar: "ينتهي الرابط خلال 7 أيام ويُستخدم مرة واحدة فقط." },
  "pm.copyLink": { en: "Copy link", ar: "نسخ الرابط" },
  "pm.copied": { en: "Copied ✓", ar: "تم النسخ ✓" },
  "pm.copy": { en: "Copy", ar: "نسخ" },
  "pm.done": { en: "Done", ar: "تم" },
  "pm.pwReset": { en: "Password reset", ar: "إعادة تعيين كلمة المرور" },
  "pm.pwResetHint": { en: "Share this temporary password securely. It is shown only once and must be changed at next login.", ar: "شارك كلمة المرور المؤقتة بأمان. تظهر مرة واحدة ويجب تغييرها عند الدخول التالي." },
  "pm.tempPw": { en: "Temporary password", ar: "كلمة مرور مؤقتة" },

  // Succession
  "succ.subtitle": { en: "Identify high-potentials and build succession pipelines for critical roles.", ar: "حدّد أصحاب الإمكانات العالية وابنِ خطط الإحلال للأدوار الحرجة." },
  "succ.nineBox": { en: "9-box talent grid", ar: "شبكة المواهب التساعية" },
  "succ.pipelines": { en: "Succession pipelines", ar: "خطط الإحلال" },
  "succ.performance": { en: "Performance →", ar: "الأداء ←" },
  "succ.potential": { en: "Potential →", ar: "الإمكانات ←" },
  "succ.critical": { en: "Critical role", ar: "دور حرج" },
  "succ.incumbent": { en: "Incumbent", ar: "الشاغل الحالي" },
  "succ.successors": { en: "Successors", ar: "البدلاء" },
  "succ.box.stars": { en: "★ Stars", ar: "★ النجوم" },
  "succ.box.high": { en: "High potential", ar: "إمكانات عالية" },
  "succ.box.core": { en: "Core", ar: "أساسي" },
  "succ.box.needs": { en: "Needs support", ar: "يحتاج دعمًا" },

  // Analytics
  "an.subtitle": { en: "Workforce, learning and readiness analytics for leadership.", ar: "تحليلات القوى العاملة والتعلّم والجاهزية للقيادة." },
  "an.completionRate": { en: "Completion rate", ar: "معدل الإتمام" },
  "an.activeLearners": { en: "Active learners", ar: "المتعلمون النشطون" },
  "an.compliance": { en: "HSE compliance", ar: "الامتثال للسلامة" },
  "an.byLevel": { en: "Enrollments by level", ar: "التسجيلات حسب المستوى" },
  "an.trend": { en: "Active learners — 6 months", ar: "المتعلمون النشطون — 6 أشهر" },
  "an.coverage": { en: "Competency coverage", ar: "تغطية الجدارات" },
  "an.now": { en: "now", ar: "الآن" },

  // Insights
  "ins.subtitle": { en: "Turn development data into decisions — gaps, readiness and recommendations.", ar: "حوّل بيانات التطوير إلى قرارات — فجوات وجاهزية وتوصيات." },
  "ins.priorityGaps": { en: "Priority skill gaps", ar: "فجوات المهارات ذات الأولوية" },
  "ins.roleReadiness": { en: "Role-readiness scoring", ar: "تقييم جاهزية الأدوار" },
  "ins.recommended": { en: "Recommended programs", ar: "برامج موصى بها" },
  "ins.retention": { en: "Retention watch", ar: "مراقبة الاحتفاظ" },
  "ins.closesGap": { en: "Closes the largest gap in", ar: "يسدّ أكبر فجوة في" },
  "ins.recFor": { en: "recommended for", ar: "موصى به لـ" },
  "ins.people": { en: "people", ar: "أشخاص" },
  "ins.noSuccessor": { en: "No ready successor", ar: "لا يوجد بديل جاهز" },
  "risk.High": { en: "High", ar: "مرتفع" },
  "risk.Medium": { en: "Medium", ar: "متوسط" },
  "risk.Low": { en: "Low", ar: "منخفض" },

  // Settings
  "set.subtitle": { en: "Company workspace configuration.", ar: "إعدادات مساحة عمل الشركة." },
  "set.company": { en: "Company", ar: "الشركة" },
  "set.name": { en: "Name", ar: "الاسم" },
  "set.slug": { en: "Workspace slug", ar: "معرّف المساحة" },
  "set.industry": { en: "Industry", ar: "القطاع" },
  "set.plan": { en: "Plan", ar: "الباقة" },
  "set.branding": { en: "Branding", ar: "الهوية" },
  "set.brandingSub": { en: "Make the workspace and emails feel like your company.", ar: "اجعل مساحة العمل والرسائل تعكس هوية شركتك." },
  "set.security": { en: "Account security", ar: "أمان الحساب" },
  "set.securitySub": { en: "Change the password for your account.", ar: "غيّر كلمة مرور حسابك." },
  "set.changePassword": { en: "Change password", ar: "تغيير كلمة المرور" },
  "set.roles": { en: "Roles", ar: "الأدوار" },
  "set.framework": { en: "Competency framework", ar: "إطار الجدارات" },
  "set.sso": { en: "Single sign-on (SSO)", ar: "الدخول الموحّد (SSO)" },
  "set.ssoSub": { en: "Let employees sign in with your company's identity provider (OpenID Connect).", ar: "دع الموظفين يسجّلون الدخول عبر مزوّد هوية شركتك (OpenID Connect)." },
  "set.allPerms": { en: "All permissions", ar: "جميع الصلاحيات" },
  "set.permissions": { en: "permissions", ar: "صلاحيات" },
  "set.members": { en: "member(s)", ar: "عضو" },
  "role.admin": { en: "Administrator", ar: "مسؤول" },
  "role.hr_manager": { en: "HR / L&D Manager", ar: "مدير الموارد البشرية والتطوير" },
  "role.manager": { en: "Line Manager", ar: "مدير مباشر" },
  "role.learner": { en: "Employee", ar: "موظف" },

  // Billing
  "bill.subtitle": { en: "Manage your subscription and seats.", ar: "أدر اشتراكك والمقاعد." },
  "bill.current": { en: "Current plan", ar: "الباقة الحالية" },
  "bill.seatsUsed": { en: "Seats used", ar: "المقاعد المستخدمة" },
  "bill.unlimited": { en: "Unlimited", ar: "غير محدودة" },
  "bill.unlimitedNote": { en: "Unlimited seats on the Enterprise plan.", ar: "مقاعد غير محدودة في باقة المؤسسات." },
  "bill.plans": { en: "Plans", ar: "الباقات" },
  "bill.currentBadge": { en: "Current", ar: "الحالية" },
  "bill.seats": { en: "seats", ar: "مقاعد" },
  "bill.unlimitedSeats": { en: "Unlimited seats", ar: "مقاعد غير محدودة" },
  "bill.upgrade": { en: "Upgrade", ar: "ترقية" },
  "bill.switch": { en: "Switch", ar: "تبديل" },
  "bill.to": { en: "to", ar: "إلى" },
  "bill.footnote": { en: "Plan changes apply immediately. Payment processing is handled by your Bassir Technology account manager.", ar: "تُطبّق تغييرات الباقة فورًا. تُدار المدفوعات عبر مدير حسابك في بشير تكنولوجي." },
  "bill.notIncluded": { en: "isn't included in your plan. Upgrade below to unlock it.", ar: "غير مضمّنة في باقتك. رقِّ الباقة أدناه لتفعيلها." },
  "bill.planNow": { en: "Your plan is now", ar: "باقتك الآن" },
  "bill.manage": { en: "Manage subscription", ar: "إدارة الاشتراك" },
  "bill.checkoutSuccess": { en: "Payment received — your subscription is active.", ar: "تم استلام الدفعة — اشتراكك نشط." },
  "bill.checkoutCancel": { en: "Checkout canceled. Your plan is unchanged.", ar: "تم إلغاء الدفع. لم تتغيّر باقتك." },
  "bill.stripeErr": { en: "Something went wrong with billing. Please try again.", ar: "حدث خطأ في الفوترة. حاول مجددًا." },
};

export function translator(locale: Locale) {
  return (key: string): string => DICT[key]?.[locale] ?? DICT[key]?.en ?? key;
}
