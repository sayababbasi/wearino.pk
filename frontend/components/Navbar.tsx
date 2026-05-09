"use client";

import { useState } from "react";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <span className="text-xl font-bold text-blue-600">MyLogo</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="hover:text-blue-600">
              Products
            </Link>
            <Link href="/cart" className="hover:text-blue-600">
              Cart
            </Link>
            <Link href="/login" className="hover:text-blue-600">
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white px-2 pt-2 pb-4 space-y-1 shadow-md">
          <Link
            href="/"
            className="block px-3 py-2 rounded-md hover:bg-blue-100"
            onClick={toggleMenu}
          >
            Products
          </Link>
          <Link
            href="/cart"
            className="block px-3 py-2 rounded-md hover:bg-blue-100"
            onClick={toggleMenu}
          >
            Cart
          </Link>
          <Link
            href="/login"
            className="block px-3 py-2 rounded-md hover:bg-blue-100"
            onClick={toggleMenu}
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
