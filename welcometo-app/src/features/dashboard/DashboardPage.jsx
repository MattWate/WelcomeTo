import React from "react";
import PropertyList from "./PropertyList";
import Header from "../../components/layout/Header";

export default function DashboardPage({
  user,
  onLogout,
  onSelectProperty,
  onEditProperty,
  onCreateNew,
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="WelcomeTo — Host Dashboard" />

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-sky-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <h1 className="text-lg font-semibold">Your Properties</h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onCreateNew}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
              title="Create a new property"
            >
              + New Property
            </button>
            {user && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
              >
                Log out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <section className="bg-white rounded-2xl border p-4">
            <PropertyList
              onSelectProperty={onSelectProperty}
              onEditProperty={onEditProperty}
            />
          </section>

          {/* Room for quick tips / future metrics */}
          <aside className="bg-white rounded-2xl border p-4">
            <h2 className="text-sm font-medium text-slate-600 mb-2">Tips</h2>
            <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
              <li>Click <b>View</b> to open the guest page (/{'{slug}'}).</li>
              <li>Click <b>Edit</b> to jump into the editor.</li>
              <li>Use <b>+ New Property</b> to start a fresh guide.</li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
}
