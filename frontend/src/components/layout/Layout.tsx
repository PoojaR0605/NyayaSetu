import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export default function Layout({ children, showFooter = true, maxWidth = 'full' }: LayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-none',
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className={`${maxWidth !== 'full' ? `${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-8` : ''}`}>
          {children}
        </div>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
