import type {
  User,
  Profile,
  Portfolio,
  Template,
  Job,
  Application,
  Experience,
  Education,
  Project,
  ApplicationTimeline,
} from "@prisma/client";

export type UserWithProfile = User & {
  profile: Profile | null;
};

export type PortfolioWithTemplate = Portfolio & {
  template: Template | null;
  user: Pick<User, "id" | "name" | "username" | "email">;
};

export type JobWithDetails = Job & {
  _count: { applications: number };
};

export type ApplicationWithJob = Application & {
  job: Job;
  timeline: ApplicationTimeline[];
};

export type ProfileWithRelations = Profile & {
  experiences: Experience[];
  education: Education[];
  projects: Project[];
};

// Portfolio section types
export interface SectionConfig {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  order: number;
  content: Record<string, unknown>;
  styles?: Record<string, string>;
}

export type SectionType =
  | "hero"
  | "about"
  | "skills"
  | "projects"
  | "experience"
  | "education"
  | "certifications"
  | "extras"
  | "testimonials"
  | "contact"
  | "social"
  | "blog"
  | "gallery"
  | "metrics"
  | "custom";

export type BackgroundStyle = "solid" | "grid" | "dots" | "aurora" | "meteors" | "image";

export interface HeroContent {
  mediaType?: "image" | "video" | "none";
  mediaUrl?: string;
  mediaMode?: "background" | "featured"; // bg covers section, featured shows beside text
  overlayOpacity?: number; // 0-80, percentage
  /** Overrides profile.headline for this portfolio when set. */
  headlineOverride?: string;
}

export interface PortfolioConfig {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  spacing: string;
  animationsEnabled: boolean;
  backgroundStyle?: BackgroundStyle;
  backgroundImageUrl?: string;
  backgroundImageOverlay?: number;
  fontSize?: "sm" | "md" | "lg" | "xl";
  secondaryTextColor?: string;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Job search filters
export interface JobFilters {
  search?: string;
  location?: string;
  workMode?: string[];
  type?: string[];
  skills?: string[];
  minSalary?: number;
  maxSalary?: number;
  page?: number;
  limit?: number;
}

// Dashboard stats
export interface DashboardStats {
  totalApplications: number;
  portfolioViews: number;
  savedJobs: number;
  activeApplications: number;
  interviewsScheduled: number;
  offersReceived: number;
  applicationsByStatus: Record<string, number>;
  recentActivity: Array<{
    type: string;
    description: string;
    date: Date;
  }>;
}
