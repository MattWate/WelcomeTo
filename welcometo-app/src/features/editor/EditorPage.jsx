import React from "react";
import { supabase } from "../../lib/supabaseClient";
import Header from "../../components/layout/Header";
import Button from "../../components/ui/Button";

/** -----------------------------------------------------------------------
 * 1) Default template — ensures every expected section is visible
 *    Titles can be edited later; we use them to map existing DB sections.
 * ----------------------------------------------------------------------*/
function defaultTemplate() {
  return [
    {
      group: "Main Details",
      items: [
        // "Main Details" uses top-level fields (title, welcome_message, hero_image_url).
        // Kept here only for ordering consistency; no card needed.
      ],
    },
    {
      group: "Arrival & Essentials",
      items: [
        { title: "Welcome", icon_name: "home", content: "" },
        { title: "Directions & Parking", icon_name: "map", content: "" },
        { title: "Check-in & Check-out", icon_name: "key", content: "" },
        { title: "Wi-Fi & Internet", icon_name: "wifi", content: "" },
        { title: "House Rules", icon_name: "book", content: "" },
        { title: "Safety Info", icon_name: "shield", content: "" },
      ],
    },
    {
      group: "About the Home",
      items: [
        { title: "Appliances & Controls", icon_name: "tools", content: "" },
        { title: "Kitchen & Dining", icon_name: "utensils", content: "" },
        { title: "Laundry", icon_name: "laundry", content: "" },
        { title: "Heating & Cooling", icon_name: "thermo", content: "" },
        { title: "Outdoor Areas", icon_name: "garden", content: "" },
      ],
    },
    {
      group: "Local Guide & Help",
      items: [
        // IMPORTANT: keep content as ARRAY for Local Favourites (App.jsx expects this)
        { title: "Local Favourites", icon_name: "pin", content: [] },
        { title: "Emergency Contacts", icon_name: "phone", content: "" },
      ],
    },
  ];
}

/** Map a DB section into our template slot */
function mapDbSection(sectionRow, imagesForSection) {
  return {
    id: sectionRow.id,
    title: sectionRow.title || "",
    icon_name: sectionRow.icon_name || "",
    content: sectionRow.content || "",
    wt_images: (imagesForSection || []).map((img) => ({
      id: img.id,
      image_url: img.image_url,
      caption: img.caption || "",
      display_order: img.display_order || 0,
    })),
  };
}

/** Merge defaults with DB rows so missing sections appear as empty cards */
function mergeWithDefaults(templateGroups, dbSections = [], dbImages = [], dbFavourites = []) {
  const imagesBySection = dbImages.reduce((acc, img) => {
    (acc[img.section_id] ||= []).push(img);
    return acc;
  }, {});

  // Find a matching DB section by title (case-insensitive)
  const matchByTitle = (title) =>
    dbSections.find((s) => (s.title || "").trim().toLowerCase() === title.trim().toLowerCase());

  return templateGroups.map((g) => {
    // Special handling for Local Favourites: use dbFavourites array if present
    const items = (g.items || []).map((tpl) => {
      if (Array.isArray(tpl.content)) {
        // Local Favourites
        const lf = dbFavourites
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map((f) => ({ name: f.name, description: f.description || "", url: f.url || "" }));
        return { ...tpl, content: lf, wt_images: [] };
      }

      const match = matchByTitle(tpl.title);
      if (match) {
        return mapDbSection(match, imagesBySection[match.id]);
      } else {
        return { ...tpl, wt_images: [] }; // empty placeholder card
      }
    });

    // Also include any extra DB sections whose titles aren’t in the template
    const usedIds = new Set(items.map((i) => i.id).filter(Boolean));
    const extras = dbSections
      .filter((s) => !usedIds.has(s.id))
      .map((s) => mapDbSection(s, imagesBySection[s.id]));

    return { ...g, items: [...items, ...extras] };
  });
}

/** Thumbnail + upload tile for section images */
function ImagesPicker({ images = [], onUpload, onRemove }) {
  return (
    <div className="flex gap-3 flex-wrap">
      {images.map((img, i) => (
        <div key={i} className="relative">
          <img
            src={img.image_url}
            alt=""
            className="h-20 w-28 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={() => onRemove?.(i)}
            className="absolute -top-2 -right-2 bg-white border rounded-full w-6 h-6 text-xs"
            title="Remove"
          >
            ×
          </button>
        </div>
      ))}

      <label className="h-20 w-28 rounded-lg border bg-slate-50 inline-flex items-center justify-center cursor-pointer hover:bg-slate-100">
        <input type="file" className="hidden" onChange={onUpload} accept="image/*" />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="#94a3b8" strokeWidth="2" />
        </svg>
      </label>
    </div>
  );
}

/** Section card */
function SectionCard({ section, onChange, onUploadImage, onRemoveImage }) {
  const isLocalFavourites = Array.isArray(section.content);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded border border-emerald-200 bg-emerald-50">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M4 11.5 12 5l8 6.5" stroke="#10b981" strokeWidth="1.7" />
          </svg>
        </div>
        <input
          className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      {isLocalFavourites ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-700">Local Favourites</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange({ ...section, content: [...section.content, { name: "", description: "", url: "" }] })}
            >
              Add Favourite
            </Button>
          </div>
          <div className="space-y-3">
            {section.content.map((fav, idx) => (
              <div key={idx} className="grid md:grid-cols-3 gap-2">
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Name"
                  value={fav.name}
                  onChange={(e) => {
                    const next = [...section.content];
                    next[idx] = { ...fav, name: e.target.value };
                    onChange({ ...section, content: next });
                  }}
                />
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="URL (optional)"
                  value={fav.url}
                  onChange={(e) => {
                    const next = [...section.content];
                    next[idx] = { ...fav, url: e.target.value };
                    onChange({ ...section, content: next });
                  }}
                />
                <input
                  className="border rounded-lg px-3 py-2 text-sm md:col-span-1"
                  placeholder="Description (optional)"
                  value={fav.description}
                  onChange={(e) => {
                    const next = [...section.content];
                    next[idx] = { ...fav, description: e.target.value };
                    onChange({ ...section, content: next });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <textarea
          className="w-full min-h-[120px] border rounded-lg px-3 py-2 text-sm"
          placeholder="Write content… (HTML allowed)"
          value={section.content || ""}
          onChange={(e) => onChange({ ...section, content: e.target.value })}
        />
      )}

      <div className="mt-3">
        <div className="text-sm text-slate-600 mb-1">Images</div>
        <ImagesPicker
          images={section.wt_images || []}
          onUpload={(e) => onUploadImage?.(e, section)}
          onRemove={(i) => {
            const next = { ...section };
            next.wt_images = [...(next.wt_images || [])];
            next.wt_images.splice(i, 1);
            onChange(next);
          }}
        />
      </div>
    </div>
  );
}

/** -----------------------------------------------------------------------
 * 2) Editor Page — styled like the dashboard, with default-section merge
 * ----------------------------------------------------------------------*/
export default function EditorPage({ slug, onSave, onExit }) {
  const creatingNew = slug === "new";

  // Property main details
  const [property, setProperty] = React.useState({
    id: null,
    title: "",
    welcome_message: "",
    hero_image_url: "",
  });

  // Grouped sections for UI
  const [groups, setGroups] = React.useState(defaultTemplate());
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setLoading(true);

      let prop = null;
      if (!creatingNew) {
        const { data: p, error: pErr } = await supabase
          .from("wt_properties")
          .select("id,title,welcome_message,hero_image_url,slug")
          .eq("slug", slug)
          .maybeSingle();
        if (pErr) console.error(pErr);
        prop = p || null;
      }

      if (prop) {
        setProperty({
          id: prop.id,
          title: prop.title || "",
          welcome_message: prop.welcome_message || "",
          hero_image_url: prop.hero_image_url || "",
          slug: prop.slug,
        });

        // Load related rows
        const [{ data: secs }, { data: imgs }, { data: favs }] = await Promise.all([
          supabase
            .from("wt_sections")
            .select("id,property_id,title,icon_name,content,display_order")
            .eq("property_id", prop.id)
            .order("display_order", { ascending: true }),
          supabase
            .from("wt_images")
            .select("id,section_id,image_url,caption,display_order")
            .in(
              "section_id",
              (secs || []).map((s) => s.id).concat(["00000000-0000-0000-0000-000000000000"]) // guard for empty
            ),
          supabase
            .from("wt_local_favourites")
            .select("property_id,name,description,url,display_order")
            .eq("property_id", prop.id)
            .order("display_order", { ascending: true }),
        ]);

        setGroups(mergeWithDefaults(defaultTemplate(), secs || [], imgs || [], favs || []));
      } else {
        // New property → just show defaults
        setGroups(defaultTemplate());
      }

      setLoading(false);
    })();
  }, [slug, creatingNew]);

  /** Upload hero image → store public URL in state (bucket must be public or use signed URLs) */
  async function uploadHero(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const folder = property.id || "new";
    const path = `${folder}/hero_${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from("property_images").upload(path, file);
    if (upErr) return alert("Upload failed: " + upErr.message);

    const { data } = await supabase.storage.from("property_images").getPublicUrl(path);
    setProperty((p) => ({ ...p, hero_image_url: data?.publicUrl || "" }));
  }

  /** Upload section image */
  async function uploadSectionImage(e, section) {
    const file = e.target.files?.[0];
    if (!file) return;
    const folder = property.id || "new";
    const path = `${folder}/${section.id || "section"}_${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from("property_images").upload(path, file);
    if (upErr) return alert("Upload failed: " + upErr.message);

    const { data } = await supabase.storage.from("property_images").getPublicUrl(path);
    const url = data?.publicUrl || "";

    setGroups((gs) =>
      gs.map((g) => ({
        ...g,
        items: g.items.map((it) => {
          if ((it.id && section.id && it.id === section.id) || it === section) {
            const next = { ...it };
            next.wt_images = [...(next.wt_images || []), { image_url: url, caption: "", display_order: (next.wt_images?.length || 0) }];
            return next;
          }
          return it;
        }),
      }))
    );
  }

  /** Change a section inside our grouped state */
  function updateSection(updated) {
    setGroups((gs) =>
      gs.map((g) => ({
        ...g,
        items: g.items.map((it) => (it.id === updated.id || it === updated._matchRef ? updated : it)),
      }))
    );
  }

  /** Assemble the bookData that App.jsx.handleSave expects */
  function buildBookData() {
    return {
      id: property.id || undefined,
      title: property.title,
      slug: property.slug, // can be undefined; App.jsx will derive from title
      welcome_message: property.welcome_message,
      hero_image_url: property.hero_image_url,
      groupedSections: groups.map((g) => ({
        group: g.group,
        items: g.items.map((it) => ({
          id: it.id, // may be undefined for new sections
          title: it.title,
          icon_name: it.icon_name || null,
          content: it.content, // string OR favourites array
          wt_images: it.wt_images || [],
        })),
      })),
    };
  }

  async function handleSaveClick() {
    setSaving(true);
    try {
      const bookData = buildBookData();
      await onSave?.(bookData);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Header title="WelcomeTo Editor" right={<d
