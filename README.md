# Shivam Zaware — Portfolio

A modern, full-stack personal portfolio with a secured admin dashboard. Built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and Supabase.

## ✨ Features

- **Public site** — Hero with animated particles, About, Skills, Experience timeline, Projects grid, Contact form
- **Admin dashboard** — Full CRUD for projects, skills, experience, profile, and view contact messages
- **Auth** — NextAuth.js credentials-based login with bcrypt password hashing
- **Database** — PostgreSQL via Supabase/Neon, managed with Prisma ORM
- **Email** — Contact form with Resend API
- **SEO** — Dynamic meta tags, OG tags, sitemap.xml, robots.txt
- **Animations** — Framer Motion scroll-triggered reveals, particle canvas, micro-interactions
- **ISR** — Incremental Static Regeneration (1-hour revalidation) for public pages

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Supabase/Neon) |
| `NEXTAUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your site URL (e.g., `http://localhost:3000`) |
| `RESEND_API_KEY` | Resend API key (optional — form still saves to DB) |
| `CONTACT_EMAIL` | Email that receives contact form submissions |
| `NEXT_PUBLIC_SITE_URL` | Public URL for SEO/sitemap |
| `SUPABASE_URL` | Supabase project URL (for file storage) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for file storage) |
| `NEXT_PUBLIC_GA_ID` | GA4 Measurement ID (optional — analytics) |

### 3. Set up the database

```bash
# Push the Prisma schema to your database
npm run db:push

# Seed with placeholder content
npm run db:seed
```

The seed script creates:
- Admin user: `admin@portfolio.dev` / `admin123!` (⚠️ change this in production!)
- 3 sample projects
- 13 skills across 3 categories
- 3 experience entries
- Placeholder profile

### 4. Start development server

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site.  
Visit `http://localhost:3000/admin` for the admin dashboard.

---

## 🗄️ Database Schema

| Model | Fields |
|---|---|
| `Profile` | name, tagline, bio, avatarUrl, resumeUrl, socialLinks (JSON) |
| `Project` | title, slug, description, longDesc, coverImageUrl, techStack[], liveUrl, githubUrl, challenge, solution, result, featured, order |
| `Skill` | name, category, iconKey, proficiencyLevel, tileSize, order |
| `Technology` | name, category, iconKey |
| `Experience` | role, company, startDate, endDate, description, techTags[], order |
| `Message` | name, email, phone, message, read |
| `AdminUser` | email, passwordHash, passwordResetTokenHash, pendingEmail, emailChangeTokenHash |
| `SiteContent` | All editable copy for Hero, About, Contact, Footer sections |
| `LayoutSetting` | activeTemplateId (Skills layout), activeStatsTemplate |
| `SlotAssignment` | Maps Technology → Skills template slot |
| `MediaFile` | Tracks uploaded files (filename, url, mimeType, size, category) |

---

## 🔐 Admin Dashboard

1. Go to `/admin/login`
2. Login with seeded credentials (or set up your own in `.env.local`)
3. Manage all content from the sidebar

**Important:** Change the default admin password before deploying to production:
```bash
# In the seed script or directly in your DB, update the admin user's passwordHash
```

---

## 🚢 Deploy to Vercel

1. Push your code to GitHub
2. Connect the repo in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Deploy!

Vercel automatically runs `npm run build` which includes Prisma client generation.

---

## 🛠️ Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed with placeholder data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run lint` | Run ESLint |

---

## 🎨 Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js v4 (credentials)
- **Email:** Resend
- **Validation:** Zod + React Hook Form
- **Icons:** Lucide React
- **Deployment:** Vercel
