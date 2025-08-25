import React from "react";
import Header from "../../components/layout/Header";
import Button from "../../components/ui/Button";
import PropertyList from "./PropertyList";

export default function DashboardPage({
  user,
  onLogout,
  onSelectProperty,
  onEditProperty,
  onCreateNew,
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Header
        title="WelcomeTo Editor"
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onLogout}>Exit</Button>
            <Button onClick={onCreateNew}>+ New Property</Button>
          </div>
        }
      />

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        <section className="mb-4">
          <h2 className="text-2xl font-semibold text-slate-800">Your Properties</h2>
          <p className="text-slate-500 text-sm">Open the public view or jump into the editor.</p>
        </section>

        <section>
          <PropertyList
            onSelectProperty={onSelectProperty}
            onEditProperty={onEditProperty}
          />
        </section>
      </main>
    </div>
  );
}
