-- Track when a due-date reminder email was last sent, to throttle reminders.
ALTER TABLE "enrollments" ADD COLUMN "reminderSentAt" TIMESTAMP(3);
