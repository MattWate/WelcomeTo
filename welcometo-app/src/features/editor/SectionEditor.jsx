import React from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

// If you’re already using a rich text editor, keep it. Here we use a simple <textarea> for portability.
// Swap this with your existing editor component and write html -> setHtml and setHtml -> onChange.
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
        .from("sections")
        .select("title,body")
        .eq("id", sectionId)
        .single();
      if (!mounted) return;
      if (error) { console.error(error); setLoading(false); return; }
      setTitle(data?.title || "");
      const body = data?.body;
      setHtml(typeof body === "string" ? body : body?.html || "");
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [sectionId]);

  // debounce autosave
  React.useEffect(() => {
    if (!sectionId) return;
    const t = setTimeout(async () => {
      const { error } = await supabase
        .from("sections")
        .update({ title, body: { html } })
        .eq("id", sectionId);
      if (error) toast.error("Save failed");
    }, 700);
    return () => clearTimeout(t);
  }, [title, html, sectionId]);

  async function onUpload(e) {
    if (!propertyId) return toast.error("Select a property first");
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `${propertyId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("assets").upload(path, file);
    if (error) return toast.error("Upload failed");
    const { data } = await supabase.storage.from("assets").getPublicUrl(path);
    setHtml((h) => h + `\n<p><img src="${data.publicUrl}" alt=""></p>\n`);
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
