import React from "react";
import { supabase } from "../../lib/supabaseClient";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import toast from "react-hot-toast";

function Row({ id, title, isActive, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center justify-between px-2 py-2 rounded ${isActive ? "bg-slate-100" : "hover:bg-slate-50"}`}>
      <button onClick={onSelect} className="truncate text-left">{title}</button>
      <span {...attributes} {...listeners} className="cursor-grab text-slate-400">⋮⋮</span>
    </div>
  );
}

export default function SectionList({ propertyId, activeSectionId, setActiveSectionId }) {
  const [sections, setSections] = React.useState([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  React.useEffect(() => {
    if (!propertyId) return;
    (async () => {
      const { data, error } = await supabase
        .from("wt_sections")
        .select("id,title,display_order")
        .eq("property_id", propertyId)
        .order("display_order", { ascending: true });
      if (error) return console.error(error);
      setSections(data || []);
      if (!activeSectionId && data?.length) {
        setActiveSectionId(data[0].id);
        localStorage.setItem("active_section_id", data[0].id);
      }
    })();
  }, [propertyId]);

  async function onDragEnd(e) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex(s => s.id === active.id);
    const newIndex = sections.findIndex(s => s.id === over.id);
    const newOrder = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({ ...s, display_order: i }));
    setSections(newOrder); // optimistic

    // Persist order (batch upsert)
    const updates = newOrder.map(s => ({ id: s.id, display_order: s.display_order }));
    const { error } = await supabase.from("wt_sections").upsert(updates);
    if (error) {
      toast.error("Reorder failed");
      const { data } = await supabase
        .from("wt_sections")
        .select("id,title,display_order")
        .eq("property_id", propertyId)
        .order("display_order", { ascending: true });
      setSections(data || []);
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm text-slate-500">Sections</h4>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {sections.map(s => (
              <Row
                key={s.id}
                id={s.id}
                title={s.title}
                isActive={activeSectionId === s.id}
                onSelect={() => {
                  setActiveSectionId(s.id);
                  localStorage.setItem("active_section_id", s.id);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
