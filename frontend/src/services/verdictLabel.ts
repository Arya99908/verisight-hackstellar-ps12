export function verdictLabel(verdict: string): "Likely accurate" | "Likely misleading" {
  // The API's verdicts are evidence states, not calibrated probabilities.
  // Keep the two-label presentation requested by the user: any detected
  // review/anomaly state maps to the cautious warning label.
  return verdict === "INCONCLUSIVE" ? "Likely accurate" : "Likely misleading";
}
