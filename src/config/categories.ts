import { Car, HeartPulse, Plane, Umbrella, type LucideIcon } from "lucide-react";
import type { InsuranceCategory } from "../../shared/types";

export interface CategoryConfig {
  slug: InsuranceCategory;
  /** Nav / tile label */
  label: string;
  /** Results page heading */
  title: string;
  icon: LucideIcon;
  blurb: string;
  searchIntro: string;
  /** Which requirement fields the search form shows (only ones that make sense for this product). */
  form: {
    ageLabel: string;
    members: boolean;
    city: boolean;
    coverage?: { label: string; currency: string; choices: number[]; default: number };
    renewal?: { legend: string; new: string; existing: string };
  };
  /** Landing-page hero copy for this category (only lists things the data source actually provides). */
  hero: { eyebrow: string; title: string; subtitle: string; cta: string; highlights: string[] };
  defaultAge: number;
  coverFilterLabel: string;
  /** Shown under the results count. */
  note?: string;
}

export const categories: CategoryConfig[] = [
  {
    slug: "health", label: "Health", title: "Health Insurance Plans", icon: HeartPulse,
    blurb: "Compare hospital cover, sum insured and network size.",
    searchIntro: "Answer a few questions and we’ll narrow down the plans that fit.",
    form: {
      ageLabel: "Age of eldest member", members: true, city: true,
      coverage: { label: "Desired coverage amount", currency: "INR", choices: [300000, 500000, 1000000, 1500000, 2000000, 2500000, 5000000, 10000000], default: 1000000 },
      renewal: { legend: "Policy status", new: "Buying a new policy", existing: "I have an existing policy / renewal" },
    },
    hero: {
      eyebrow: "Health insurance marketplace", title: "Compare Health Insurance Plans",
      subtitle: "Explore health insurance plans from multiple insurers in one place.", cta: "Compare Health Plans",
      highlights: ["Illustrative premium range", "Sum insured options", "Network hospitals", "Entry age & renewability", "Plan highlights"],
    },
    defaultAge: 30, coverFilterLabel: "Sum insured offered",
  },
  {
    slug: "term-life", label: "Term life", title: "Term Life Insurance Plans", icon: Umbrella,
    blurb: "Protect your family with pure-term life cover.",
    searchIntro: "Tell us your age and the cover you want to protect your family with.",
    form: {
      ageLabel: "Your age", members: false, city: true,
      coverage: { label: "Desired life cover", currency: "INR", choices: [2500000, 5000000, 10000000, 20000000, 50000000], default: 10000000 },
    },
    hero: {
      eyebrow: "Term life insurance", title: "Compare Term Life Insurance Plans",
      subtitle: "Protect your family with pure-term life cover from multiple insurers.", cta: "Compare Term Life Plans",
      highlights: ["Illustrative premium range", "Life cover options", "Entry age & renewability", "Plan highlights"],
    },
    defaultAge: 30, coverFilterLabel: "Life cover offered",
  },
  {
    slug: "motor", label: "Motor", title: "Motor Insurance Plans", icon: Car,
    blurb: "Compare comprehensive car insurance from leading insurers.",
    searchIntro: "Tell us a little about you. The catalogue does not include vehicle-specific pricing.",
    form: {
      ageLabel: "Age of primary driver", members: false, city: true,
      renewal: { legend: "Policy status", new: "New vehicle / new policy", existing: "Renewing an existing policy" },
    },
    hero: {
      eyebrow: "Motor insurance", title: "Compare Motor Insurance Plans",
      subtitle: "Compare comprehensive car insurance from leading insurers in one place.", cta: "Compare Motor Plans",
      highlights: ["Illustrative premium range", "Entry age & renewability", "Plan highlights"],
    },
    defaultAge: 30, coverFilterLabel: "Cover offered",
    note: "The data source lists no fixed cover amount for motor plans, so cover-based filters and sorting are unavailable.",
  },
  {
    slug: "travel", label: "Travel", title: "Travel Insurance Plans", icon: Plane,
    blurb: "International travel cover, with medical cover shown in USD.",
    searchIntro: "Tell us who is travelling and the medical cover you would like.",
    form: {
      ageLabel: "Age of eldest traveller", members: false, city: false,
      coverage: { label: "Desired medical cover", currency: "USD", choices: [50000, 100000, 250000, 500000], default: 100000 },
    },
    hero: {
      eyebrow: "Travel insurance", title: "Compare Travel Insurance Plans",
      subtitle: "Explore international travel insurance from multiple insurers, with medical cover shown in USD.", cta: "Compare Travel Plans",
      highlights: ["Illustrative premium range", "Medical cover options (USD)", "Entry age & renewability", "Plan highlights"],
    },
    defaultAge: 30, coverFilterLabel: "Cover offered (USD)",
    note: "Cover amounts are in US dollars, as supplied by the data source.",
  },
];

export const categoryBySlug = (slug: string | undefined) => categories.find((c) => c.slug === slug);
