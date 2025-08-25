import React from "react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabaseClient";

export default function PublishBar() {
  const propertyId = React.useMemo(() => localStorage.getItem("active_property_id"), []);

  async function copyGuestLink() {
    if (!propertyId) return toast.error("Select a property");

    const { data: prop, error } = await supabase
      .from("wt_properties")
      .select("slug")
      .eq("id", propertyId)
      .maybeSingle();
    if (error || !prop?.slug) return toast.error("No slug on property");

    const url = `${window.location.origin}/guest/${prop.slug}`;
    await navigator.clipboard.writeText(url);
    toast.success("Guest link copied");
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={copyGuestLink} className="px-3 py-1 rounded border">Copy guest link</button>
    </div>
  );
}
