"use client";

import { useState } from "react";
import { Alert } from "@/lib/networkAlerts";
import { AccountNode, PLATFORM_LABELS } from "@/lib/accountNetworkData";

interface AlertPanelProps {
  alerts: Alert[];
  onSelect: (node: AccountNode) => void;
}

export default function AlertPanel({ alerts, onSelect }: AlertPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Alert aktivitas"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition hover:text-indigo-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
          />
        </svg>
        {alerts.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {alerts.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-30 max-h-96 w-80 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">Alert Aktivitas</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup"
              className="text-neutral-400 transition hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {alerts.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-neutral-400">Tidak ada aktivitas mencurigakan terdeteksi.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {alerts.map((alert) => (
                <li key={alert.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(alert.node);
                      setOpen(false);
                    }}
                    className="flex w-full flex-col gap-0.5 rounded-xl px-2 py-2 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${alert.severity === "high" ? "bg-red-500" : "bg-amber-500"}`}
                      />
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">{alert.reason}</span>
                    </div>
                    <span className="line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">{alert.node.label}</span>
                    <span className="text-[10px] text-neutral-400">
                      {alert.node.platform ? PLATFORM_LABELS[alert.node.platform] : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
