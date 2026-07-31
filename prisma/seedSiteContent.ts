export {};

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing SiteContent to force fresh seed with new schema fields
  await prisma.siteContent.deleteMany();
  console.log("Cleared existing SiteContent.");

  const siteContent = await prisma.siteContent.create({
    data: {
      availabilityStatus: "Available for new opportunities",
      isAvailable: true,
      heroGreeting: "Hi, I'm",
      heroName: "Alex Morgan",
      heroHeadlineLine1: "I build",
      heroHeadlineLine2: "digital experiences.",
      heroSubtext: "Full-stack developer passionate about crafting clean, performant, and beautiful web applications. Turning complex problems into elegant solutions.",
      resumeUrl: "#",
      primaryCtaLabel: "View My Work",
      primaryCtaLink: "#projects",
      secondaryCtaLabel: "Get in Touch",
      secondaryCtaLink: "#contact",
      
      aboutEyebrow: "ABOUT ME",
      aboutHeadlineLine1: "Driven by curiosity,",
      aboutHeadlineLine2: "built for performance.",
      aboutBio: "I'm a passionate full-stack developer who loves crafting clean, performant, and beautiful digital experiences.",
      aboutLocation: "Pune, India",
      aboutFocus: "Full-Stack Apps",
      aboutAvatarBadge: "Full-Stack Developer",
      aboutFacts: JSON.stringify([
        { id: "1", label: "Location", value: "Pune, India", iconKey: "MapPin", accentColor: "blue" },
        { id: "2", label: "Focus", value: "Full-Stack Apps", iconKey: "Sparkles", accentColor: "purple" },
        { id: "3", label: "Experience", value: "5+ Years", iconKey: "Award", accentColor: "coral" },
        { id: "4", label: "Open Source", value: "100+ Contributions", iconKey: "Terminal", accentColor: "emerald" }
      ]),
      coreTechs: JSON.stringify([
        "React", "Next.js", "TypeScript", "Node.js", "Tailwind CSS", "PostgreSQL", "Figma", "Docker", "GraphQL", "Prisma"
      ]),
      funFactTitle: "Beyond code",
      funFactDesc: "Avid rock climber & specialty coffee enthusiast.",
      resumeCardLabel: "Resume",
      resumeCardSubtext: "View my full experience",
      
      stats: JSON.stringify([
        { label: "Projects Delivered", value: "50+" },
        { label: "Happy Clients", value: "30+" },
        { label: "Contributions", value: "100+" }
      ]),

      githubUrl: "https://github.com",
      linkedinUrl: "https://linkedin.com",
      twitterUrl: "https://twitter.com",
      email: "alex@portfolio.dev",
      footerText: "Alex Morgan"
    }
  });

  console.log("Created SiteContent:", siteContent.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
