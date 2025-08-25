import React from "react";
import { supabase } from "../../lib/supabaseClient";

export default function PropertyList() {
  const [properties, setProperties] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [activeId, setActiveId] = React.useState(
    () => localStorage.getItem("active_property_id") || null
  );

  React.useEffect(() => {
    localStorage.setItem("active_property_id", activeId || "");
  }, [activeId]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("wt_properties")
        .select("id,title,slug,created_at")
        .order("created_at", { ascending: true });
      if (!mounted) return;
      if (error) console.error(error);
      setProperties(data || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="text-sm text-slate-500">Loading properties…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-600">Your Properties</h3>
      </div>
      <ul className="space-y-1">
        {properties.map(p => (
          <li key={p.id}>
            <button
              className={`w-full text-left px-2 py-2 rounded border
                ${activeId === p.id ? "bg-slate-100 border-slate-300" : "bg-white hover:bg-slate-50"}`}
              onClick={() => setActiveId(p.id)}
              title={p.slug}
            >
              {p.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
