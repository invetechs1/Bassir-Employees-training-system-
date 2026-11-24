import { describe, it, expect } from "vitest";
import { selectReminders, type ReminderCandidate } from "../reminders";

const NOW = new Date("2026-06-15T09:00:00Z");
const days = (n: number) => new Date(NOW.getTime() + n * 24 * 60 * 60 * 1000);

function cand(p: Partial<ReminderCandidate> & { id: string }): ReminderCandidate {
  return {
    userId: "u1",
    dueAt: null,
    status: "ENROLLED",
    reminderSentAt: null,
    ...p,
  };
}

describe("selectReminders", () => {
  it("includes courses due within the window and overdue ones", () => {
    const out = selectReminders(
      [
        cand({ id: "soon", dueAt: days(2) }), // due in 2 days
        cand({ id: "overdue", dueAt: days(-5) }), // overdue
      ],
      NOW,
      { soonDays: 3, cooldownDays: 3 }
    );
    expect(out.map((c) => c.id).sort()).toEqual(["overdue", "soon"]);
  });

  it("excludes courses not yet due (beyond the window)", () => {
    const out = selectReminders([cand({ id: "far", dueAt: days(10) })], NOW, {
      soonDays: 3,
    });
    expect(out).toHaveLength(0);
  });

  it("excludes completed / dropped / no-due-date enrollments", () => {
    const out = selectReminders(
      [
        cand({ id: "done", dueAt: days(1), status: "COMPLETED" }),
        cand({ id: "dropped", dueAt: days(1), status: "DROPPED" }),
        cand({ id: "nodue", dueAt: null }),
      ],
      NOW
    );
    expect(out).toHaveLength(0);
  });

  it("respects the cooldown — does not re-remind too soon", () => {
    const out = selectReminders(
      [
        cand({ id: "recent", dueAt: days(1), reminderSentAt: days(-1) }), // reminded 1d ago
        cand({ id: "stale", dueAt: days(1), reminderSentAt: days(-5) }), // reminded 5d ago
      ],
      NOW,
      { cooldownDays: 3 }
    );
    expect(out.map((c) => c.id)).toEqual(["stale"]);
  });
});
