'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Check if we're in user routes or order confirmation
  const isUserRoute = pathname.startsWith('/profile') || pathname.startsWith('/address') || pathname.startsWith('/order/confirmation') || pathname.startsWith('/orders')
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Always fixed on desktop, hidden on mobile for user routes */}
      <div className={`${isUserRoute ? 'hidden lg:block' : ''} lg:fixed lg:top-0 lg:left-0 lg:right-0 lg:z-40`}>
        <Header />
      </div>
      
      {/* Main content area */}
      <main className={`flex-1 relative ${isUserRoute ? 'lg:pt-24' : 'lg:pt-32'}`}>
        {children}
      </main>
      
      {/* Footer - Hide completely for user routes */}
      {!isUserRoute && (
        <div>
          <Footer />
        </div>
      )}
    </div>
  )
}

