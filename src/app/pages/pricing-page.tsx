import { useState } from 'react';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { Link } from 'react-router';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

export function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      subheadline: 'Perfect for getting started.',
      features: [
        '1 NFC device',
        '1 URL',
        'Weekly tap analytics email',
        'No login required'
      ],
      buttonText: 'Start For Free',
      buttonVariant: 'filled' as const,
      buttonLink: '/auth'
    },
    {
      name: 'Starter',
      price: { monthly: 15, annual: 150 },
      subheadline: 'For individuals and small businesses ready to do more.',
      features: [
        '1 location',
        'Up to 20 links',
        'Multiple devices',
        '2 campaigns',
        'Tap analytics dashboard'
      ],
      buttonText: 'Get Started',
      buttonVariant: 'filled' as const,
      buttonLink: '/auth'
    },
    {
      name: 'Growth',
      price: { monthly: 150, annual: 1500 },
      subheadline: 'For businesses ready to optimize and outperform.',
      features: [
        'Up to 10 locations and workspaces',
        'Unlimited campaigns',
        'Custom domain',
        'Unified analytics dashboard',
        'Campaign level reporting',
        'Randomizer with split testing analytics'
      ],
      buttonText: 'Get Started',
      buttonVariant: 'filled' as const,
      buttonLink: '/auth',
      badge: 'Most Popular'
    },
    {
      name: 'Enterprise',
      price: null,
      customPrice: 'Let\'s talk.',
      subheadline: 'For multi location businesses ready to connect their entire experience ecosystem.',
      features: [
        'Everything in Growth',
        'Dedicated strategy and support',
        'Custom NFC deployments',
        'Advanced integrations',
        'Built around your operation'
      ],
      buttonText: 'Book a Discovery Call',
      buttonVariant: 'filled' as const,
      buttonLink: '/book-a-call'
    }
  ];

  const formatPrice = (plan: typeof plans[0]) => {
    if (plan.customPrice) return plan.customPrice;
    if (!plan.price) return '$0';
    
    const price = isAnnual ? plan.price.annual : plan.price.monthly;
    if (price === 0) return '$0 / month';
    
    if (isAnnual) {
      return `$${price} / year`;
    }
    return `$${price} / month`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header customNavItems={[
        { label: 'Products', href: 'https://www.blackcollar.io' },
        { label: 'Use Cases', href: '/use-cases' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Book a Call', href: '/book-a-call' },
      ]} />

      <main className="flex-1 pt-20">
        {/* Subtle background pattern for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        {/* Hero Section */}
        <section className="px-4 py-16 sm:py-24 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="mb-6 text-[32px]">
                Simple, Transparent Pricing
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-[16px]">
                Start for free. Upgrade when you're ready.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4">
                <span className={`text-sm ${!isAnnual ? 'font-semibold' : 'text-muted-foreground'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="relative w-14 h-8 bg-muted rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Toggle billing period"
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-black dark:bg-white rounded-full transition-transform ${
                      isAnnual ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${isAnnual ? 'font-semibold' : 'text-muted-foreground'}`}>
                    Annual
                  </span>
                  <span className="bg-black dark:bg-white text-white dark:text-black text-xs px-2 py-1 rounded-full font-semibold">
                    2 Months Free
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className="bg-card/50 backdrop-blur-md rounded-lg p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-shadow relative"
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-black dark:bg-white text-white dark:text-black text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold mb-2">{plan.name}</h2>
                    <div className="text-4xl mb-2">
                      {formatPrice(plan)}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {plan.subheadline}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="text-black dark:text-white flex-shrink-0 mt-0.5">—</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <Link to={plan.buttonLink}>
                      {plan.buttonVariant === 'filled' ? (
                        <Button
                          size="lg"
                          className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-full"
                        >
                          {plan.buttonText}
                          {plan.buttonText !== 'Book a Discovery Call' && (
                            <ArrowRight className="w-5 h-5 ml-2" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-full rounded-full"
                        >
                          {plan.buttonText}
                        </Button>
                      )}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ or Additional Info */}
            <div className="mt-16 text-center">
              <p className="text-muted-foreground">
                All plans include our core features and dedicated support.{' '}
                <Link to="/book-a-call" className="text-primary hover:underline">
                  Questions? Let's talk.
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}