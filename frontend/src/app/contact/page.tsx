'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { api } from '@/src/lib/api';
import { useToast } from '@/src/components/common/Toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitInquiry(formData);
      showToast('Thank you for your message! We will get back to you soon.', 'success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      showToast('Failed to send message. Please try again.', 'error');
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-dark-600 max-w-2xl mx-auto">
            Have a question or need assistance? We're here to help! Fill out the form below or reach out through our contact information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="bg-dark-100 p-3 rounded-lg">
                  <Mail className="text-dark-900" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-dark-600 text-sm">support@wearino.pk</p>
                  <p className="text-dark-600 text-sm">sales@wearino.pk</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="bg-dark-100 p-3 rounded-lg">
                  <Phone className="text-dark-900" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <p className="text-dark-600 text-sm">+1 (555) 123-4567</p>
                  <p className="text-dark-600 text-sm">Mon-Fri: 9AM - 6PM</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="bg-dark-100 p-3 rounded-lg">
                  <MapPin className="text-dark-900" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Address</h3>
                  <p className="text-dark-600 text-sm">
                    WEARINO Digital Plaza<br />
                    Phase 6, DHA Lahore<br />
                    Pakistan
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-dark-900 text-white">
              <h3 className="font-semibold mb-2">Customer Support Hours</h3>
              <div className="space-y-1 text-sm">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="input-field"
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input-field"
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="input-field"
                    required
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="input-field"
                    rows={6}
                    required
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                >
                  <Send size={18} />
                  Send Message
                </button>
              </form>
            </div>

            {/* FAQ Section */}
            <div className="mt-8 card p-8">
              <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">What are your shipping options?</h4>
                  <p className="text-sm text-dark-600">
                    We offer free standard shipping on orders over $75. Express shipping is available for $15.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">How do I return an item?</h4>
                  <p className="text-sm text-dark-600">
                    Returns are accepted within 30 days of purchase. Items must be unworn with tags attached.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Do you ship internationally?</h4>
                  <p className="text-sm text-dark-600">
                    Yes! We ship to most countries worldwide. Shipping costs vary by location.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}