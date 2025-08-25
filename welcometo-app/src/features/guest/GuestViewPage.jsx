import React from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function GuestViewPage() {
  const { slug } = useParams(); // route should be /guest/:slug
  const [property, setProperty] = React.useState(null);
  const [sections, setSections] = React.useState([]);
  const [imagesBySection, setImagesBySection] = React.useState({});

  React.useEffect(() => {
    (async () => {
      // 1) Find property by slug
      const { data: prop, error: pErr } = await supabase
        .from("wt_properties")
        .select("id,title,welcome_message,hero_image_url")
        .eq("slug", slug)
        .maybeSingle();
      if (pErr || !prop) return;
      setProperty(prop);

      // 2) Sections for property, ordered
      const { data: secs } = await supabase
        .from("wt_sections")
        .select("id,title,content,display_order")
        .eq("property_id", prop.id)
        .order("display_order", { ascending: true });
      setSections(secs || []);

      // 3) Images (optional)
      if (secs?.length) {
        const sectionIds = secs.map(s => s.id);
        const { data: imgs } = await supabase
          .from("wt_images")
          .select("section_id,image_url,display_order")
          .in("section_id", sectionIds)
          .order("display_order", { ascending: true });

        const map = {};
        (imgs || []).forEach(img => {
          map[img.section_id] = map[img.section_id] || [];
          map[img.section_id].push(img.image_url);
        });
        setImagesBySection(map);
      }
    })();
  }, [slug]);

  if (!property) return <div className="p-6">This guide could not be found.</div>;

  return (
    <article className="max-w-3xl mx-auto p-6">
      {property.hero_image_url && (
        <img src={property.hero_image_url} alt="" className="w-full rounded-xl mb-6" />
      )}
      <h1 className="text-2xl font-semibold mb-2">{property.title}</h1>
      {property.welcome_message && (
        <p className="text-slate-600 mb-6">{property.welcome_message}</p>
      )}

      <div className="prose">
        {sections.map(s => (
          <section key={s.id} className="mb-8">
            <h2>{s.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: s.content || "" }} />
            {(imagesBySection[s.id] || []).map((url, i) => (
              <p key={i}><img src={url} alt="" /></p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
