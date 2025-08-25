import React from "react";

/**
 * Editor-style top bar, reused on the dashboard.
 * Pass a `right` prop to render actions on the right.
 */
export default function Header({ title = "WelcomeTo Editor", right = null }) {
  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        {/* Brand icon */}
        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z" stroke="#10b981" strokeWidth="1.7" />
          </svg>
        </div>

        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>

        <div className="ml-auto flex items-center gap-2">
          {right}
        </div>
      </div>
    </header>
  );
}
