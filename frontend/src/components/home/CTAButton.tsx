import Link from 'next/link';

interface CTAButtonProps {
  href: string;
  text: string;
  className?: string;
}

export default function CTAButton({ href, text, className = '' }: CTAButtonProps) {
  const CTA_BUTTON_CLASS =
    'group relative overflow-hidden px-8 py-3 font-semibold text-white bg-black border border-black transition-colors';
  const CTA_BUTTON_TEXT_CLASS =
    'relative z-10 font-extralight transition-colors duration-300 group-hover:text-black';
  const CTA_BUTTON_OVERLAY_CLASS =
    'absolute inset-0 bg-white transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100';

  return (
    <Link
      href={href}
      className={`${CTA_BUTTON_CLASS} inline-flex items-center justify-center ${className}`}
    >
      <span className={CTA_BUTTON_TEXT_CLASS}>{text}</span>
      <span className={CTA_BUTTON_OVERLAY_CLASS}></span>
    </Link>
  );
}