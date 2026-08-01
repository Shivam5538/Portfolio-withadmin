"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui";
import { motion } from "framer-motion";

import MediaSelectInput from "@/components/admin/MediaSelectInput";
import AdminAccountSecurity from "@/components/admin/AdminAccountSecurity";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  bio: z.string().min(1, "Bio is required"),
  avatarUrl: z.string().optional(),
  resumeUrl: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  stats: z.array(z.object({
    label: z.string().min(1, "Label is required"),
    value: z.string().min(1, "Value is required")
  })),
});

type FormData = z.infer<typeof schema>;

export default function AdminProfileClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const avatarUrl = watch("avatarUrl");
  const resumeUrl = watch("resumeUrl");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "stats"
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          const links = (data.socialLinks as Record<string, string>) ?? {};
          reset({
            name: data.name ?? "",
            tagline: data.tagline ?? "",
            bio: data.bio ?? "",
            avatarUrl: data.avatarUrl ?? "",
            resumeUrl: data.resumeUrl ?? "",
            github: links.github ?? "",
            linkedin: links.linkedin ?? "",
            twitter: links.twitter ?? "",
            whatsapp: links.whatsapp ?? "",
            email: links.email ?? "",
            stats: data.stats && Array.isArray(data.stats) ? data.stats : [],
          });
        }
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    const { github, linkedin, twitter, whatsapp, email: contactEmail, ...rest } = data;
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...rest,
        socialLinks: { github, linkedin, twitter, whatsapp, email: contactEmail },
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 size={24} className="animate-spin text-[#9ca3af]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111111]">Profile</h1>
        <p className="text-[#9ca3af] text-sm mt-1">Edit your public portfolio content</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#374151]">Personal Info</h2>
          <div>
            <Label htmlFor="prof-name">Full Name *</Label>
            <Input id="prof-name" placeholder="Alex Morgan" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="prof-tagline">Tagline *</Label>
            <Input id="prof-tagline" placeholder="Full-Stack Developer & UI Engineer" {...register("tagline")} />
            {errors.tagline && <p className="text-xs text-red-500 mt-1">{errors.tagline.message}</p>}
          </div>
          <div>
            <Label htmlFor="prof-bio">Bio *</Label>
            <Textarea id="prof-bio" rows={5} placeholder="Tell your story..." {...register("bio")} />
            {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>}
          </div>
          <div>
            <MediaSelectInput
              id="prof-avatar"
              label="Avatar Image"
              value={avatarUrl || ""}
              onChange={(url) => setValue("avatarUrl", url)}
              category="Profile"
              accept="image/*"
              placeholder="/uploads/avatar.png"
            />
          </div>
          <div>
            <MediaSelectInput
              id="prof-resume"
              label="Resume Document"
              value={resumeUrl || ""}
              onChange={(url) => setValue("resumeUrl", url)}
              category="Resume"
              accept=".pdf,application/pdf"
              placeholder="/uploads/resume.pdf"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#374151]">Stats (About Me Section)</h2>
            <Button type="button" variant="secondary" size="sm" onClick={() => append({ label: "", value: "" })}>
              <Plus size={14} className="mr-1" /> Add Stat
            </Button>
          </div>
          <p className="text-xs text-[#6b7280]">The first stat is used for the avatar floating badge. The rest appear in the 2x2 grid.</p>
          
          <div className="space-y-3 mt-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-start">
                <div className="flex-1">
                  <Input placeholder="Value (e.g. 5+ Years)" {...register(`stats.${index}.value` as const)} />
                  {errors?.stats?.[index]?.value && <p className="text-xs text-red-500 mt-1">{errors.stats[index]?.value?.message}</p>}
                </div>
                <div className="flex-1">
                  <Input placeholder="Label (e.g. Experience)" {...register(`stats.${index}.label` as const)} />
                  {errors?.stats?.[index]?.label && <p className="text-xs text-red-500 mt-1">{errors.stats[index]?.label?.message}</p>}
                </div>
                <Button type="button" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => remove(index)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            {fields.length === 0 && (
              <div className="text-center p-4 border border-dashed border-[#e5e7eb] rounded-xl text-sm text-[#9ca3af]">
                No stats added yet. Click &quot;Add Stat&quot; to begin.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#374151]">Social Links</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prof-github">GitHub URL</Label>
              <Input id="prof-github" placeholder="https://github.com/..." {...register("github")} />
            </div>
            <div>
              <Label htmlFor="prof-linkedin">LinkedIn URL</Label>
              <Input id="prof-linkedin" placeholder="https://linkedin.com/in/..." {...register("linkedin")} />
            </div>
            <div>
              <Label htmlFor="prof-twitter">Twitter URL</Label>
              <Input id="prof-twitter" placeholder="https://twitter.com/..." {...register("twitter")} />
            </div>
            <div>
              <Label htmlFor="prof-whatsapp">WhatsApp Link / Number</Label>
              <Input id="prof-whatsapp" placeholder="https://wa.me/... or +1234567890" {...register("whatsapp")} />
            </div>
            <div>
              <Label htmlFor="prof-email">Contact Email</Label>
              <Input id="prof-email" type="email" placeholder="alex@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" size="lg" disabled={saving} id="save-profile-btn">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Profile</>}
          </Button>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-green-600 font-medium"
            >
              ✓ Saved!
            </motion.span>
          )}
        </div>
      </form>

      <AdminAccountSecurity />
    </div>
  );
}
