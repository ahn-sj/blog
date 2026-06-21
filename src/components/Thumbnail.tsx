type ThumbnailProps = {
  src?: string;
  alt: string;
  variant?: 'list' | 'hero';
};

export function Thumbnail({ src, alt, variant = 'list' }: ThumbnailProps) {
  const className = variant === 'hero' ? 'thumb article-hero' : 'thumb';

  if (!src) {
    return <div className={className} role="img" aria-label={`${alt} placeholder`} />;
  }

  return (
    <span className={className}>
      <img src={src} alt={alt} />
    </span>
  );
}
