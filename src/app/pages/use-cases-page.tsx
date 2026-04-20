import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { Link } from 'react-router';
import { 
  Sparkles, 
  BarChart3, 
  Target, 
  Share2,
  ArrowRight,
  Check,
  Shuffle
} from 'lucide-react';
import { Button } from '../components/ui/button';

export function UseCasesPage() {
  const pillars = [
    {
      icon: Sparkles,
      title: 'Stand Out',
      description: 'For businesses and individuals alike — create a modern experience that makes you unforgettable the moment someone gets close.',
      features: [
        'Custom branded NFC products',
        'Instant smartphone activation',
        'No app required'
      ]
    },
    {
      icon: BarChart3,
      title: 'Capture Insights',
      description: 'Every tap tells a story. Know exactly what\'s working in real time.',
      features: [
        'Real time tap analytics',
        'Multi location dashboards',
        'Campaign level reporting'
      ]
    },
    {
      icon: Target,
      title: 'Make Smarter Decisions',
      description: 'Your data works for you around the clock so you never have to guess.',
      features: [
        'Real time engagement tracking',
        'Device and location breakdowns',
        'Actionable daily insights'
      ]
    }
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
        {/* Subtle background pattern for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        {/* Hero Section */}
        <section className="px-4 py-16 sm:py-24 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="mb-6 text-[32px]">
                A Modern Experience for Every Person and Every Business
              </h1>
              <p className="text-muted-foreground max-w-4xl mx-auto text-[16px]">
                Smart NFC products that help you stand out, capture insights, and make smarter decisions every day.
              </p>
            </div>

            {/* Pillars Grid - 3 columns */}
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div 
                    key={pillar.title}
                    className="bg-card/50 backdrop-blur-md rounded-lg p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-black dark:bg-white text-white dark:text-black p-3 rounded-lg">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-semibold">{pillar.title}</h2>
                    </div>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {pillar.description}
                    </p>

                    <ul className="space-y-3">
                      {pillar.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <span className="text-black dark:text-white flex-shrink-0 mt-0.5">—</span>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 sm:py-24 relative bg-background">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mb-6 text-[32px]">
              Ready to create a modern experience?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              Let's talk about what's possible for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 px-8 rounded-full">
                  Start For Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/book-a-call">
                <Button size="lg" variant="outline" className="px-8 rounded-full">
                  Book a Discovery Call
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}