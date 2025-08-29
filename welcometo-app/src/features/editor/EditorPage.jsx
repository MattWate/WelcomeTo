import React from "react";
import { supabase } from "../../lib/supabaseClient";
import Header from "../../components/layout/Header";
import Button from "../../components/ui/Button";
import RichText from "../../components/ui/RichText";

/* ----------------------------- Default template ---------------------------- */
function defaultTemplate() {
  return [
    { group: "Main Details", items: [] },

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
        { title: "Local Favourites", icon_name: "pin", content: [] }, // array on purpose
        { title: "Emergency Contacts", icon_name: "phone", content: "" },
      ],
    },
  ];
}

/* --------------------------- Merge helpers (DB → UI) ----------------------- */
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
      display_order: img.display_order ?? 0,
    })),
  };
}

function mergeWithDefaults(templateGroups, dbSections = [], dbImages = [], dbFavourites = []) {
  const imagesBySection = dbImages.reduce((acc, img) => {
    (acc[img.section_id] ||= []).push(img);
    return acc;
  }, {});

  const matchByTitle = (title) =>
    dbSections.find(
      (s) => (s.title || "").trim().toLowerCase() === title.trim().toLowerCase()
    );

  return templateGroups.map((g) => {
    const items = (g.items || []).map((tpl) => {
      if (Array.isArray(tpl.content)) {
        // Local Favourites
        const lf = (dbFavourites || [])
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map((f) => ({
            name: f.name,
            description: f.description || "",
            url: f.url || "",
            // new optional fields if you add them later:
            address: f.address || "",
            lat: f.lat ?? null,
            lng: f.lng ?? null,
            category: f.category || "",
            place_provider: f.place_provider || "",
            place_id: f.place_id || "",
            image_url: f.image_url || "",
          }));
        return { ...tpl, content: lf, wt_images: [] };
      }
      const match = matchByTitle(tpl.title);
      return match ? mapDbSection(match, imagesBySection[match.id]) : { ...tpl, wt_images: [] };
    });

    // include extra DB sections not present in template
    const usedIds = new Set(items.map((i) => i.id).filter(Boolean));
    const extras = dbSections
      .filter((s) => !usedIds.has(s.id))
      .map((s) => mapDbSection(s, imagesBySection[s.id]));

    return { ...g, items: [...items, ...extras] };
  });
}

/* -------------------------- Stable keys for new items ---------------------- */
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function withKeys(groups) {
  return groups.map((g) => ({
    ...g,
    items: (g.items || []).map((it) => (it._key ? it : { ...it, _key: uid() })),
  }));
}

/* ------------------------------ Image picker UI ---------------------------- */
function ImagesPicker({ images = [], onUpload, onRemove }) {
  return (
    <div className="flex gap-3 flex-wrap">
      {images.map((img, i) => (
        <div key={img.id || i} className="relative">
          <img
            src={img.image_url}
            alt={img.caption || ""}
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

/* ------------------------------- Section card ------------------------------ */
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
              onClick={() =>
                onChange({
                  ...section,
                  content: [...section.content, { name: "", description: "", url: "" }],
                })
              }
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
        <RichText
          value={section.content || ""}
          onChange={(html) => onChange({ ...section, content: html })}
          placeholder="Write content…"
        />
      )}

      <div className="mt-3">
        <div className="text-sm text-slate-600 mb-1">Images</div>
        <ImagesPicker
          images={section.wt_images || []}
          onUpload={(e) => onUploadImage?.(e, section)}
          onRemove={(i) => onRemoveImage?.(section, i)}
        />
      </div>
    </div>
  );
}

/* -------------------------------- Editor page ------------------------------ */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    alert("Link copied to clipboard");
  } catch {
    alert("Could not copy link");
  }
}

export default function EditorPage({ slug, onSave, onExit }) {
  const creatingNew = slug === "new";

  const [property, setProperty] = React.useState({
    id: null,
    title: "",
    welcome_message: "",
    hero_image_url: "",
    slug: undefined,
  });

  const [groups, setGroups] = React.useState(withKeys(defaultTemplate()));
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

        // sections
        const { data: secs, error: sErr } = await supabase
          .from("wt_sections")
          .select("id,property_id,title,icon_name,content,display_order")
          .eq("property_id", prop.id)
          .order("display_order", { ascending: true });
        if (sErr) console.error(sErr);

        // images
        let imgs = [];
        if (secs && secs.length) {
          const { data: imgRows, error: iErr } = await supabase
            .from("wt_images")
            .select("id,section_id,image_url,caption,display_order")
            .in("section_id", secs.map((s) => s.id))
            .order("display_order", { ascending: true });
          if (iErr) console.error(iErr);
          imgs = imgRows || [];
        }

        // local favourites
        const { data: favs, error: fErr } = await supabase
          .from("wt_local_favourites")
          .select("property_id,name,description,url,display_order,address,lat,lng,category,place_provider,place_id,image_url")
          .eq("property_id", prop.id)
          .order("display_order", { ascending: true });
        if (fErr) console.error(fErr);

        setGroups(withKeys(mergeWithDefaults(defaultTemplate(), secs || [], imgs || [], favs || [])));
      } else {
        setGroups(withKeys(defaultTemplate()));
      }
      setLoading(false);
    })();
  }, [slug, creatingNew]);

  /* ----------------------------- Upload handlers --------------------------- */
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
          const match =
            (it.id && section.id && it.id === section.id) || it._key === section._key;
          if (match) {
            const next = { ...it, wt_images: [...(it.wt_images || [])] };
            next.wt_images.push({
              image_url: url,
              caption: "",
              display_order: next.wt_images.length || 0,
            });
            return next;
          }
          return it;
        }),
      }))
    );
  }

  function removeSectionImage(section, index) {
    setGroups((gs) =>
      gs.map((g) => ({
        ...g,
        items: g.items.map((it) => {
          const match =
            (it.id && section.id && it.id === section.id) || it._key === section._key;
          if (match) {
            const next = { ...it, wt_images: [...(it.wt_images || [])] };
            next.wt_images.splice(index, 1);
            return next;
          }
          return it;
        }),
      }))
    );
  }

  /* ------------------------------ State helpers ---------------------------- */
  function updateSection(updated) {
    setGroups((gs) =>
      gs.map((g) => ({
        ...g,
        items: g.items.map((it) => {
          if (it.id && updated.id) return it.id === updated.id ? updated : it;
          return it._key === updated._key ? updated : it;
        }),
      }))
    );
  }

  function buildBookData() {
    return {
      id: property.id || undefined,
      title: property.title,
      slug: property.slug, // optional; App.jsx derives from title if missing
      welcome_message: property.welcome_message,
      hero_image_url: property.hero_image_url,
      groupedSections: groups.map((g) => ({
        group: g.group,
        items: g.items.map((it) => ({
          id: it.id,
          title: it.title,
          icon_name: it.icon_name || null,
          content: it.content, // string or array (Local Favourites)
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

  /* --------------------------------- Render -------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Header
          title="WelcomeTo Editor"
          right={<div className="text-sm text-slate-500">Loading…</div>}
        />
      </div>
    );
  }

  const guestLink = property?.slug ? `${window.location.origin}/${property.slug}` : null;

  return (
    <div className="min-h-screen bg-slate-100">
      <Header
        title="WelcomeTo Editor"
        right={
          <div className="flex items-center gap-2">
            {guestLink && (
              <>
                <Button
                  variant="outline"
                  onClick={() => window.open(guestLink, "_blank", "noopener,noreferrer")}
                >
                  View Guest Page
                </Button>
                <Button variant="ghost" onClick={() => copyToClipboard(guestLink)}>
                  Copy Link
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => onExit?.()}>Exit</Button>
            <Button onClick={handleSaveClick} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        }
      />

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
        {/* Main details */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Main Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Property Title</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={property.title}
                onChange={(e) => setProperty((p) => ({ ...p, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Welcome Message</label>
              <textarea
                className="w-full min-h-[90px] border rounded-lg px-3 py-2"
                value={property.welcome_message}
                onChange={(e) => setProperty((p) => ({ ...p, welcome_message: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hero Image</label>
              <div className="flex items-center gap-3">
                {property.hero_image_url ? (
                  <img
                    src={property.hero_image_url}
                    alt=""
                    className="h-24 w-36 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="h-24 w-36 rounded-lg border bg-slate-50" />
                )}
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={uploadHero} />
                  <Button variant="outline">Upload New</Button>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Groups & sections */}
        {groups.map((g, gi) => (
          <section key={gi}>
            {g.items?.length ? (
              <>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">{g.group}</h3>
                <div className="space-y-4">
                  {g.items.map((it, ii) => (
                    <SectionCard
                      key={it.id || it._key || `${gi}-${ii}-${it.title}`}
                      section={it}
                      onChange={updateSection}
                      onUploadImage={uploadSectionImage}
                      onRemoveImage={removeSectionImage}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </section>
        ))}
      </main>
    </div>
  );
}
