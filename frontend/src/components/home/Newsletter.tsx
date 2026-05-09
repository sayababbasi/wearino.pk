'use client';

import { useState } from 'react';
import { useToast } from '@/src/components/common/Toast';

interface NewsletterProps {
  title?: string;
  description?: string;
  buttonText?: string;
}

export default function Newsletter({
  title = "Stay in the Loop",
  description = "Subscribe to our newsletter and get 15% off your first order. Be the first to know about new arrivals and exclusive offers.",
  buttonText = "SIGN ME UP"
}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        console.log('Newsletter subscription:', email);
        showToast('Thank you for subscribing!', 'success');
        setEmail('');
        setLoading(false);
      }, 1000);
    }
  };

  const CTA_BUTTON_CLASS =
    'group relative overflow-hidden px-8 py-3 font-semibold text-white bg-black border border-black transition-colors';
  const CTA_BUTTON_TEXT_CLASS =
    'relative z-10 font-extralight transition-colors duration-300 group-hover:text-black';
  const CTA_BUTTON_OVERLAY_CLASS =
    'absolute inset-0 bg-white transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100';

  return (
    <section className="bg-black text-white py-16">
      <div className="container-custom text-center">
        <h2 className="text-3xl font-bold mb-4 uppercase">{title}</h2>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          {description}
        </p>

        <div className="max-w-md mx-auto flex gap-0">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="flex-1 px-4 py-3 mr-2 bg-transparent border border-gray-600 text-gray-300 placeholder-gray-400 focus:outline-none focus:border-white transition"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`${CTA_BUTTON_CLASS} inline-flex items-center justify-center`}
          >
            <span className={CTA_BUTTON_TEXT_CLASS}>
              {loading ? 'SUBMITTING...' : buttonText}
            </span>
            <span className={CTA_BUTTON_OVERLAY_CLASS}></span>
          </button>
        </div>
      </div>
    </section>
  );
}