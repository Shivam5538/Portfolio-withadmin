import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const hashedPassword = await bcrypt.hash("admin123!", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@portfolio.dev" },
    update: {},
    create: {
      email: "admin@portfolio.dev",
      passwordHash: hashedPassword,
    },
  });
  console.log("✅ Admin user created (admin@portfolio.dev / admin123!)");

  // Profile
  const profileCount = await prisma.profile.count();
  if (profileCount === 0) {
    await prisma.profile.create({
      data: {
        id: "profile-main",
        name: "Alex Morgan",
        tagline: "Full-Stack Developer & UI Engineer",
        bio: "I'm a passionate full-stack developer who loves crafting clean, performant, and beautiful digital experiences. With 5+ years of experience, I specialize in building scalable web applications using modern technologies. When I'm not coding, I'm exploring new design patterns and contributing to open-source projects.",
        avatarUrl: null,
        resumeUrl: null,
        socialLinks: JSON.stringify({
          github: "https://github.com",
          linkedin: "https://linkedin.com",
          twitter: "https://twitter.com",
          email: "alex@portfolio.dev",
        }),
        stats: JSON.stringify([
          { label: "Experience", value: "5+ Years" },
          { label: "Projects Delivered", value: "50+" },
          { label: "Happy Clients", value: "30+" },
          { label: "Open Source Contributions", value: "100+" },
          { label: "Coffee Consumed", value: "∞" }
        ]),
      },
    });
    console.log("✅ Profile created");
  }

  // Skills
  const skillsCount = await prisma.skill.count();
  if (skillsCount === 0) {
    const skillsData = [
      // Frontend
      { name: "React", category: "Frontend", proficiencyLevel: 95, order: 1 },
      { name: "Next.js", category: "Frontend", proficiencyLevel: 90, order: 2 },
      { name: "TypeScript", category: "Frontend", proficiencyLevel: 88, order: 3 },
      { name: "Tailwind CSS", category: "Frontend", proficiencyLevel: 92, order: 4 },
      { name: "Framer Motion", category: "Frontend", proficiencyLevel: 80, order: 5 },
      // Backend
      { name: "Node.js", category: "Backend", proficiencyLevel: 85, order: 6 },
      { name: "SQLite", category: "Backend", proficiencyLevel: 82, order: 7 },
      { name: "Prisma", category: "Backend", proficiencyLevel: 88, order: 8 },
      { name: "REST APIs", category: "Backend", proficiencyLevel: 90, order: 9 },
      // Tools
      { name: "Git", category: "Tools", proficiencyLevel: 92, order: 10 },
      { name: "Docker", category: "Tools", proficiencyLevel: 75, order: 11 },
      { name: "Vercel", category: "Tools", proficiencyLevel: 90, order: 12 },
      { name: "Figma", category: "Tools", proficiencyLevel: 78, order: 13 },
    ];

    for (const skill of skillsData) {
      await prisma.skill.create({ data: skill });
    }
    console.log("✅ Skills created");
  }

  // Experience
  const expCount = await prisma.experience.count();
  if (expCount === 0) {
    await prisma.experience.createMany({
      data: [
        {
          role: "Senior Full-Stack Developer",
          company: "TechCorp Solutions",
          startDate: new Date("2022-01-01"),
          endDate: null,
          description:
            "Led development of the company's flagship SaaS platform, architecting microservices and improving performance by 40%. Collaborated with design and product teams to deliver pixel-perfect user experiences.",
          techTags: JSON.stringify(["React", "Node.js", "PostgreSQL", "AWS", "Docker"]),
          order: 1,
        },
        {
          role: "Frontend Developer",
          company: "Creative Digital Agency",
          startDate: new Date("2019-06-01"),
          endDate: new Date("2021-12-31"),
          description:
            "Built interactive web experiences for 20+ clients across e-commerce, fintech, and media industries. Introduced component-driven design systems that reduced development time by 30%.",
          techTags: JSON.stringify(["React", "TypeScript", "GraphQL", "Sass", "Figma"]),
          order: 2,
        },
        {
          role: "Junior Web Developer",
          company: "StartupHub",
          startDate: new Date("2018-03-01"),
          endDate: new Date("2019-05-31"),
          description:
            "Developed and maintained multiple client-facing web applications. Gained deep experience in responsive design and modern JavaScript frameworks.",
          techTags: JSON.stringify(["JavaScript", "HTML/CSS", "Vue.js", "PHP", "MySQL"]),
          order: 3,
        },
      ],
    });
    console.log("✅ Experience created");
  }

  // Projects
  const projCount = await prisma.project.count();
  if (projCount === 0) {
    const projects = [
      {
        title: "SaaS Analytics Dashboard",
        slug: "saas-analytics-dashboard",
        description:
          "A real-time analytics platform for B2B SaaS companies with custom chart builder, cohort analysis, and team collaboration features.",
        longDesc:
          "This platform processes millions of events daily and presents them in an intuitive, customizable dashboard. Built with a focus on performance and developer experience, it includes a drag-and-drop chart builder, automated reporting, and Slack/email integrations. The backend uses event sourcing for reliable data processing and ClickHouse for analytical queries.",
        techStack: JSON.stringify(["Next.js", "TypeScript", "PostgreSQL", "ClickHouse", "Redis", "Tailwind CSS"]),
        liveUrl: "https://example.com",
        githubUrl: "https://github.com",
        featured: true,
        order: 1,
      },
      {
        title: "E-Commerce Platform",
        slug: "ecommerce-platform",
        description:
          "A full-featured e-commerce solution with multi-vendor support, real-time inventory, AI-powered recommendations, and Stripe payments.",
        longDesc:
          "A production-ready e-commerce platform supporting multiple vendors with individual storefronts. Features include AI product recommendations, real-time inventory management, comprehensive admin panels for vendors, and seamless Stripe payment processing. Achieved 99.9% uptime and processed over $2M in transactions.",
        techStack: JSON.stringify(["React", "Node.js", "MongoDB", "Stripe", "Redis", "Docker"]),
        liveUrl: "https://example.com",
        githubUrl: "https://github.com",
        featured: true,
        order: 2,
      },
      {
        title: "Developer Collaboration Tool",
        slug: "developer-collab-tool",
        description:
          "A real-time code collaboration platform with live pair-programming sessions, integrated code review, and project management features.",
        longDesc:
          "Inspired by the need for better remote collaboration tools, this platform enables developers to code together in real-time with WebSocket-powered synchronization. Features include video chat, code annotation, pull request workflows, and integration with GitHub and GitLab. Used by 500+ developers across 50 companies.",
        techStack: JSON.stringify(["React", "WebSockets", "Node.js", "PostgreSQL", "WebRTC", "TypeScript"]),
        liveUrl: "https://example.com",
        githubUrl: "https://github.com",
        featured: false,
        order: 3,
      },
    ];

    for (const project of projects) {
      await prisma.project.create({ data: project });
    }
    console.log("✅ Projects created");
  }

  console.log("\n🎉 Seeding complete!");
  console.log("   Admin: admin@portfolio.dev / admin123!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
