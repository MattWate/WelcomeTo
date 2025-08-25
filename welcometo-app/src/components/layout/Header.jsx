import React from "react";

/**
 * Simple top bar used across pages.
 * No props required. Safe to render anywhere.
 */
export default function Header({ title = "WelcomeTo" }) {
  return (
    <header className="w-full bg-white border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <span className="text-lg font-semibold">{title}</span>
        {/* optional right side actions can be slotted here later */}
      </div>
    </header>
  );
}
