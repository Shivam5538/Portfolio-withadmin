export interface StatsTemplateDefinition {
  id: string;
  name: string;
  badge: string;
  description: string;
  iconName: string;
}

export const STATS_TEMPLATES: StatsTemplateDefinition[] = [
  {
    id: "template_1",
    name: "Divided Strip",
    badge: "Minimalist",
    description: "Horizontal row of clean numbers separated by thin vertical dividers. No card backgrounds.",
    iconName: "Split",
  },
  {
    id: "template_2",
    name: "Glass Card Grid",
    badge: "Modern Glass",
    description: "Auto-fit grid of translucent glass cards with accent icon badges and subtle hover lift.",
    iconName: "LayoutGrid",
  },
  {
    id: "template_3",
    name: "Hero Numbers",
    badge: "Asymmetric Focus",
    description: "2 prominent hero count-up numbers with bold gradient typography on top, compact cards below.",
    iconName: "Flame",
  },
  {
    id: "template_4",
    name: "Bento Mixed Grid",
    badge: "Bento Box",
    description: "Featured stats occupy 2-column wide tiles with radial background glows, secondary stats stay compact.",
    iconName: "Box",
  },
  {
    id: "template_5",
    name: "Radial Arc",
    badge: "Constellation",
    description: "Curved arc arrangement with connecting radial lines and central glowing stat badge.",
    iconName: "Compass",
  },
  {
    id: "template_6",
    name: "Infinite Marquee",
    badge: "Dynamic Scroll",
    description: "Continuous auto-scrolling horizontal marquee of stat cards that pauses smoothly on hover.",
    iconName: "MoveRight",
  },
];

export function getStatsTemplateById(id: string): StatsTemplateDefinition {
  return STATS_TEMPLATES.find((t) => t.id === id) || STATS_TEMPLATES[0];
}
