import React from "react";
import PropertyList from "./PropertyList";
import SectionList from "./SectionList";
import SectionEditor from "../editor/SectionEditor.jsx";
import PublishBar from "../../components/ui/PublishBar";
import Header from "../../components/layout/Header";

export default function DashboardPage() {
  const [activeSectionId, setActiveSectionId] = React.useState(
    () => localStorage.getItem("active_section_id") || null
  );
  const activePropertyId = React.useMemo(() => localStorage.getItem("active_property_id"), []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center">
        <h1 className="text-lg font-semibold">Host Dashboard</h1>
        <div className="ml-auto"><PublishBar /></div>
      </div>
      <main className="grid md:grid-cols-[340px,1fr] gap-4 p-4">
        <aside className="bg-white rounded-xl border p-3">
          <PropertyList />
          <SectionList
            propertyId={activePropertyId}
            activeSectionId={activeSectionId}
            setActiveSectionId={setActiveSectionId}
          />
        </aside>
        <section className="bg-white rounded-xl border">
          <SectionEditor />
        </section>
      </main>
    </div>
  );
}

