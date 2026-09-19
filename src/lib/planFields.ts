import type { HealthPlan } from "../../shared/types";
import { formatDate, inr, inrShort, rangeOf, titleCase } from "./format";

export interface FieldDef {
  key: string;
  label: string;
  /** Returns undefined when the API did not supply the value - callers hide or show "Not provided". */
  value: (p: HealthPlan) => string | undefined;
}

/**
 * One list drives the compare table and the detail page, so both only ever show
 * what the provider actually returned.
 */
export const overviewFields: FieldDef[] = [
  { key: "insurer", label: "Insurer", value: (p) => p.insurerName },
  { key: "type", label: "Plan type", value: (p) => (p.planType ? titleCase(p.planType) : undefined) },
  { key: "premium", label: "Illustrative premium", value: (p) => rangeOf(p.premium?.min, p.premium?.max, inr) },
  { key: "assumptions", label: "Premium assumptions", value: (p) => p.premium?.assumptions },
  { key: "renewability", label: "Renewability", value: (p) => p.renewability },
];

export const coverageFields: FieldDef[] = [
  { key: "si-range", label: "Sum insured range", value: (p) => rangeOf(p.sumInsured?.min, p.sumInsured?.max, inrShort) },
  {
    key: "si-options", label: "Sum insured options",
    value: (p) => (p.sumInsured?.options?.length ? p.sumInsured.options.map(inrShort).join(", ") : undefined),
  },
  {
    key: "network", label: "Network hospitals",
    value: (p) => (p.networkHospitals?.count != null ? p.networkHospitals.count.toLocaleString("en-IN") : undefined),
  },
  { key: "network-src", label: "Network data source", value: (p) => p.networkHospitals?.source },
  {
    key: "csr", label: "Claim settlement",
    value: (p) => (p.claimSettlement == null ? undefined : typeof p.claimSettlement === "object" ? JSON.stringify(p.claimSettlement) : String(p.claimSettlement)),
  },
];

export const eligibilityFields: FieldDef[] = [
  { key: "age", label: "Entry age", value: (p) => rangeOf(p.eligibility?.minAge, p.eligibility?.maxAge, (n) => `${n} yrs`) },
  { key: "renew-upto", label: "Renewable up to", value: (p) => (p.eligibility?.renewableUpTo ? titleCase(p.eligibility.renewableUpTo) : undefined) },
];

export const sourceFields: FieldDef[] = [
  { key: "confidence", label: "Data confidence", value: (p) => (p.dataQuality?.confidence ? titleCase(p.dataQuality.confidence) : undefined) },
  { key: "verified", label: "Last verified", value: (p) => formatDate(p.dataQuality?.lastVerified) },
  { key: "premium-verified", label: "Premium verified", value: (p) => (p.premium?.verified == null ? undefined : p.premium.verified ? "Yes" : "No — indicative only") },
];

export const allCompareFields: FieldDef[] = [...overviewFields, ...coverageFields, ...eligibilityFields, ...sourceFields];
