import Link from "next/link";

const CAPABILITIES = [
  {
    title: "Competency Management",
    body: "Define role-based competency frameworks and measure growth over time — not just course completions.",
  },
  {
    title: "Corporate University",
    body: "Build internal certifications, learning paths and academies tailored to each company.",
  },
  {
    title: "Leadership & Succession",
    body: "Identify high-potential talent and build succession pipelines for critical roles.",
  },
  {
    title: "AI Workforce Insights",
    body: "Turn development data into decisions: skill gaps, readiness and retention risk.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">
              B
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">BCAP</p>
              <p className="text-xs text-slate-500 leading-tight">
                Powered by Bassir Technology
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Sign in
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Bassir Corporate Academy Platform
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Grow your people. Build your future leaders. Transform your workforce.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600">
          A multi-tenant enterprise platform for continuous employee development,
          competency growth, corporate universities and AI-powered talent
          transformation across Saudi Arabia, the GCC and beyond.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700"
          >
            Enter your academy
          </Link>
          <a
            href="#capabilities"
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Explore capabilities
          </a>
        </div>
      </section>

      <section id="capabilities" className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((c) => (
            <div
              key={c.title}
              className="rounded-xl border border-slate-200 p-5"
            >
              <h3 className="font-semibold text-slate-900">{c.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} Bassir Technology. All rights reserved.
          </span>
          <nav className="flex gap-4">
            <Link href="/legal/terms" className="hover:text-slate-700">
              Terms of Service
            </Link>
            <Link href="/legal/privacy" className="hover:text-slate-700">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
