import React from "react";
import { supabase } from "../../lib/supabaseClient";

export default function PropertyList({ onSelectProperty, onEditProperty }) {
  const [properties, setProperties] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("wt_properties")
        .select("id,title,slug,created_at")
        .order("created_at", { ascending: false }); // newest first
      if (!mounted) return;
      if (error) console.error(error);
      setProperties(data || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="text-sm text-slate-500">Loading properties…</div>;
  if (!properties.length) {
    return (
      <div className="text-sm text-slate-500">
        No properties yet.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {properties.map((p) => (
        <li key={p.id} className="border rounded-xl p-3 bg-white flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{p.title}</div>
            <div className="text-xs text-slate-500 truncate">/{p.slug}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSelectProperty?.(p.slug)}
              className="px-3 py-1 rounded-lg border"
              title="Open guest view"
            >
              View
            </button>
            <button
              onClick={() => onEditProperty?.(p.slug)}
              className="px-3 py-1 rounded-lg bg-black text-white"
              title="Open editor"
            >
              Edit
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
