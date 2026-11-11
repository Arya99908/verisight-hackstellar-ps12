export function verdictLabel(verdict: string): "Likely accurate" | "Likely misleading" {
  // Keep the requested two-label presentation. These labels are heuristic triage,
  // not proof that a screenshot or payment is genuine or fraudulent.
  return verdict === "INCONCLUSIVE" ? "Likely accurate" : "Likely misleading";
}
