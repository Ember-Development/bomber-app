import { useState } from 'react';
import MainNav from '@/components/layout/MainNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import { submitContact } from '@/api/contact';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqCategory, setFaqCategory] = useState<'general' | 'store'>(
    'general'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      await submitContact(formData);

      // Show success message
      alert(
        'Thank you for contacting us! We will get back to you as soon as possible. A confirmation email has been sent to your email address.'
      );

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert(
        'There was an error sending your message. Please try again or contact us directly at bo@bombersfastpitch.net'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const faqs = [
    {
      question: 'How do I register my daughter for tryouts?',
      answer:
        'The Bombers Hold an Organizational Tryout once a year in mid-August. We will post dates and times on social media and on www.bombersoftballcamps.com',
    },
    {
      question: 'What age groups do the Bombers offer?',
      answer:
        'The Bombers Fastpitch organization offers teams for various Age Groups-Bombers Fastpitch has teams from 8u-18u. Check our Teams page for current team rosters and age divisions.',
    },
    {
      question: 'What is the commitment level for Bombers teams?',
      answer:
        'The commitment level varies by team and age group. Teams play together for a full season from September through August. ',
    },
    {
      question: 'How much does it cost to play for the Bombers?',
      answer:
        'Each Team is different based on age and team goals. Please consult the head coach of the team you are interested in to confirm pricing.',
    },
    {
      question: 'What makes the Bombers Academy program different?',
      answer:
        'Academy teams train together and play a predetermined schedule set by the Academy Director. ',
    },
    {
      question: "How do I contact my daughter's coach?",
      answer:
        'Each team page includes coach contact information. You can find your team on our Teams page and view the coaching staff details there. For general inquiries, use the contact form on this page.',
    },
    {
      question: 'What is your refund policy?',
      answer: 'please see store FAQ',
    },
  ];

  const storeFaqs = [
    {
      question: 'Do you have a retail location?',
      answer:
        'We do not have a retail location. Items ordered are not made until after the order is placed.',
    },
    {
      question: 'Can I pick up my order and avoid shipping charges?',
      answer:
        'We do not have a retail location or staffing to allow this. You can qualify for free shipping with orders over $100.',
    },
    {
      question:
        'I am trying to place an order and it will not let me put size in.',
      answer: 'If you cannot add size, the product is currently out of stock.',
    },
    {
      question: 'How long does it take to get my order?',
      answer:
        'Orders typically ship out via UPS in 7-10 days. Weekends, holidays or weather could delay orders.',
    },
    {
      question: 'Can I order custom items for my team?',
      answer: 'Please go to Contact Us and put your request in the Notes.',
    },
    {
      question: 'Returns/Cancel Order',
      answer:
        'There is a 15% restocking fee on all returned/cancelled orders. Please go to Contact us and put in notes the items to return and you will be emailed instructions.',
    },
  ];

  return (
    <div className="relative bg-neutral-950 min-h-screen overflow-x-hidden">
      <MainNav />
      <SocialSidebar />

      <main className="relative z-20 pt-32 pb-20 overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 mb-4 rounded-full bg-gradient-to-r from-[#57a4ff]/20 to-[#3b8aff]/20 px-4 py-1.5 backdrop-blur-sm border border-[#57a4ff]/30">
              <div className="h-1.5 w-1.5 rounded-full bg-[#57a4ff] animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-[#57a4ff] uppercase">
                Get In Touch
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6">
              <span className="bg-gradient-to-br from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent drop-shadow-2xl">
                CONTACT
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(87,164,255,0.5)]">
                US
              </span>
            </h1>
            <p className="text-neutral-400 text-lg md:text-xl max-w-3xl mx-auto">
              Have questions? We're here to help. Fill out the form below or
              check our FAQ section.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="relative overflow-hidden">
              {/* Glow orb */}
              <div className="absolute -top-10 left-0 md:-left-10 w-48 md:w-64 h-48 md:h-64 bg-[#57a4ff]/10 rounded-full blur-3xl" />

              <div className="relative bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 backdrop-blur-sm rounded-2xl border border-[#57a4ff]/20 p-6 md:p-8 shadow-2xl">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-6 uppercase tracking-wider">
                  Send us a message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider"
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                      placeholder="(123) 456-7890"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider"
                    >
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300"
                      placeholder="What is this regarding?"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-bold text-white/80 mb-2 uppercase tracking-wider"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 bg-neutral-950/50 border border-[#57a4ff]/30 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#57a4ff] focus:ring-1 focus:ring-[#57a4ff] transition-all duration-300 resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(87,164,255,0.6)] transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10">
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </span>
                    {!isSubmitting && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="relative overflow-hidden">
              {/* Glow orb */}
              <div className="absolute -top-10 right-0 md:-right-10 w-48 md:w-64 h-48 md:h-64 bg-[#3b8aff]/10 rounded-full blur-3xl" />

              <div className="relative">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-6 uppercase tracking-wider">
                  Frequently Asked Questions
                </h2>

                {/* FAQ Category Tabs */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => {
                      setFaqCategory('general');
                      setOpenFaq(null);
                    }}
                    className={`flex-1 px-6 py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all duration-300 ${
                      faqCategory === 'general'
                        ? 'bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white shadow-[0_0_20px_rgba(87,164,255,0.4)]'
                        : 'bg-neutral-900/50 text-neutral-400 border border-[#57a4ff]/20 hover:border-[#57a4ff]/40 hover:text-white'
                    }`}
                  >
                    General FAQ
                  </button>
                  <button
                    onClick={() => {
                      setFaqCategory('store');
                      setOpenFaq(null);
                    }}
                    className={`flex-1 px-6 py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all duration-300 ${
                      faqCategory === 'store'
                        ? 'bg-gradient-to-r from-[#57a4ff] via-[#6bb0ff] to-[#57a4ff] text-white shadow-[0_0_20px_rgba(87,164,255,0.4)]'
                        : 'bg-neutral-900/50 text-neutral-400 border border-[#57a4ff]/20 hover:border-[#57a4ff]/40 hover:text-white'
                    }`}
                  >
                    Store FAQ
                  </button>
                </div>

                {/* FAQ List */}
                <div className="space-y-3">
                  {(faqCategory === 'general' ? faqs : storeFaqs).map(
                    (faq, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 backdrop-blur-sm rounded-xl border border-[#57a4ff]/20 overflow-hidden transition-all duration-300 hover:border-[#57a4ff]/40"
                      >
                        <button
                          onClick={() =>
                            setOpenFaq(openFaq === index ? null : index)
                          }
                          className="w-full px-6 py-4 flex items-start justify-between gap-4 text-left transition-all duration-300"
                        >
                          <span className="font-bold text-white text-sm md:text-base">
                            {faq.question}
                          </span>
                          <svg
                            className={`w-5 h-5 text-[#57a4ff] flex-shrink-0 transition-transform duration-300 ${
                              openFaq === index ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {openFaq === index && (
                          <div className="px-6 pb-4 pt-0">
                            <div className="border-t border-[#57a4ff]/20 pt-4">
                              <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 backdrop-blur-sm rounded-xl border border-[#57a4ff]/20 p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#57a4ff]/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#57a4ff]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-white mb-2 uppercase tracking-wider">
                Email
              </h3>
              <a
                href="mailto:info@bombersfastpitch.com"
                className="text-neutral-400 hover:text-[#57a4ff] transition-colors duration-300"
              >
                bo@bombersfastpitch.com
              </a>
            </div>

            {/* <div className="bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 backdrop-blur-sm rounded-xl border border-[#57a4ff]/20 p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#57a4ff]/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#57a4ff]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-white mb-2 uppercase tracking-wider">
                Phone
              </h3>
              <a
                href="tel:+15551234567"
                className="text-neutral-400 hover:text-[#57a4ff] transition-colors duration-300"
              >
                (555) 123-4567
              </a>
            </div> */}

            <div className="bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 backdrop-blur-sm rounded-xl border border-[#57a4ff]/20 p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#57a4ff]/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#57a4ff]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-white mb-2 uppercase tracking-wider">
                Location
              </h3>
              <p className="text-neutral-400">New Braunfels, TX</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
