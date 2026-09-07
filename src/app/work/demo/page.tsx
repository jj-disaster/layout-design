import ProjectTemplate from "@/components/work/ProjectTemplate";

// Preview at /work/demo. Add/remove entries in `images` to grow the reel.
export default function Page() {
  return (
    <ProjectTemplate
      title="Project Title"
      subtitle="Subtitle / 2026"
      images={[
        { label: "1", color: "#e63946" },
        { label: "2", color: "#f4a261" },
        { label: "3", color: "#2a9d8f" },
        { label: "4", color: "#dd9ff5" },
        { label: "5", color: "#e9ecef" },
      ]}
    />
  );
}
