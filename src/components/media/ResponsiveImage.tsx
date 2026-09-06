import Image from "next/image";
import { withBasePath } from "@/lib/media";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

// next/image wrapper. Note: static export serves originals (see
// images.unoptimized in next.config.ts), so keep source files web-ready:
// export stills as WebP/AVIF (fall back to quality-80 JPG) at max ~2560px
// on the long edge.
export default function ResponsiveImage({
  src,
  alt,
  width = 1600,
  height = 900,
  sizes = "(max-width: 768px) 100vw, 80vw",
  priority = false,
  className,
}: ResponsiveImageProps) {
  return (
    <Image
      src={withBasePath(src)}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
