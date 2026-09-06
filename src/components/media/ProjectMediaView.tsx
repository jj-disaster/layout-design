import type { MediaItem } from "@/lib/media";
import ResponsiveImage from "./ResponsiveImage";
import VideoPlayer from "./VideoPlayer";
import AudioPlayer from "./AudioPlayer";

// Renders any catalog MediaItem. Use inside project detail pages and
// anywhere else a mixed image/video/audio sequence is needed.
export default function ProjectMediaView({ item }: { item: MediaItem }) {
  switch (item.kind) {
    case "image":
      return <ResponsiveImage src={item.src} alt={item.alt} />;
    case "video":
      return (
        <VideoPlayer
          src={item.src}
          poster={item.poster}
          controls
          preload="metadata"
        />
      );
    case "audio":
      return <AudioPlayer src={item.src} />;
  }
}
