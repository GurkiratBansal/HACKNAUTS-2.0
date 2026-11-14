import { useApp } from '../context/AppContext'
import Hero from '../components/home/Hero'
import HowItWorks from '../components/home/HowItWorks'
import AlertShowcase from '../components/home/AlertShowcase'
import ImpactBand from '../components/home/ImpactBand'
import SdgGrid from '../components/home/SdgGrid'
import ClosingCta from '../components/home/ClosingCta'

export default function Home() {
  const { impact, currentUser } = useApp()
  const donorTarget = currentUser?.role === 'donor' ? '/donor/add' : '/login?role=donor'
  const ngoTarget = currentUser?.role === 'ngo' ? '/ngo' : '/login?role=ngo'

  return (
    <main>
      <Hero impact={impact} donorTarget={donorTarget} ngoTarget={ngoTarget} />
      <HowItWorks />
      <AlertShowcase />
      <ImpactBand impact={impact} />
      <SdgGrid />
      <ClosingCta donorTarget={donorTarget} ngoTarget={ngoTarget} />
    </main>
  )
}
