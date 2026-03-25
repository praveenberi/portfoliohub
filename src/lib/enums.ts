// String-based enum equivalents for SQLite compatibility
// In production with PostgreSQL, these are real Prisma enums

export type UserRole = "USER" | "RECRUITER" | "ADMIN";
export type ApplicationStatus =
  | "APPLIED"
  | "UNDER_REVIEW"
  | "INTERVIEW_SCHEDULED"
  | "TECHNICAL_TEST"
  | "OFFER_RECEIVED"
  | "REJECTED"
  | "WITHDRAWN"
  | "ACCEPTED";
export type WorkMode = "REMOTE" | "HYBRID" | "ON_SITE";
export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "FREELANCE" | "INTERNSHIP";
export type TemplateCategory = "DEVELOPER" | "DESIGNER" | "PHOTOGRAPHER" | "MARKETING" | "FOUNDER" | "GENERAL";
