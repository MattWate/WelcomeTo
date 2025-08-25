import React from "react";
import { supabase } from "../../lib/supabaseClient";

// simple inline icon (green pin, used in cards)
function PinIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21Z" stroke="#10b981" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="2.7" stroke="#10b981" strokeWidth="1.6" />
    </svg>
  );
}

export default function GuestViewPage({ slug }) {
  const [property, setProperty] = React.useState(null);
  const [sections, setSections] = React.useState([]);
  const [imagesBySection, setImagesBySection] = React.useState({});
  const [favourites, setFavourites] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setNotFound(false);

      // 1) property
      const { data: prop, error: pErr } = await supabase
        .from("wt_properties")
        .select("id,title,welcome_message,hero_image_url,slug")
        .eq("slug", slug)
        .maybeSingle();

      if (pErr) console.error(pErr);
      if (!alive) return;

      if (!prop) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProperty(prop);

      // 2) sections (ordered)
      const { data: secs, error: sErr } = await supabase
        .from("wt_sections")
        .select("id,title,icon_name,content,display_order")
        .eq("property_id", prop.id)
        .order("display_order", { ascending: true });

      if (sErr) console.error(sErr);

      // 3) section images
      let imgsBySec = {};
      if (secs && secs.length) {
        const { data: imgs, error: iErr } = await supabase
          .from("wt_images")
          .select("id,section_id,image_url,caption,display_order")
          .in("section_id", secs.map((s) => s.id))
          .order("display_order", { ascending: true });
        if (iErr) console.error(iErr);
        (imgs || []).forEach((img) => {
          (imgsBySec[img.section_id] ||= []).push(img);
        });
      }

      // 4) favourites (sidebar)
      const { data: favs, error: fErr } = await supabase
        .from("wt_local_favourites")
        .select("name,description,url,display_order")
        .eq("property_id", prop.id)
        .order("display_order", { ascending: true });
      if (fErr) console.error(fErr);

      if (!alive) return;
      setSections(secs || []);
      setImagesBySection(imgsBySec);
      setFavourites(favs || []);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-16 text-slate-500">Loading…</div>
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h1 className="text-2xl font-semibold text-slate-800">Not found</h1>
          <p className="text-slate-600 mt-2">This property doesn’t exist or is unpublished.</p>
        </div>
      </div>
    );
  }

  const hero = property.hero_image_url || "";
  const title = property.title || "Welcome";
  const welcome = property.welcome_message || "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hero */}
      <div className="relative h-72 md:h-96">
        {hero ? (
          <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-300 to-sky-300" />
        )}
        <div className="absolute inset-0 bg-slate-900/40" />
        <div className="relative max-w-5xl mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white rounded-full px-2 py-1 w-max backdrop-blur">
            <div className="flex h-6 w-6 items-center justify-center rounded border border-emerald-200 bg-emerald-50">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M4 11.5 12 5l8 6.5" stroke="#10b981" strokeWidth="1.6" />
              </svg>
            </div>
            <span className="text-xs font-medium">Guest Guide</span>
          </div>
          <h1 className="text-white text-3xl md:text-5xl font-semibold mt-3">{title}</h1>
          {welcome && <p className="text-white/90 mt-3 max-w-3xl">{welcome}</p>}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-10 grid md:grid-cols-3 gap-6">
        {/* Main sections */}
        <div className="md:col-span-2 space-y-6">
          {sections.map((s) => {
            const imgs = imagesBySection[s.id] || [];
            return (
              <article key={s.id} className="rounded-2xl border bg-white p-6 shadow-sm">
                <header className="flex items-center gap-3 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M4 11.5 12 5l8 6.5" stroke="#10b981" strokeWidth="1.7" />
                    </svg>
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold">{s.title}</h2>
                </header>

                {s.content && (
                  <div
                    className="prose prose-slate max-w-none prose-p:leading-relaxed"
                    // Content authored by the host; rendering as HTML is intentional.
                    dangerouslySetInnerHTML={{ __html: s.content }}
                  />
                )}

                {!!imgs.length && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {imgs.map((img) => (
                      <figure key={img.id} className="group">
                        <img
                          src={img.image_url}
                          alt={img.caption || ""}
                          className="h-32 w-full object-cover rounded-lg border transition group-hover:opacity-95"
                        />
                        {img.caption && (
                          <figcaption className="text-xs text-slate-500 mt-1">{img.caption}</figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {!!favourites.length && (
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <PinIcon />
                <h3 className="text-base md:text-lg font-semibold">Local Favourites</h3>
              </div>
              <ul className="space-y-3">
                {favourites.map((f, i) => (
                  <li key={i} className="rounded-lg border bg-white p-3">
                    <div className="font-medium">{f.name}</div>
                    {f.description && (
                      <div className="text-sm text-slate-600 mt-0.5">{f.description}</div>
                    )}
                    {f.url && (
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-emerald-700 hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        Visit site
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M7 17l10-10M8 7h9v9" stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Host note / contact card (optional; remove if not needed) */}
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-base md:text-lg font-semibold mb-1">Need help?</h3>
            <p className="text-sm text-slate-600">
              If anything isn’t clear, contact your host through your booking app.
            </p>
          </section>
        </aside>
      </main>

      <footer className="py-10 text-center text-xs text-slate-500">
        Powered by WelcomeTo
      </footer>
    </div>
  );
}
