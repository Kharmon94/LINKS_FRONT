import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { PublicTopNav } from '../components/nav/public-top-nav';
import { PublicBottomNav } from '../components/nav/public-bottom-nav';
import { MOBILE_BOTTOM_NAV_CLEARANCE_CLASS } from '../components/nav/nav-utils';
import { Footer } from '../components/footer';
import { Link } from 'react-router';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';
import { useAuth } from '../contexts/auth-context';
import { fetchPlans, createCheckoutSession } from '@/services/billing-api';
import type { PlanJson } from '@/types';
import { ApiError } from '@/services/api';

const STATIC_PLANS: PlanJson[] = [
  {
    tier: 'free',
    name: 'Free',
    prices: { monthly: 0, yearly: 0 },
    features: ['1 link', 'Weekly tap analytics email', 'Basic analytics'],
    checkout: false,
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    prices: null,
    features: ['Everything in Pro', 'Dedicated strategy and support', 'Custom NFC deployments'],
    checkout: false,
    salesLed: true,
  },
];

const PRO_FALLBACK: PlanJson = {
  tier: 'pro',
  name: 'Pro',
  prices: { monthly: 50, yearly: 500 },
  features: [
    'Unlimited links & campaigns',
    'Custom domain',
    'Workspaces & team',
    'Advanced analytics',
    'Randomizer split testing',
  ],
  checkout: true,
};

export function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [apiPlans, setApiPlans] = useState<PlanJson[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutTier, setCheckoutTier] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPlans();
        if (!cancelled) setApiPlans(data.plans);
      } catch {
        if (!cancelled) setApiPlans([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const proPlan = apiPlans.find((p) => p.tier === 'pro') ?? PRO_FALLBACK;

  const plans = [STATIC_PLANS[0], proPlan, STATIC_PLANS[1]];

  const handlePlanClick = async (plan: PlanJson) => {
    if (plan.salesLed) {
      navigate('/book-a-call');
      return;
    }
    if (plan.tier === 'free') {
      navigate(isAuthenticated ? '/links' : '/auth');
      return;
    }
    if (!isAuthenticated) {
      navigate(`/auth?returnTo=${encodeURIComponent('/pricing')}`);
      return;
    }
    const priceId = isAnnual ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
    if (!priceId) {
      toast.error('This plan is not configured yet. Contact support.');
      return;
    }
    setCheckoutTier(plan.tier);
    try {
      const { url } = await createCheckoutSession(priceId);
      window.location.href = url;
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not start checkout';
      toast.error(msg);
      setCheckoutTier(null);
    }
  };

  const formatPrice = (plan: PlanJson) => {
    if (plan.salesLed) return "Let's talk.";
    if (!plan.prices) return '$0';
    const price = isAnnual ? plan.prices.yearly : plan.prices.monthly;
    if (price === 0) return '$0';
    return isAnnual ? `$${price}/yr` : `$${price}/mo`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PublicTopNav />
      <PublicBottomNav />

      <main className={`flex-1 pt-20 lg:pt-[73px] ${MOBILE_BOTTOM_NAV_CLEARANCE_CLASS}`}>
        <section className="px-4 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl mb-4">Simple, Transparent Pricing</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the plan that fits your business. Upgrade anytime.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={!isAnnual ? 'font-medium' : 'text-muted-foreground'}>Monthly</span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${isAnnual ? 'bg-black dark:bg-white' : 'bg-muted'}`}
              aria-label="Toggle annual pricing"
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white dark:bg-black transition-transform ${isAnnual ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <span className={isAnnual ? 'font-medium' : 'text-muted-foreground'}>
              Annual <span className="text-xs text-green-600">(save ~17%)</span>
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.tier}
                  className={`relative bg-card/50 backdrop-blur-md rounded-2xl p-6 border ${plan.tier === 'pro' ? 'border-primary shadow-lg' : 'border-border'}`}
                >
                  {plan.tier === 'pro' && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-xs px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                  <p className="text-2xl font-bold mb-4">{formatPrice(plan)}</p>
                  <ul className="space-y-2 mb-6">
                    {(plan.features || []).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full rounded-full"
                    variant={plan.tier === 'pro' ? 'default' : 'outline'}
                    disabled={checkoutTier === plan.tier}
                    onClick={() => void handlePlanClick(plan)}
                  >
                    {checkoutTier === plan.tier ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : plan.salesLed ? (
                      'Book a Discovery Call'
                    ) : plan.tier === 'free' ? (
                      'Start For Free'
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{' '}
            <Link to="/auth" className="text-foreground underline">Sign in</Link>
          </p>
        </div>
        </section>
      </main>

      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  );
}
