import React from "react";
import { supabase } from "../../lib/supabaseClient";
import Header from "../../components/layout/Header";
import Button from "../../components/ui/Button";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "";
  }
}

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

const guestUrl = (slug) => `${window.location.origin}/${slug}`;

export default function DashboardPage({
  user,
  onLogout,
  onSelectProperty, // kept for in-app navigate (optional)
  onEditProperty,
  onCreateNew,
}) {
  const [loading, setLoading] = React.useState(true);
  const [properties, setProperties] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      if (!user?.id) {
        setProperties([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("wt_properties")
        .select("id,title,slug,created_at,hero_image_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (error) console.error(error);
      setProperties(data || []);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header
        title="Your WelcomeTo Guides"
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCreateNew}>Add New Property</Button>
            <Button variant="ghost" onClick={onLogout}>Log out</Button>
          </div>
        }
      />

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {loading ? (
          <div className="text-slate-500">Loading…</div>
        ) : properties.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-800">No properties yet</h2>
            <p className="text-slate-600 mt-1">Create your first guest guide.</p>
            <div className="mt-4">
              <Button onClick={onCreateNew}>Create Property</Button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((p) => (
              <div key={p.id} className="rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col">
                {p.hero_image_url ? (
                  <img
                    src={p.hero_image_url}
                    alt=""
                    className="h-36 w-full object-cover border-b"
                  />
                ) : (
                  <div className="h-36 w-full bg-gradient-to-r from-emerald-200 to-sky-200 border-b" />
                )}

                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">{p.title}</h3>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">/{p.slug}</div>
                  <div className="text-xs text-slate-500">Created {formatDate(p.created_at)}</div>

                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      onClick={() => window.open(guestUrl(p.slug), "_blank", "noopener,noreferrer")}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" className="mr-1" aria-hidden="true">
                        <path d="M7 17l10-10M8 7h9v9" stroke="currentColor" strokeWidth="1.6" fill="none" />
                      </svg>
                      Open Guest View
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => copyToClipboard(guestUrl(p.slug))}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" className="mr-1" aria-hidden="true">
                        <path d="M9 9h10v10H9zM5 5h10v2H7v8H5z" stroke="currentColor" strokeWidth="1.4" fill="none"/>
                      </svg>
                      Copy Link
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => onEditProperty?.(p.slug)}
                    >
                      Edit
                    </Button>
                  </div>

                  {/* Optional: keep classic in-app view */}
                  {onSelectProperty && (
                    <div className="mt-2">
                      <button
                        className="text-xs text-emerald-700 hover:underline"
                        onClick={() => onSelectProperty(p.slug)}
                      >
                        View in app
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
