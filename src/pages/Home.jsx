// FRESH:FILE  Landing page assembling hero, how-it-works, impact and demo sections.
// FRESH:AREA  Layout

import { useApp } from '../context/AppContext'
import Hero from '../components/home/Hero'
import HowItWorks from '../components/home/HowItWorks'
import AlertShowcase from '../components/home/AlertShowcase'
import ImpactBand from '../components/home/ImpactBand'
import SdgGrid from '../components/home/SdgGrid'
import ClosingCta from '../components/home/ClosingCta'
import Reveal from '../components/Reveal'

export default function Home() {
  const { impact, currentUser } = useApp()
  const donorTarget = currentUser?.role === 'donor' ? '/donor/add' : '/login?role=donor'
  const ngoTarget = currentUser?.role === 'ngo' ? '/ngo' : '/login?role=ngo'

  return (
    <main>
      <Reveal className="fresh-reveal--hero">
        <Hero impact={impact} donorTarget={donorTarget} ngoTarget={ngoTarget} />
      </Reveal>
      <Reveal delay={80}>
        <HowItWorks />
      </Reveal>
      <Reveal delay={140}>
        <AlertShowcase />
      </Reveal>
      <Reveal delay={80}>
        <ImpactBand impact={impact} />
      </Reveal>
      <Reveal delay={140}>
        <SdgGrid />
      </Reveal>
      <Reveal delay={180}>
        <ClosingCta donorTarget={donorTarget} ngoTarget={ngoTarget} />
      </Reveal>
    </main>
  )
}
