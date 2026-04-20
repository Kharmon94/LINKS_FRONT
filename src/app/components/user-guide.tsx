import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  targetElement?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: 'Welcome to Blackcollar.io!',
    description: 'Let\'s take a quick tour of the platform. This tutorial will show you how to create and manage your links.',
    position: 'center',
  },
  {
    id: 2,
    title: 'Create Your First Link',
    description: 'Use this form to create shortened links. Simply paste your destination URL and click "Shorten Link". You can create single links or randomizers that rotate between multiple URLs.',
    targetElement: 'link-creator-form',
    position: 'bottom',
  },
  {
    id: 3,
    title: 'Customize Your Links',
    description: 'Click "Customize" to add a custom slug, select a domain, and add UTM parameters for tracking. This gives you full control over your shortened URLs.',
    targetElement: 'customize-button',
    position: 'top',
  },
  {
    id: 4,
    title: 'View Recent Links',
    description: 'All your created links appear here with click analytics. Click on any link card to view detailed analytics and edit settings.',
    targetElement: 'recent-links-section',
    position: 'top',
  },
  {
    id: 5,
    title: 'Manage Campaigns',
    description: 'Organize your links into campaigns for better tracking. Campaigns let you group related links and see aggregate analytics.',
    targetElement: 'recent-campaigns-section',
    position: 'top',
  },
  {
    id: 6,
    title: 'Navigation Sidebar',
    description: 'Use the sidebar to navigate between Dashboard, Links, Campaigns, Analytics, and Settings. Access everything you need from here.',
    targetElement: 'app-sidebar',
    position: 'right',
  },
  {
    id: 7,
    title: 'You\'re All Set!',
    description: 'You\'re ready to start creating and tracking links. You can restart this tutorial anytime from your Settings page.',
    position: 'center',
  },
];

export function UserGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Check if user has completed the tutorial
    const hasCompletedTutorial = localStorage.getItem('blackcollar_tutorial_completed');
    
    // Auto-open tutorial for new users after a short delay
    if (!hasCompletedTutorial) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      // Clear highlight when tutorial is closed
      if (highlightedElement) {
        highlightedElement.style.position = '';
        highlightedElement.style.zIndex = '';
      }
      setHighlightedElement(null);
      return;
    }

    const step = tutorialSteps[currentStep];
    
    // Remove previous highlight
    if (highlightedElement) {
      highlightedElement.style.position = '';
      highlightedElement.style.zIndex = '';
    }

    // Add highlight to target element
    if (step.targetElement) {
      const element = document.getElementById(step.targetElement);
      if (element) {
        element.style.position = 'relative';
        element.style.zIndex = '1001';
        setHighlightedElement(element);
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, isOpen]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTutorial = () => {
    localStorage.setItem('blackcollar_tutorial_completed', 'true');
    setIsOpen(false);
    setCurrentStep(0);
  };

  const skipTutorial = () => {
    localStorage.setItem('blackcollar_tutorial_completed', 'true');
    setIsOpen(false);
    setCurrentStep(0);
  };

  const restartTutorial = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={restartTutorial}
        variant="outline"
        size="sm"
        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg"
      >
        Tutorial
      </Button>
    );
  }

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
        onClick={skipTutorial}
      />

      {/* Tutorial Card */}
      <div
        className={`fixed z-[1002] bg-card/95 backdrop-blur-md rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 ${
          step.position === 'center'
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            : step.position === 'top'
            ? 'top-24 left-1/2 -translate-x-1/2'
            : step.position === 'bottom'
            ? 'bottom-24 left-1/2 -translate-x-1/2'
            : step.position === 'left'
            ? 'left-24 top-1/2 -translate-y-1/2'
            : 'right-24 top-1/2 -translate-y-1/2'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={skipTutorial}
          className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Step {currentStep + 1} of {tutorialSteps.length}
          </p>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            onClick={handlePrevious}
            variant="outline"
            size="sm"
            disabled={currentStep === 0}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep === tutorialSteps.length - 1 ? (
            <Button
              onClick={completeTutorial}
              size="sm"
              className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Finish
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              size="sm"
              className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Skip Option */}
        <button
          onClick={skipTutorial}
          className="w-full text-xs text-center text-muted-foreground hover:text-foreground mt-4 underline"
        >
          Skip tutorial
        </button>
      </div>

      {/* Highlight Ring for Target Element */}
      {highlightedElement && (
        <div
          className="fixed pointer-events-none z-[1001]"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 8,
            left: highlightedElement.getBoundingClientRect().left - 8,
            width: highlightedElement.getBoundingClientRect().width + 16,
            height: highlightedElement.getBoundingClientRect().height + 16,
            border: '3px solid hsl(var(--primary))',
            borderRadius: '12px',
            boxShadow: '0 0 0 4px hsl(var(--primary) / 0.2)',
          }}
        />
      )}
    </>
  );
}
