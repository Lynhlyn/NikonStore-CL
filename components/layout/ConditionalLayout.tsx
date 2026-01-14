'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'
import BottomBanner from '@/components/banner/BottomBanner'
import SideBanners from '@/components/banner/SideBanners'
import { Toaster } from 'sonner'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  const isUserRoute = pathname.startsWith('/profile') || pathname.startsWith('/address') || pathname.startsWith('/order/confirmation') || pathname.startsWith('/orders') || pathname.startsWith('/sessions')
  
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="bottom-right" richColors />
      <div className={`${isUserRoute ? 'hidden lg:block' : ''} lg:fixed lg:top-0 lg:left-0 lg:right-0 lg:z-40`}>
        <Header />
      </div>
      
      <main className={`flex-1 relative ${isUserRoute ? 'lg:pt-24' : 'lg:pt-32'}`}>
        {!isUserRoute ? (
          <div className="relative">
            <div className="hidden xl:flex xl:justify-between xl:gap-4 xl:max-w-[1920px] xl:mx-auto xl:px-4">
              <aside className="xl:w-[200px] xl:shrink-0">
                <div className="xl:sticky xl:top-32">
                  <SideBanners position={3} />
                </div>
              </aside>
              
              <div className="xl:flex-1 xl:min-w-0">
                {children}
              </div>
              
              <aside className="xl:w-[200px] xl:shrink-0">
                <div className="xl:sticky xl:top-32">
                  <SideBanners position={1} />
                </div>
              </aside>
            </div>
            
            <div className="xl:hidden">
              {children}
            </div>
          </div>
        ) : (
          children
        )}
      </main>
      
      {!isUserRoute && <BottomBanner />}
      
      {!isUserRoute && (
        <div>
          <Footer />
        </div>
      )}
    </div>
  )
}

