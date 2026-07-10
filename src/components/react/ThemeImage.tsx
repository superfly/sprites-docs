import type { CSSProperties } from 'react';

interface ThemeImageProps {
  /** Image shown in light mode. */
  light: string;
  /** Image shown in dark mode. */
  dark: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Renders a light and dark version of an image and swaps between them based on
 * the active `data-theme`. The swap is pure CSS (see custom.css), so there's no
 * hydration flash — both `<img>`s are in the DOM and only one is displayed.
 *
 * The images carry their own alpha channel (the flat canvas is keyed out to
 * transparency), so the artwork floats on any surface — page body, nav, a
 * callout, the dark-mode ambient texture. That's why this uses transparency
 * rather than `mix-blend-mode`: a blend only melts into a flat backdrop in the
 * same stacking context and leaves a seam anywhere the surface isn't that exact
 * color.
 */
export function ThemeImage({
  light,
  dark,
  alt,
  width,
  height,
  className,
  style,
}: ThemeImageProps) {
  return (
    <span
      className={`theme-image-frame${className ? ` ${className}` : ''}`}
      style={style}
    >
      <img
        src={light}
        alt={alt}
        width={width}
        height={height}
        className="theme-image theme-image--light"
      />
      <img
        src={dark}
        alt={alt}
        width={width}
        height={height}
        aria-hidden="true"
        className="theme-image theme-image--dark"
      />
    </span>
  );
}
