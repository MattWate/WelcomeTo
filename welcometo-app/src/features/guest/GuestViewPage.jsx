import React from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function GuestViewPage() {
  const { propertyId } = useParams();
  const [snapshot, setSnapshot] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("publishes")
        .select("snapshot,published_at")
        .eq("property_id", propertyId)
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error) setSnapshot(data?.snapshot ?? null);
    })();
  }, [propertyId]);

  if (!snapshot) return <div className="p-6">Nothing published yet.</div>;

  return (
    <article className="max-w-2xl mx-auto p-6 prose">
      {snapshot.sections.map(s => (
        <section key={s.order_index}>
          <h2>{s.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: s.html }} />
        </section>
      ))}
    </article>
  );
}
