import React from "react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabaseClient";

export default function PublishBar() {
  const propertyId = React.useMemo(() => localStorage.getItem("active_property_id"), []);

  async function publishNow() {
    if (!propertyId) return toast.error("Select a property first");
    const { data: sections, error } = await supabase
      .from("sections")
      .select("title,body,order_index")
      .eq("property_id", propertyId)
      .order("order_index", { ascending: true });
    if (error) return toast.error("Failed to read sections");

    const snapshot = {
      sections: (sections || []).map(s => ({
        title: s.title,
        html: typeof s.body === "string" ? s.body : s.body?.html || "",
        order_index: s.order_index
      })),
      published_at: new Date().toISOString()
    };

    const { error: insErr } = await supabase.from("publishes").insert({ property_id: propertyId, snapshot });
    if (insErr) return toast.error("Publish failed");
    toast.success("Published");
  }

  function copyGuestLink() {
    if (!propertyId) return toast.error("Select a property");
    const url = `${window.location.origin}/guest/${propertyId}`;
    navigator.clipboard.writeText(url);
    toast.success("Guest link copied");
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={publishNow} className="px-3 py-1 rounded bg-emerald-600 text-white">Publish</button>
      <button onClick={copyGuestLink} className="px-3 py-1 rounded border">Copy guest link</button>
    </div>
  );
}
