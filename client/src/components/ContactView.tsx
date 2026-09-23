import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  MessageSquare,
  ShieldCheck,
  Headphones,
  ArrowLeft,
} from 'lucide-react';
import { UserProfile, ViewScreen } from '../types';

interface ContactViewProps {
  onNavigate: (screen: ViewScreen) => void;
  user?: UserProfile | null;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigate, user }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; email: string } | null>(null);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const ticketId = `TRIP-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedTicket({ id: ticketId, email });
      setSubject('');
      setMessage('');
    }, 700);
  };

  const FAQS = [
    {
      q: 'How do I invite travel companions to collaborate?',
      a: 'Log into your TripTailor account, open your active itinerary or trip builder, and click the "Invite Friends" button. You can share your custom invite link or invite co-travelers directly via email. Once they join, they can vote on dining, add activities, and split expenses in real time.',
    },
    {
      q: 'How does the interactive calendar and date picker work?',
      a: 'When building a trip or customizing your journey, simply click the Travel Dates calendar to choose your start and return dates. The system instantly calculates your days, adjusts day-by-day pacing, and dynamically formats your itinerary timeline.',
    },
    {
      q: 'Can I export or print my day-by-day itinerary?',
      a: 'Yes! Inside the Itinerary view, click the "Print & Export" button. You can save your timeline as a clean PDF or print a travel-ready summary with addresses, reservation times, and transit steps for offline use.',
    },
    {
      q: 'What should I do if our group gets stuck while traveling?',
      a: 'Our support team operates 24/7/365. Use the direct phone line (+1 800 555-TRIP) or send a message through this contact form for assistance.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="space-y-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold mb-2">
              <Headphones className="w-3.5 h-3.5" />
              <span>24/7 Traveler Assistance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Get in Touch with TripTailor
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">Questions? Send us a message.</p>
          </div>
        </div>
      </div>

      {/* Quick Contact Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Direct Support Line</h3>
          <p className="text-xs text-slate-500 font-medium">+1 (800) 555-TRIP</p>
          <span className="text-[11px] text-emerald-600 font-bold block">24/7</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Concierge Email</h3>
          <p className="text-xs text-slate-500 font-medium">support@triptailor.app</p>
          <span className="text-[11px] text-slate-500 block">Email support</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Global Hubs</h3>
          <p className="text-xs text-slate-500 font-medium">San Francisco & London</p>
          <span className="text-[11px] text-slate-500 block">Travel support</span>
        </div>
      </div>

      {/* Main Grid: Form & FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Form Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Send Us a Message</h2>
            <p className="text-xs text-slate-500 mt-0.5">We’ll reply by email.</p>
          </div>

          {submittedTicket ? (
            <div className="py-8 px-4 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Message Received!</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Ticket <span className="font-bold text-slate-900">{submittedTicket.id}</span> sent to <span className="font-semibold text-slate-800">{submittedTicket.email}</span>.
                </p>
              </div>
              <button
                onClick={() => setSubmittedTicket(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:bg-white focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:bg-white focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What can we help you with?"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:bg-white focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Detailed Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your travel question, destination request, or issue..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:bg-white focus:border-orange-500 transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Message...' : 'Send Inquiry'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* FAQs and Support Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-orange-600" />
              <span>Frequently Asked Questions</span>
            </h2>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-3.5 text-left bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-900 pr-2">{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-orange-600' : ''
                          }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-3.5 bg-white text-xs text-slate-600 border-t border-slate-100 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guarantee Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>TripTailor Support Guarantee</span>
            </div>
            <p className="text-xs text-emerald-900/80 leading-relaxed">Replies go to your email.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
