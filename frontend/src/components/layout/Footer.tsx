"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { } from "lucide-react";

// Custom SVG components for brand icons removed in lucide-react 1.0
const Facebook = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Twitter = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const Instagram = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Youtube = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
);

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-[var(--color-border)] mt-20">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          {/* HELP + INFO */}
          <div>
            <h4 className="font-semibold tracking-widest text-xs mb-4 text-[var(--color-dark-900)]">
              HELP + INFO
            </h4>
            <ul className="space-y-2 text-md font-extralight text-[var(--color-dark-700)]">
              <li><Link href="#">My Account</Link></li>
              <li><Link href="#">Return Center</Link></li>
              <li><Link href="/track-order">Track My Order</Link></li>
              <li><Link href="#">Contact Us</Link></li>
              <li><Link href="#">Size Guide</Link></li>
            </ul>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="font-semibold tracking-widest text-xs mb-4 text-[var(--color-dark-900)]">
              QUICK LINKS
            </h4>
            <ul className="space-y-2 text-md font-extralight text-[var(--color-dark-700)]">
              <li><Link href="#">Notice to Our Valued Customers</Link></li>
              <li><Link href="#">FAQ</Link></li>
              <li><Link href="#">Shipping Policy</Link></li>
              <li><Link href="#">Return Policy</Link></li>
              <li><Link href="#">Accessibility Statement</Link></li>
            </ul>
          </div>

          {/* MISSION */}
          <div>
            <h4 className="font-semibold tracking-widest text-xs mb-4 text-[var(--color-dark-900)] uppercase">
              WEARINO MISSION
            </h4>
            <p className="text-md font-extralight text-[var(--color-dark-700)] leading-relaxed mb-4">
              Shop with confidence at wearino.pk. We empower self-expression through
              premium fashion and quality pieces designed for the modern look.
            </p>
            <p className="font-medium text-[var(--color-dark-900)] mb-3 uppercase tracking-tighter italic">
              Define Your Style, <span className="font-bold">Wear Confidence.</span>
            </p>

            <div className="flex justify-center md:justify-start space-x-3">
              <Image
                src="/images/appstore.svg"
                alt="App Store"
                width={130}
                height={40}
              />
              <Image
                src="/images/googleplay.svg"
                alt="Google Play"
                width={130}
                height={40}
              />
            </div>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center md:justify-start space-x-10 mt-10 text-[var(--color-dark-600)]">
          <a href="#"><Facebook size={20} /></a>
          <a href="#"><Twitter size={20} /></a>
          <a href="#"><Instagram size={20} /></a>
          <a href="#"><Youtube size={20} /></a>
        </div>

        {/* Divider */}
        <div className="font-extralight border-t border-[var(--color-border)] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[var(--color-dark-600)]">
          <p>© 2025 WEARINO.pk. ALL RIGHTS RESERVED</p>

          {/* Payment Icons */}
          <div className="flex flex-wrap justify-center md:justify-end gap-3 mt-4 md:mt-0">
            <Image src="/images/applepay.svg" alt="Apple Pay" width={40} height={25} />
            <Image src="/images/amex.svg" alt="Amex" width={40} height={25} />
            <Image src="/images/discover.svg" alt="Discover" width={40} height={25} />
            <Image src="/images/mastercard.svg" alt="MasterCard" width={40} height={25} />
            <Image src="/images/visa.svg" alt="Visa" width={40} height={25} />
            <Image src="/images/shop.svg" alt="Shop Pay" width={40} height={25} />
            <Image src="/images/gpay.svg" alt="Google Pay" width={40} height={25} />
          </div>
        </div>
      </div>
    </footer>
  );
}
