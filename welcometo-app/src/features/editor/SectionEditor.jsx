import React from "react";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";

export default function SectionEditor() {
  const propertyId = React.useMemo(() => localStorage.getItem("active_property_id"), []);
  const sectionId  = React.useMemo(() => localStorage.getItem("active_section_id"), []);
  const [loading, setLoading] = React.useState(true);
  const [title, setTitle] = React.useState("");
  const [html, setHtml] = React.useState("");

  React.useEffect(() => {
    if (!sectionId) { setLoading(false); return; }
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("wt_sections")
        .select("title,content")
        .eq("id", sectionId)
        .single();
      if (!mounted) return;
      if (error) { console.error(error); setLoading(false); return; }
      setTitle(data?.title || "");
      setHtml(data?.content || "");
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [sectionId]);

  // Debounced autosave
  React.useEffect(() => {
    if (!sectionId) return;
    const t = setTimeout(async () => {
      const { error } = await supabase
        .from("wt_sections")
        .update({ title, content: html })
        .eq("id", sectionId);
      if (error) toast.error("Save failed");
    }, 700);
    return () => clearTimeout(t);
  }, [title, html, sectionId]);

  // Image upload → uses storage bucket "property_images"
  // NOTE: your bucket is currently PRIVATE. For guest access without auth, either:
  // (A) make it Public in Supabase Storage, or
  // (B) keep it private and store external/public URLs in wt_images.image_url,
  //     or implement an Edge Function to generate signed URLs for guests.
  async function onUpload(e) {
    if (!propertyId) return toast.error("Select a property first");
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `${propertyId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("property_images").upload(path, file);
    if (error) return toast.error("Upload failed");

    // If bucket is public:
    const { data } = await supabase.storage.from("property_images").getPublicUrl(path);
    const publicUrl = data?.publicUrl;
    if (!publicUrl) return toast.error("No public URL (bucket is private).");

    // Append to HTML content (simple)
    setHtml(h => h + `\n<p><img src="${publicUrl}" alt=""></p>\n`);

    // Also record in wt_images (optional; keeps gallery order)
    const { error: imgErr } = await supabase
      .from("wt_images")
      .insert({ section_id: sectionId, image_url: publicUrl, display_order: 0 });
    if (imgErr) console.warn("Could not insert wt_images row:", imgErr);

    toast.success("Image uploaded");
  }

  if (!sectionId) return <div className="p-4 text-slate-500">Select a section to edit.</div>;
  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-4 space-y-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Section title"
        className="w-full border rounded px-3 py-2"
      />
      <textarea
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        placeholder="Write section content (HTML allowed)…"
        className="w-full min-h-[260px] border rounded px-3 py-2 font-mono"
      />
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input type="file" className="hidden" onChange={onUpload} />
        <span className="px-3 py-1 rounded bg-slate-100 border">Upload image</span>
      </label>
    </div>
  );
}

