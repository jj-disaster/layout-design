import { withBasePath } from "@/lib/media";

interface AudioPlayerProps {
  src: string;
  className?: string;
}

// Native <audio>. Prefer constant-bitrate MP3 (~192kbps) or Opus-in-WebM
// for score/ambience beds; preload="metadata" avoids fetching full files
// until the visitor presses play.
export default function AudioPlayer({ src, className }: AudioPlayerProps) {
  return (
    <audio
      src={withBasePath(src)}
      controls
      preload="metadata"
      className={className}
    />
  );
}
