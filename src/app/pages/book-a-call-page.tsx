import { useState, useEffect } from 'react';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { Calendar, Clock, Video, CheckCircle2 } from 'lucide-react';

export function BookACallPage() {
  useEffect(() => {
    // Load the calendar embed script
    const script = document.createElement('script');
    script.src = 'https://link.msgsndr.com/js/form_embed.js';
    script.type = 'text/javascript';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const benefits = [
    'Personalized demo of Blackcollar.io',
    'Custom solutions for your team',
    'Pricing and plan recommendations',
    'Migration support from other tools',
    'Q&A with our product experts'
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header customNavItems={[
        { label: 'Products', href: 'https://www.blackcollar.io' },
        { label: 'Use Cases', href: '/use-cases' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Book a Call', href: '/book-a-call' },
      ]} />

      <main className="flex-1 pt-20">
        <section className="px-4 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6">
                Schedule a Demo
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                Let's discuss how Blackcollar.io can help your team manage and track links more effectively.
              </p>
            </div>

            {/* Calendar Embed Section - Full Width */}
            <div className="mb-12 max-w-4xl mx-auto">
              <iframe 
                src="https://api.leadconnectorhq.com/widget/booking/QOoP6tOpWTUv7cOQzdwp" 
                style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '600px' }} 
                scrolling="no" 
                id="QOoP6tOpWTUv7cOQzdwp_1773256871432"
                title="Book a Call Calendar"
              />
            </div>

            {/* What to Expect Section - Below Calendar */}
            <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* What to Expect */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">What to Expect</h2>
                <ul className="space-y-4">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call Details */}
              <div className="bg-card/50 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-muted rounded-lg p-3">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">30-45 Minutes</h3>
                    <p className="text-sm text-muted-foreground">
                      Enough time for a thorough demo and Q&A
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-muted rounded-lg p-3">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Video Call</h3>
                    <p className="text-sm text-muted-foreground">
                      We'll send you a meeting link via email
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-muted rounded-lg p-3">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Flexible Scheduling</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a time that works for your schedule
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}