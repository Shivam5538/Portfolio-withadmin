-- =======================================================
-- Supabase Row-Level Security (RLS) Setup Script
-- =======================================================
-- Enforces Row-Level Security across all public tables.
-- Admin requests using service_role bypass RLS automatically.
-- Public requests using anon key are governed by these policies.

-- -------------------------------------------------------
-- 1. PUBLIC READ-ONLY TABLES
-- Allow anon/authenticated SELECT access. No INSERT/UPDATE/DELETE.
-- -------------------------------------------------------

-- Table: Profile
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON "Profile";
CREATE POLICY "Public read access" ON "Profile" FOR SELECT TO anon, authenticated USING (true);

-- Table: Project
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON "Project";
CREATE POLICY "Public read access" ON "Project" FOR SELECT TO anon, authenticated USING (true);

-- Table: Skill
ALTER TABLE "Skill" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON "Skill";
CREATE POLICY "Public read access" ON "Skill" FOR SELECT TO anon, authenticated USING (true);

-- Table: Technology
ALTER TABLE "Technology" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON "Technology";
CREATE POLICY "Public read access" ON "Technology" FOR SELECT TO anon, authenticated USING (true);

-- Table: Experience
ALTER TABLE "Experience" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON "Experience";
CREATE POLICY "Public read access" ON "Experience" FOR SELECT TO anon, authenticated USING (true);

-- Table: SiteContent
ALTER TABLE "SiteContent" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON "SiteContent";
CREATE POLICY "Public read access" ON "SiteContent" FOR SELECT TO anon, authenticated USING (true);

-- Table: LayoutSetting
ALTER TABLE "LayoutSetting" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON "LayoutSetting";
CREATE POLICY "Public read access" ON "LayoutSetting" FOR SELECT TO anon, authenticated USING (true);

-- Table: SlotAssignment
ALTER TABLE "SlotAssignment" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON "SlotAssignment";
CREATE POLICY "Public read access" ON "SlotAssignment" FOR SELECT TO anon, authenticated USING (true);

-- Table: MediaFile
ALTER TABLE "MediaFile" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON "MediaFile";
CREATE POLICY "Public read access" ON "MediaFile" FOR SELECT TO anon, authenticated USING (true);

-- -------------------------------------------------------
-- 2. CONTACT FORM SUBMISSIONS (Message)
-- Allow anon INSERT for submitting messages. No SELECT/UPDATE/DELETE for anon.
-- -------------------------------------------------------

ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can submit messages" ON "Message";
CREATE POLICY "Public can submit messages" ON "Message" FOR INSERT TO anon, authenticated WITH CHECK (true);

-- -------------------------------------------------------
-- 3. SENSITIVE / AUTH TABLES (AdminUser, etc.)
-- Enable RLS with zero policies to deny all anon/authenticated access by default.
-- -------------------------------------------------------

ALTER TABLE "AdminUser" ENABLE ROW LEVEL SECURITY;
-- No SELECT/INSERT/UPDATE/DELETE policies created for AdminUser.
