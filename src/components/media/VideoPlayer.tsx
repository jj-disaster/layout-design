import { withBasePath } from "@/lib/media";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  /** Background loops: pass autoPlay + loop (muted + playsInline implied). */
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  preload?: "none" | "metadata" | "auto";
  className?: string;
}

// Self-hosted <video>. Zero external cost; keep clips tight (~5MB max).
//
// Suggested compression (faststart puts metadata first for streaming):
//   ffmpeg -i in.mov -vcodec libx264 -crf 23 -preset slow \
//     -movflags +faststart -vf scale=-2:1080 -an out.mp4
// WebM variant for smaller files:
//   ffmpeg -i in.mov -c:v libvpx-vp9 -crf 30 -b:v 0 \
//     -movflags +faststart -vf scale=-2:1080 -an out.webm
export default function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  loop = false,
  muted,
  controls = true,
  preload = "metadata",
  className,
}: VideoPlayerProps) {
  return (
    <video
      src={withBasePath(src)}
      poster={poster ? withBasePath(poster) : undefined}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted ?? autoPlay}
      controls={controls && !autoPlay}
      playsInline
      preload={preload}
      className={className}
    />
  );
}
