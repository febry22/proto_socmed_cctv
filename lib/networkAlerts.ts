import { AccountNetworkChunk, AccountNode, RISK_LABELS } from "./accountNetworkData";

export type AlertSeverity = "high" | "medium";

export interface Alert {
  id: string;
  node: AccountNode;
  reason: string;
  severity: AlertSeverity;
}

export function computeNetworkAlerts(chunk: AccountNetworkChunk): Alert[] {
  const alerts: Alert[] = [];

  for (const node of chunk.nodes) {
    if (node.type !== "account") continue;
    const risk = node.meta?.activityRisk;
    if (!risk || risk === "normal") continue;

    alerts.push({
      id: `risk-${node.id}`,
      node,
      reason: `${RISK_LABELS[risk]} terdeteksi`,
      severity: risk === "terkoordinasi" ? "high" : "medium",
    });
  }

  return alerts.sort((a, b) => {
    if (a.severity === b.severity) return 0;
    return a.severity === "high" ? -1 : 1;
  });
}
