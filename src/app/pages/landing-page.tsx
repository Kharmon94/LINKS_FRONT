import { useState } from 'react';
import { PublicTopNav } from '../components/nav/public-top-nav';
import { PublicBottomNav } from '../components/nav/public-bottom-nav';
import { MOBILE_BOTTOM_NAV_CLEARANCE_CLASS } from '../components/nav/nav-utils';
import { Footer } from '../components/footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Link } from 'react-router';
import { BarChart3, Zap, Shield, Copy, Link2, ArrowRight, ExternalLink, ArrowLeft } from 'lucide-react';
import { apiRequest, ApiError } from '@/services/api';
import { persistAuth, setStoredToken } from '@/lib/auth-storage';
import type { User } from '@/types';

export function LandingPage() {
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    url: '',
    name: '',
    userName: '',
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.url) {
      setCurrentStep(2);
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handleSkipStep2 = () => {
    setCurrentStep(3);
  };

  const handleBackStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await apiRequest<{
        short_url: string;
        short_code: string;
        user?: User;
        token?: string;
      }>('/api/links/create-with-account', {
        method: 'POST',
        body: JSON.stringify({
          url: formData.url,
          name: formData.name || 'My Experience',
          user_name: formData.userName,
          email: formData.email,
        }),
      });

      if (data.token && data.user) persistAuth(data.token, data.user);
      else if (data.token) setStoredToken(data.token);
      setGeneratedLink(data.short_url || `links.blackcollar.io/${data.short_code}`);
      setIsSubmitted(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to create link. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    // Fallback method for copying to clipboard that works in all browsers
    const textArea = document.createElement('textarea');
    textArea.value = generatedLink;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    } finally {
      textArea.remove();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PublicTopNav />
      <PublicBottomNav />

      {/* Hero Section with Multi-Step Form */}
      <main className={`flex-1 pt-20 lg:pt-[73px] ${MOBILE_BOTTOM_NAV_CLEARANCE_CLASS} relative`}>
        {/* Gradient background matching dashboard */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <section className="px-[16px] py-[120px] relative">
          <div className="max-w-3xl mx-auto">
            {!isSubmitted ? (
              <>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-4 text-center">
                  Create a Modern Experience in Seconds
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground mb-8 text-center max-w-2xl mx-auto">Activate your free NFC experience and start tracking.</p>

                {/* Multi-Step Form Card */}
                <div className="p-6 sm:p-8 mb-8">
                  {/* Step 1: Your Link */}
                  {currentStep === 1 && (
                    <form onSubmit={handleStep1Submit} className="space-y-4">
                      <div className="text-center mb-4">
                        
                      </div>
                      
                      <div>
                        <label htmlFor="url" className="block font-medium mb-2 text-[15px] text-center">Enter Your URL                        </label>
                        <Input
                          id="url"
                          type="url"
                          placeholder="https://example.com"
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                          required
                          className="h-12 text-sm w-full rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-12 text-sm rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                      >
                        Next <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>

                      {/* Step Indicator */}
                      <div className="flex items-center justify-center mt-4">
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 1 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-muted text-muted-foreground'}`}>
                            1
                          </div>
                          <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-black dark:bg-white' : 'bg-muted'}`} />
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 2 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-muted text-muted-foreground'}`}>
                            2
                          </div>
                          <div className={`w-12 h-0.5 ${currentStep >= 3 ? 'bg-black dark:bg-white' : 'bg-muted'}`} />
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 3 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-muted text-muted-foreground'}`}>
                            3
                          </div>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Step 2: Name It */}
                  {currentStep === 2 && (
                    <form onSubmit={handleStep2Submit} className="space-y-4">
                      <button
                        type="button"
                        onClick={handleBackStep}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>

                      <div className="text-center mb-4">
                        
                      </div>
                      
                      <div>
                        <label htmlFor="name" className="block font-medium mb-2 text-[15px] text-center">
                          Give it a name (Optional)
                        </label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="My Experience"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-12 text-sm w-full rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-12 text-sm rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
                      >
                        Next <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>

                      <button
                        type="button"
                        onClick={handleSkipStep2}
                        className="w-full text-sm text-center text-muted-foreground hover:text-foreground underline"
                      >
                        Skip
                      </button>

                      {/* Step Indicator */}
                      <div className="flex items-center justify-center mt-4">
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 1 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-muted text-muted-foreground'}`}>
                            1
                          </div>
                          <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-black dark:bg-white' : 'bg-muted'}`} />
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 2 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-muted text-muted-foreground'}`}>
                            2
                          </div>
                          <div className={`w-12 h-0.5 ${currentStep >= 3 ? 'bg-black dark:bg-white' : 'bg-muted'}`} />
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 3 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-muted text-muted-foreground'}`}>
                            3
                          </div>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Step 3: Almost Done */}
                  {currentStep === 3 && (
                    <form onSubmit={handleFinalSubmit} className="space-y-4">
                      <button
                        type="button"
                        onClick={handleBackStep}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>

                      <div className="text-center mb-4">
                        
                      </div>
                      
                      <div>
                        <label htmlFor="userName" className="block font-medium mb-2 text-[15px] text-center">
                          Your Name
                        </label>
                        <Input
                          id="userName"
                          type="text"
                          placeholder="Jane Smith"
                          value={formData.userName}
                          onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                          required
                          className="h-12 text-sm w-full rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block font-medium mb-2 text-[15px] text-center">
                          Your Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="h-12 text-sm w-full rounded-full bg-muted border-0 focus:ring-0 focus:outline-none"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full h-12 text-sm rounded-full bg-white text-black hover:bg-white/90"
                      >
                        {isLoading ? 'Creating...' : 'Create Your Experience'} <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>

                      {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                      )}

                      {/* Step Indicator */}
                      <div className="flex items-center justify-center mt-4">
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 1 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-muted text-muted-foreground'}`}>
                            1
                          </div>
                          <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-black dark:bg-white' : 'bg-muted'}`} />
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 2 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-muted text-muted-foreground'}`}>
                            2
                          </div>
                          <div className={`w-12 h-0.5 ${currentStep >= 3 ? 'bg-black dark:bg-white' : 'bg-muted'}`} />
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 3 ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-muted text-muted-foreground'}`}>
                            3
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Confirmation Screen */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-8 text-center">
                  Your Experience is Almost Live
                </h1>

                {/* Link Box with Copy */}
                <div className="bg-card/50 backdrop-blur-md rounded-lg p-6 mb-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center justify-between gap-4">
                    <code className="flex-1 text-primary font-medium text-lg break-all">{generatedLink}</code>
                    <button
                      onClick={copyToClipboard}
                      className="p-3 hover:bg-muted rounded-full transition-colors shrink-0"
                      aria-label="Copy link"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                  {copySuccess && (
                    <p className="text-sm text-muted-foreground mt-2 text-center">Copied!</p>
                  )}
                </div>

                {/* Activation Steps */}
                <div className="bg-card/50 backdrop-blur-md rounded-lg p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                  <h2 className="text-2xl font-semibold mb-6 text-center">To activate tracking analytics:</h2>

                  {/* Step 1: Program NFC */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-3">
                      📲 Program your NFC device
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      Ready to program your device? Follow our simple guide to get your NFC product live in minutes.
                    </p>
                    <a 
                      href="https://www.blackcollar.io/blogs/programming-guides"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-full">
                        View Programming Guide <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </a>
                  </div>

                  {/* Step 2: Confirm Email */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">
                      📧 Confirm your email
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Check your inbox and confirm your email address to start receiving your weekly tap insights.
                    </p>
                  </div>

                  {/* Help Text */}
                  <div className="text-center mt-8 pt-6 border-t border-muted">
                    <p className="text-sm text-muted-foreground">
                      Need help? Email us at <a href="mailto:info@blackcollar.io" className="text-primary hover:underline">info@blackcollar.io</a>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}