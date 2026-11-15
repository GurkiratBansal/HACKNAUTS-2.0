// FRESH:FILE  Landing page assembling Phase 1 components: hero, sector tiles, tabs, problem cards, stats & chart, SDGs, CTA.
// FRESH:AREA  Layout

import { useApp } from '../context/AppContext'
import Hero from '../components/home/Hero'
import SectorTiles from '../components/home/SectorTiles'
import WhoUsesFreshTabs from '../components/home/WhoUsesFreshTabs'
import ProblemCardsAndMintBand from '../components/home/ProblemCardsAndMintBand'
import ImpactStatsAndChart from '../components/home/ImpactStatsAndChart'
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
      <Reveal delay={60}>
        <SectorTiles />
      </Reveal>
      <Reveal delay={100}>
        <WhoUsesFreshTabs />
      </Reveal>
      <Reveal delay={100}>
        <ProblemCardsAndMintBand />
      </Reveal>
      <Reveal delay={120}>
        <ImpactStatsAndChart />
      </Reveal>
      <Reveal delay={140}>
        <SdgGrid />
      </Reveal>
      <Reveal delay={160}>
        <ClosingCta donorTarget={donorTarget} ngoTarget={ngoTarget} />
      </Reveal>
    </main>
  )
}
