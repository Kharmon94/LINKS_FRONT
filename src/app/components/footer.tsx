import logo from '@/assets/13a610c2eb52d37dcdb23da9c6c27891d7b11cf3.png';
import { cn } from './ui/utils';

type FooterProps = {
  className?: string;
};

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('shadow-sm bg-background', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <div className="flex items-center gap-4">
            
          </div>
          
          <p className="text-sm text-muted-foreground">© 2026 BlackCollar.io. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}