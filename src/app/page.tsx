export const dynamic = "force-dynamic";

import { LandingNav } from "@/components/landing/nav";
import { HeroSection } from "@/components/landing/hero";
import { FeaturesSection } from "@/components/landing/features";
import { TemplatesSection } from "@/components/landing/templates";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { CtaSection } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { prisma } from "@/lib/db";

export default async function LandingPage() {
  const [templateCount, userCount, jobCount] = await Promise.all([
    prisma.template.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.job.count({ where: { isApproved: true, isActive: true } }),
  ]).catch(() => [5, 2400, 847]);

  return (
    <main className="min-h-[100dvh] bg-zinc-50">
      <LandingNav />
      <HeroSection stats={{ templates: templateCount, users: userCount, jobs: jobCount }} />
      <FeaturesSection />
      <HowItWorksSection />
      <TemplatesSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
