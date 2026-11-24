-- Assigned-training deadlines + enrollment source marker.
-- dueAt: optional deadline (null = self-paced). assignedVia: how the enrollment
-- was created ("self" / "department" / "position" / "manager" / "teacher-agent").
ALTER TABLE "enrollments" ADD COLUMN "dueAt" TIMESTAMP(3);
ALTER TABLE "enrollments" ADD COLUMN "assignedVia" TEXT;
