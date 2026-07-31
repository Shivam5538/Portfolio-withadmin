export interface SlotDefinition {
  slotId: string;
  label: string;
  colSpan: number; // 1 or 2
  rowSpan: number; // 1 or 2
  defaultTechName?: string;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  thumbnailClass: string;
  slots: SlotDefinition[];
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: "template_1",
    name: "Hero Left Mosaic",
    description: "Featured 2x2 hero tile on top-left, surrounded by 2x1, 1x2, and 1x1 tiles.",
    thumbnailClass: "from-blue-500 to-indigo-600",
    slots: [
      { slotId: "slot-1", label: "Slot 1 (Hero 2x2)", colSpan: 2, rowSpan: 2, defaultTechName: "React" },
      { slotId: "slot-2", label: "Slot 2 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Next.js" },
      { slotId: "slot-3", label: "Slot 3 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "TypeScript" },
      { slotId: "slot-4", label: "Slot 4 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Tailwind CSS" },
      { slotId: "slot-5", label: "Slot 5 (Tall 1x2)", colSpan: 1, rowSpan: 2, defaultTechName: "Node.js" },
      { slotId: "slot-6", label: "Slot 6 (Tall 1x2)", colSpan: 1, rowSpan: 2, defaultTechName: "Docker" },
      { slotId: "slot-7", label: "Slot 7 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "Figma" },
      { slotId: "slot-8", label: "Slot 8 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Prisma" },
      { slotId: "slot-9", label: "Slot 9 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "PostgreSQL" },
      { slotId: "slot-10", label: "Slot 10 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Git" },
      { slotId: "slot-11", label: "Slot 11 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "MongoDB" },
      { slotId: "slot-12", label: "Slot 12 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "JavaScript" },
      { slotId: "slot-13", label: "Slot 13 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "GraphQL" },
    ],
  },
  {
    id: "template_2",
    name: "Hero Center Showcase",
    description: "Centered 2x2 featured centerpiece surrounded symmetrically by wide and tall tiles.",
    thumbnailClass: "from-purple-500 to-pink-600",
    slots: [
      { slotId: "slot-1", label: "Slot 1 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Next.js" },
      { slotId: "slot-2", label: "Slot 2 (Hero 2x2)", colSpan: 2, rowSpan: 2, defaultTechName: "React" },
      { slotId: "slot-3", label: "Slot 3 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "TypeScript" },
      { slotId: "slot-4", label: "Slot 4 (Tall 1x2)", colSpan: 1, rowSpan: 2, defaultTechName: "Node.js" },
      { slotId: "slot-5", label: "Slot 5 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Tailwind CSS" },
      { slotId: "slot-6", label: "Slot 6 (Tall 1x2)", colSpan: 1, rowSpan: 2, defaultTechName: "Docker" },
      { slotId: "slot-7", label: "Slot 7 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Prisma" },
      { slotId: "slot-8", label: "Slot 8 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "PostgreSQL" },
      { slotId: "slot-9", label: "Slot 9 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "Figma" },
      { slotId: "slot-10", label: "Slot 10 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Git" },
      { slotId: "slot-11", label: "Slot 11 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "MongoDB" },
      { slotId: "slot-12", label: "Slot 12 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "GraphQL" },
    ],
  },
  {
    id: "template_3",
    name: "Dual Hero Split",
    description: "Two prominent 2x2 hero tiles balancing the left and right halves of the section.",
    thumbnailClass: "from-amber-500 to-orange-600",
    slots: [
      { slotId: "slot-1", label: "Slot 1 (Hero Left 2x2)", colSpan: 2, rowSpan: 2, defaultTechName: "React" },
      { slotId: "slot-2", label: "Slot 2 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Next.js" },
      { slotId: "slot-3", label: "Slot 3 (Hero Right 2x2)", colSpan: 2, rowSpan: 2, defaultTechName: "TypeScript" },
      { slotId: "slot-4", label: "Slot 4 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Tailwind CSS" },
      { slotId: "slot-5", label: "Slot 5 (Tall 1x2)", colSpan: 1, rowSpan: 2, defaultTechName: "Node.js" },
      { slotId: "slot-6", label: "Slot 6 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Prisma" },
      { slotId: "slot-7", label: "Slot 7 (Tall 1x2)", colSpan: 1, rowSpan: 2, defaultTechName: "Docker" },
      { slotId: "slot-8", label: "Slot 8 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "Figma" },
      { slotId: "slot-9", label: "Slot 9 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "PostgreSQL" },
      { slotId: "slot-10", label: "Slot 10 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Git" },
      { slotId: "slot-11", label: "Slot 11 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "MongoDB" },
      { slotId: "slot-12", label: "Slot 12 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "GraphQL" },
    ],
  },
  {
    id: "template_4",
    name: "Four Corners Mosaic",
    description: "Featured tiles placed at opposite corners with central 1x1 & 2x1 accent slots.",
    thumbnailClass: "from-emerald-500 to-teal-600",
    slots: [
      { slotId: "slot-1", label: "Slot 1 (Hero Top-Left 2x2)", colSpan: 2, rowSpan: 2, defaultTechName: "React" },
      { slotId: "slot-2", label: "Slot 2 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Next.js" },
      { slotId: "slot-3", label: "Slot 3 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "TypeScript" },
      { slotId: "slot-4", label: "Slot 4 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Tailwind CSS" },
      { slotId: "slot-5", label: "Slot 5 (Hero Bottom-Right 2x2)", colSpan: 2, rowSpan: 2, defaultTechName: "Node.js" },
      { slotId: "slot-6", label: "Slot 6 (Tall 1x2)", colSpan: 1, rowSpan: 2, defaultTechName: "Docker" },
      { slotId: "slot-7", label: "Slot 7 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "Figma" },
      { slotId: "slot-8", label: "Slot 8 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Prisma" },
      { slotId: "slot-9", label: "Slot 9 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "PostgreSQL" },
      { slotId: "slot-10", label: "Slot 10 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Git" },
      { slotId: "slot-11", label: "Slot 11 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "MongoDB" },
    ],
  },
  {
    id: "template_5",
    name: "App Launcher Compact",
    description: "Tightly packed 6-column mobile-app style layout with balanced wide and square cells.",
    thumbnailClass: "from-cyan-500 to-blue-600",
    slots: [
      { slotId: "slot-1", label: "Slot 1 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "React" },
      { slotId: "slot-2", label: "Slot 2 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Next.js" },
      { slotId: "slot-3", label: "Slot 3 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "TypeScript" },
      { slotId: "slot-4", label: "Slot 4 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Tailwind CSS" },
      { slotId: "slot-5", label: "Slot 5 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "Figma" },
      { slotId: "slot-6", label: "Slot 6 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "PostgreSQL" },
      { slotId: "slot-7", label: "Slot 7 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Node.js" },
      { slotId: "slot-8", label: "Slot 8 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Docker" },
      { slotId: "slot-9", label: "Slot 9 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "MongoDB" },
      { slotId: "slot-10", label: "Slot 10 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "Git" },
      { slotId: "slot-11", label: "Slot 11 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Prisma" },
      { slotId: "slot-12", label: "Slot 12 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "GraphQL" },
    ],
  },
  {
    id: "template_6",
    name: "Modern Bento Stream",
    description: "High-impact layout with large hero centerpiece and vertical side pillars.",
    thumbnailClass: "from-rose-500 to-red-600",
    slots: [
      { slotId: "slot-1", label: "Slot 1 (Tall 1x2)", colSpan: 1, rowSpan: 2, defaultTechName: "TypeScript" },
      { slotId: "slot-2", label: "Slot 2 (Hero Center 2x2)", colSpan: 2, rowSpan: 2, defaultTechName: "React" },
      { slotId: "slot-3", label: "Slot 3 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Next.js" },
      { slotId: "slot-4", label: "Slot 4 (Tall 1x2)", colSpan: 1, rowSpan: 2, defaultTechName: "Docker" },
      { slotId: "slot-5", label: "Slot 5 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Tailwind CSS" },
      { slotId: "slot-6", label: "Slot 6 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Node.js" },
      { slotId: "slot-7", label: "Slot 7 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "PostgreSQL" },
      { slotId: "slot-8", label: "Slot 8 (Small 1x1)", colSpan: 1, rowSpan: 1, defaultTechName: "Figma" },
      { slotId: "slot-9", label: "Slot 9 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Prisma" },
      { slotId: "slot-10", label: "Slot 10 (Wide 2x1)", colSpan: 2, rowSpan: 1, defaultTechName: "Git" },
    ],
  },
];

export function getTemplateById(id: string): LayoutTemplate {
  return LAYOUT_TEMPLATES.find((t) => t.id === id) || LAYOUT_TEMPLATES[0];
}
