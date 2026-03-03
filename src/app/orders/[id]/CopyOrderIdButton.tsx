"use client";

import React from "react";

export default function CopyOrderIdButton({ id }: { id: string }) {
  return (
    <button
      type="button"
      className="rounded bg-black px-3 py-2 text-sm text-white"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(id);
        } catch {
          // ignore
        }
      }}
    >
      Copy ID
    </button>
  );
}
