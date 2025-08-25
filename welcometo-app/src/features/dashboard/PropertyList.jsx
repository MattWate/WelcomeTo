import React from "react";
import { supabase } from "../../lib/supabaseClient";
import Button from "../../components/ui/Button";

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
        .order("created_at", { ascending: false });
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
      <div className="rounded-2xl border bg-white p-6 text-center">
        <p className="text-slate-600">No properties yet.</p>
        <p className="text-slate-500 text-sm mt-1">Create your first guide to get started.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {properties.map((p) => (
        <li key={p.id} className="rounded-2xl border bg-white p-4 shadow-sm flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="font-medium text-slate-800 truncate">{p.title}</div>
            <div className="text-xs text-slate-500 truncate">/{p.slug}</div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" onClick={() => onSelectProperty?.(p.slug)}>View</Button>
            <Button onClick={() => onEditProperty?.(p.slug)}>Edit</Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
