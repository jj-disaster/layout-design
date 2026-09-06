import ProjectTemplate from "@/components/work/ProjectTemplate";

// Preview at /work/demo. Add/remove entries in `images` to grow the reel.
export default function Page() {
  return (
    <ProjectTemplate
      title="PROJECT TITLE"
      subtitle="SUBTITLE / 2026"
      images={[
        { label: "01", color: "#e63946" },
        { label: "02", color: "#f4a261" },
        { label: "03", color: "#2a9d8f" },
        { label: "04", color: "#dd9ff5" },
        { label: "05", color: "#e9ecef" },
      ]}
    />
  );
}
