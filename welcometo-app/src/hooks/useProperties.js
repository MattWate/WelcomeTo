export function useActivePropertyId() {
  const [activeId, setActiveId] = React.useState(
    () => localStorage.getItem("active_property_id") || null
  );
  React.useEffect(() => {
    if (activeId) localStorage.setItem("active_property_id", activeId);
  }, [activeId]);
  return [activeId, setActiveId];
}
