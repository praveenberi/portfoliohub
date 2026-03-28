import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// SQLite stores JSON as strings
const j = (v: unknown) => JSON.stringify(v);

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@showup.com" },
    update: {},
    create: {
      email: "admin@showup.com",
      name: "Admin User",
      username: "admin",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
      profile: { create: {} },
    },
  });
  console.log("Admin created:", admin.email);

  // Create demo user
  const demoPassword = await bcrypt.hash("demo1234!", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@showup.com" },
    update: {},
    create: {
      email: "demo@showup.com",
      name: "Alex Kim",
      username: "alexkim",
      password: demoPassword,
      role: "USER",
      emailVerified: new Date(),
      profile: {
        create: {
          firstName: "Alex",
          lastName: "Kim",
          headline: "Senior Full-Stack Engineer",
          bio: "I build fast, accessible web applications with React and Node.js. Passionate about developer experience and clean architecture.",
          location: "San Francisco, CA",
          githubUrl: "https://github.com/alexkim",
          linkedinUrl: "https://linkedin.com/in/alexkim",
          skills: j(["React", "TypeScript", "Node.js", "Next.js", "PostgreSQL"]),
          technologies: j(["AWS", "Docker", "Redis", "GraphQL"]),
          openToWork: true,
        },
      },
    },
  });
  console.log("Demo user created:", demo.email);

  // Create portfolio templates
  const templates = [
    {
      name: "Midnight Developer",
      slug: "midnight-developer",
      description: "A sleek dark-mode portfolio for software engineers",
      category: "DEVELOPER",
      thumbnailUrl: "https://picsum.photos/seed/dev-dark/800/500",
      config: j({
        theme: "dark",
        primaryColor: "#22c55e",
        fontFamily: "geist",
        layout: "split",
        backgroundColor: "#09090b",
        textColor: "#fafafa",
        borderRadius: "md",
        spacing: "normal",
        animationsEnabled: true,
      }),
    },
    {
      name: "Canvas Designer",
      slug: "canvas-designer",
      description: "A bold, image-forward portfolio for visual designers",
      category: "DESIGNER",
      thumbnailUrl: "https://picsum.photos/seed/designer/800/500",
      config: j({
        theme: "light",
        primaryColor: "#f97316",
        fontFamily: "satoshi",
        layout: "masonry",
        backgroundColor: "#ffffff",
        textColor: "#09090b",
        borderRadius: "lg",
        spacing: "normal",
        animationsEnabled: true,
      }),
    },
    {
      name: "Aperture Photographer",
      slug: "aperture-photographer",
      description: "Full-bleed galleries for photographers",
      category: "PHOTOGRAPHER",
      thumbnailUrl: "https://picsum.photos/seed/photographer/800/500",
      config: j({
        theme: "minimal",
        primaryColor: "#64748b",
        fontFamily: "cabinet",
        layout: "gallery",
        backgroundColor: "#ffffff",
        textColor: "#09090b",
        borderRadius: "sm",
        spacing: "normal",
        animationsEnabled: true,
      }),
    },
    {
      name: "Growth Marketer",
      slug: "growth-marketer",
      description: "Data-driven portfolio for marketing professionals",
      category: "MARKETING",
      thumbnailUrl: "https://picsum.photos/seed/marketing/800/500",
      config: j({
        theme: "light",
        primaryColor: "#8b5cf6",
        fontFamily: "outfit",
        layout: "bento",
        backgroundColor: "#ffffff",
        textColor: "#09090b",
        borderRadius: "md",
        spacing: "normal",
        animationsEnabled: true,
      }),
    },
    {
      name: "Founder Story",
      slug: "founder-story",
      description: "Narrative-driven profile for startup founders",
      category: "FOUNDER",
      thumbnailUrl: "https://picsum.photos/seed/founder/800/500",
      config: j({
        theme: "light",
        primaryColor: "#0ea5e9",
        fontFamily: "geist",
        layout: "editorial",
        backgroundColor: "#ffffff",
        textColor: "#09090b",
        borderRadius: "md",
        spacing: "normal",
        animationsEnabled: true,
      }),
    },
  ];

  let firstTemplateId = "";
  for (const template of templates) {
    const t = await prisma.template.upsert({
      where: { slug: template.slug },
      update: {},
      create: template,
    });
    if (!firstTemplateId) firstTemplateId = t.id;
  }
  console.log(`${templates.length} templates seeded`);

  // Create demo portfolio
  await prisma.portfolio.upsert({
    where: { userId: demo.id },
    update: {},
    create: {
      userId: demo.id,
      templateId: firstTemplateId,
      slug: "alexkim",
      title: "Alex Kim — Portfolio",
      isPublished: true,
      publishedAt: new Date(),
      sections: j([
        { id: "hero", type: "hero", title: "Hero", visible: true, order: 0, content: {} },
        { id: "about", type: "about", title: "About Me", visible: true, order: 1, content: {} },
        { id: "skills", type: "skills", title: "Skills", visible: true, order: 2, content: {} },
        { id: "projects", type: "projects", title: "Projects", visible: true, order: 3, content: {} },
        { id: "experience", type: "experience", title: "Experience", visible: true, order: 4, content: {} },
        { id: "contact", type: "contact", title: "Contact", visible: true, order: 5, content: {} },
      ]),
      config: j({
        primaryColor: "#22c55e",
        backgroundColor: "#ffffff",
        textColor: "#09090b",
        fontFamily: "geist",
        borderRadius: "md",
        spacing: "normal",
        animationsEnabled: true,
      }),
    },
  });

  // Create sample jobs
  const jobs = [
    {
      title: "Senior Frontend Engineer",
      company: "Vercel",
      location: "San Francisco, CA",
      workMode: "REMOTE",
      type: "FULL_TIME",
      skills: j(["React", "TypeScript", "Next.js", "TailwindCSS"]),
      minSalary: 180000,
      maxSalary: 240000,
      description: "Build the next generation of web development tooling. You will work closely with the core team to design and implement features that millions of developers rely on every day.",
      isApproved: true,
      isActive: true,
      isFeatured: true,
    },
    {
      title: "Full-Stack Developer",
      company: "Linear",
      location: "New York, NY",
      workMode: "HYBRID",
      type: "FULL_TIME",
      skills: j(["React", "Node.js", "PostgreSQL", "TypeScript"]),
      minSalary: 150000,
      maxSalary: 200000,
      description: "Join Linear to build beautiful, fast project management tools. You will own entire features from design to deployment.",
      isApproved: true,
      isActive: true,
      isFeatured: true,
    },
    {
      title: "Product Designer",
      company: "Figma",
      location: "Remote",
      workMode: "REMOTE",
      type: "FULL_TIME",
      skills: j(["Figma", "UI/UX", "Prototyping", "Design Systems"]),
      minSalary: 140000,
      maxSalary: 190000,
      description: "Design the future of collaborative design tools. Shape how millions of designers work together.",
      isApproved: true,
      isActive: true,
    },
    {
      title: "Backend Engineer (Go)",
      company: "Stripe",
      location: "Seattle, WA",
      workMode: "HYBRID",
      type: "FULL_TIME",
      skills: j(["Go", "PostgreSQL", "Kubernetes", "gRPC"]),
      minSalary: 170000,
      maxSalary: 230000,
      description: "Power the global financial infrastructure. Work on systems that process billions of dollars in transactions.",
      isApproved: true,
      isActive: true,
    },
    {
      title: "DevOps Engineer",
      company: "Shopify",
      location: "Remote",
      workMode: "REMOTE",
      type: "FULL_TIME",
      skills: j(["Kubernetes", "Terraform", "AWS", "Docker"]),
      minSalary: 130000,
      maxSalary: 180000,
      description: "Scale the infrastructure that powers global commerce. Ensure reliability for millions of merchants.",
      isApproved: true,
      isActive: true,
    },
    {
      title: "React Native Developer",
      company: "Notion",
      location: "Remote",
      workMode: "REMOTE",
      type: "FULL_TIME",
      skills: j(["React Native", "TypeScript", "iOS", "Android"]),
      minSalary: 140000,
      maxSalary: 190000,
      description: "Build the Notion mobile experience used by millions of knowledge workers worldwide.",
      isApproved: true,
      isActive: true,
    },
  ];

  for (const job of jobs) {
    await prisma.job.create({ data: job });
  }
  console.log(`${jobs.length} sample jobs seeded`);

  console.log("\nSeeding complete!");
  console.log("───────────────────────────────");
  console.log("Admin login:  admin@showup.com / admin123!");
  console.log("Demo login:   demo@showup.com  / demo1234!");
  console.log("Demo portfolio: http://localhost:3000/alexkim");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
