import { NavLogo } from './nav-logo';

export function AppTopNav() {
  return (
    <>
      <header className="lg:hidden fixed top-0 inset-x-0 z-[100] border-b border-border/30 bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-center h-16 px-4">
          <NavLogo className="h-10 w-auto" />
        </div>
      </header>
    </>
  );
}
