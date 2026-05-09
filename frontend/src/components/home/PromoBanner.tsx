import Link from 'next/link';

interface PromoBannerProps {
  image: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
  height?: string;
  textAlign?: 'left' | 'center' | 'right';
  overlay?: boolean;
  overlayOpacity?: string;
}

export default function PromoBanner({
  image,
  title,
  subtitle,
  ctaText,
  ctaLink,
  height = 'h-[600px]',
  textAlign = 'center',
  overlay = true,
  overlayOpacity = 'bg-opacity-40'
}: PromoBannerProps) {
  const alignmentClass = {
    left: 'justify-start',
    center: 'justify-center text-center',
    right: 'justify-end'
  }[textAlign];

  return (
    <section className={`relative ${height} overflow-hidden`}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      >
        {overlay && <div className={`absolute inset-0 ${overlayOpacity}`}></div>}
      </div>
      <div className={`relative container-custom h-full flex items-center ${alignmentClass}`}>
        <div className="text-white max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{title}</h2>
          {subtitle && <p className="text-xl mb-6">{subtitle}</p>}
          <Link href={ctaLink} className="uppercase underline font-extrabold hover:opacity-80 transition-opacity">
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}