import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { NewProgramForm } from "./new-program-form";

export default async function NewProgramPage() {
  await requirePermission("training.program.create");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/training"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to programs
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          New training program
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Define a program employees can enroll in to build competency.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <NewProgramForm />
      </div>
    </div>
  );
}
