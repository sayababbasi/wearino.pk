"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";

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
              <li><Link href="#">Track My Order</Link></li>
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
