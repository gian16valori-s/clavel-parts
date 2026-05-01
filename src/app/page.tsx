'use client'

import { useAppStore } from '@/lib/cartStore'

import Topbar           from '@/components/layout/Topbar'
import Navbar           from '@/components/layout/Navbar'
import Footer           from '@/components/layout/Footer'
import HeroSection      from '@/components/hero/HeroSection'
import LetterSection    from '@/components/sections/LetterSection'
import CategoryGrid     from '@/components/catalog/CategoryGrid'
import HowItWorks       from '@/components/sections/HowItWorks'
import CommunitySection from '@/components/sections/CommunitySection'
import WaitlistSection  from '@/components/sections/WaitlistSection'
import ResultsGrid      from '@/components/results/ResultsGrid'
import CartPage         from '@/components/cart/CartPage'
import GaragePage       from '@/components/garage/GaragePage'
import RacersEdgeHome   from '@/components/racers-edge/RacersEdgeHome'
import RacersEdgePage   from '@/components/racers-edge/RacersEdgePage'
import ChatBot          from '@/components/ui/ChatBot'

export default function Home() {
  const { currentView } = useAppStore()

  return (
    <>
      {/* ── Overlay views ── */}
      {currentView === 'results'     && <ResultsGrid />}
      {currentView === 'cart'        && <CartPage />}
      {currentView === 'garage'      && <GaragePage />}
      {currentView === 'racers-edge-home'    && <RacersEdgeHome />}
      {currentView === 'racers-edge-catalog' && <RacersEdgePage />}

      {/* ── Landing (visible solo en home) ── */}
      <div style={{ display: currentView === 'home' ? 'block' : 'none' }}>
        <Topbar />
        <Navbar />
        <main>
          <HeroSection />
          <LetterSection />
          <CategoryGrid />
          <HowItWorks />
          <CommunitySection />
          <WaitlistSection />
        </main>
        <Footer />
      </div>

      {/* ── Chatbot (siempre visible excepto en garage) ── */}
      {currentView !== 'garage' && <ChatBot />}
    </>
  )
}
