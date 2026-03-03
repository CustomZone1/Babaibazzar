"use client";

import { useSettings } from "@/lib/settings";

export default function OrderTimeline({ status }: { status: string }) {
  const { lang } = useSettings();
  const hi = lang === "hi";

  const steps = [
    { key: "PLACED", label: hi ? "प्लेस्ड" : "Placed" },
    { key: "CONFIRMED", label: hi ? "कन्फर्म्ड" : "Confirmed" },
    { key: "PACKING", label: hi ? "पैकिंग" : "Packing" },
    { key: "OUT_FOR_DELIVERY", label: hi ? "डिलीवरी पर" : "Out for delivery" },
    { key: "DELIVERED", label: hi ? "डिलीवर्ड" : "Delivered" },
  ];

  const isCancelled = status === "CANCELLED";
  const currentIndex = Math.max(0, steps.findIndex((s) => s.key === status));

  if (isCancelled) {
    return (
      <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {hi ? "यह ऑर्डर कैंसिल हो गया है।" : "This order was cancelled."}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border p-4">
      <div className="mb-3 font-medium">{hi ? "ट्रैकिंग" : "Tracking"}</div>

      <div className="flex flex-wrap items-center gap-2">
        {steps.map((s, i) => {
          const done = i <= currentIndex;
          return (
            <div key={s.key} className="flex min-w-[120px] flex-1 items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full border ${
                  done ? "border-green-500 bg-green-500" : "border-neutral-300 bg-white"
                }`}
              />
              <div className={`text-xs ${done ? "text-green-700" : "text-neutral-500"}`}>{s.label}</div>

              {i !== steps.length - 1 ? (
                <div className={`h-[2px] flex-1 ${done ? "bg-green-500" : "bg-neutral-200"}`} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
