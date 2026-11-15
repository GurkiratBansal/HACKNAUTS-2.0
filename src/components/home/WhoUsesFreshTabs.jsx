// FRESH:FILE  WAI-ARIA accessible segmented tabs for "Who uses FRESH" with split light card.
// FRESH:AREA  Layout

import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Users } from 'lucide-react'

const TABS = [
  {
    id: 'weddings',
    label: 'Wedding halls',
    chip: 'Event Catering',
    title: 'Post-reception surplus routed before midnight',
    scenario:
      'Example scenario: A wedding banquet finishes at 10:30 PM with 85 unserved portions of biryani and paneer. The coordinator uploads photo and sets a 2-hour window. A nearby shelter claims it in 8 minutes and arrives via the suggested road route.',
    actionText: 'List event food',
    actionTo: '/donor/add',
    svg: (
      <svg viewBox="0 0 280 200" fill="none" className="w-full max-w-[260px] mx-auto text-[#0A7A5C] dark:text-[#3EE6B8]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="20" y="40" width="240" height="130" rx="12" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="80" cy="95" r="30" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
        <path d="M70 95H90M80 85V105" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M130 85H220M130 105H195" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="130" y="125" width="70" height="20" rx="6" fill="#19C8D8" fillOpacity="0.25" stroke="#19C8D8" strokeWidth="1.2" />
        <text x="142" y="139" fill="currentColor" fontSize="10" fontWeight="bold">VERIFIED</text>
      </svg>
    ),
  },
  {
    id: 'restaurants',
    label: 'Restaurants',
    chip: 'Commercial Kitchens',
    title: 'Daily shift-end trays redirected without delays',
    scenario:
      'Example scenario: A high-volume restaurant packs 24 fresh curry meals at closing. Rather than discarding prepared trays, staff lists the item count in under 60 seconds. A verified volunteer group accepts and collects immediately.',
    actionText: 'List restaurant surplus',
    actionTo: '/donor/add',
    svg: (
      <svg viewBox="0 0 280 200" fill="none" className="w-full max-w-[260px] mx-auto text-[#0A7A5C] dark:text-[#3EE6B8]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="20" y="40" width="240" height="130" rx="12" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" />
        <path d="M60 120V75C60 70 65 65 70 65H90C95 65 100 70 100 75V120H60Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M80 120V140M65 140H95" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M130 80H225M130 100H200M130 120H170" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'kitchens',
    label: 'Community kitchens',
    chip: 'Community Langar',
    title: 'Large-batch distribution to nearby neighborhood shelters',
    scenario:
      'Example scenario: A Gurudwara or temple community kitchen produces excess daal and roti batches after lunch service. Listing the 120 servings alerts three local care homes, coordinating multiple pickups seamlessly.',
    actionText: 'Donate batch meals',
    actionTo: '/donor/add',
    svg: (
      <svg viewBox="0 0 280 200" fill="none" className="w-full max-w-[260px] mx-auto text-[#0A7A5C] dark:text-[#3EE6B8]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="20" y="40" width="240" height="130" rx="12" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" />
        <path d="M50 115C50 135 75 145 100 145C125 145 150 135 150 115H50Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M75 95C75 80 85 75 85 65M100 95C100 80 110 75 110 65M125 95C125 80 135 75 135 65" stroke="#19C8D8" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M175 85H230M175 105H215" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'events',
    label: 'Events',
    chip: 'Conferences & Expos',
    title: 'Packaged boxed meals claimed during afternoon intervals',
    scenario:
      'Example scenario: A technology conference ordered 150 boxed meals but 40 remain untouched and chilled. The event manager posts the packaged items, enabling an NGO partner within 4 km to distribute them directly.',
    actionText: 'List conference food',
    actionTo: '/donor/add',
    svg: (
      <svg viewBox="0 0 280 200" fill="none" className="w-full max-w-[260px] mx-auto text-[#0A7A5C] dark:text-[#3EE6B8]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="20" y="40" width="240" height="130" rx="12" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" />
        <rect x="55" y="70" width="80" height="60" rx="6" stroke="currentColor" strokeWidth="1.8" />
        <path d="M55 90H135M95 70V130" stroke="#19C8D8" strokeWidth="1.6" />
        <path d="M160 85H230M160 105H210M160 125H190" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'ngos',
    label: 'NGOs',
    chip: 'Verified Relief Partners',
    title: 'Live urgency alerts and road navigation to donors',
    scenario:
      'Example scenario: An NGO operating a daily evening feeding drive monitors the live FRESH map. As soon as high-priority meals appear nearby, they accept the claim, view the donor address, and dispatch their van on the optimal road route.',
    actionText: 'View live NGO map',
    actionTo: '/map',
    svg: (
      <svg viewBox="0 0 280 200" fill="none" className="w-full max-w-[260px] mx-auto text-[#0A7A5C] dark:text-[#3EE6B8]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="20" y="40" width="240" height="130" rx="12" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" />
        <path d="M60 80L100 130L140 75" stroke="#19C8D8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="60" cy="80" r="5" fill="#3EE6B8" />
        <circle cx="100" cy="130" r="5" fill="#3EE6B8" />
        <circle cx="140" cy="75" r="5" fill="#3EE6B8" />
        <path d="M165 95H235M165 115H215" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function WhoUsesFreshTabs() {
  const [activeTab, setActiveTab] = useState('weddings')
  const tabRefs = useRef({})

  const handleKeyDown = (e, index) => {
    let newIndex
    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % TABS.length
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + TABS.length) % TABS.length
    } else if (e.key === 'Home') {
      newIndex = 0
    } else if (e.key === 'End') {
      newIndex = TABS.length - 1
    } else {
      return
    }

    e.preventDefault()
    const targetTab = TABS[newIndex]
    setActiveTab(targetTab.id)
    tabRefs.current[targetTab.id]?.focus()
  }

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0]

  return (
    <section className="bg-canvas py-20 px-4 sm:px-6 lg:px-8 border-b border-line dark:border-white/10">
      <div className="mx-auto max-w-7xl">
        {/* Header with small uppercase label and tiny icon */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-surface px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0A7A5C] shadow-sm dark:border-white/10 dark:bg-[#0B2219] dark:text-[#3EE6B8]">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Community Workflows</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-ink dark:text-[#F2F7F4]">
            Who uses <span className="fresh-gradient-text">FRESH</span> every day
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-[#A9BBB2]">
            Explore real handoff workflows designed around donor realities and
            NGO transit speeds.
          </p>
        </div>

        {/* Segmented Tab Bar */}
        <div
          role="tablist"
          aria-label="Who uses FRESH"
          className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 rounded-[12px] border border-line bg-surface/80 p-1.5 shadow-sm dark:border-white/10 dark:bg-[#0B2219]/70"
        >
          {TABS.map((tab, idx) => {
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                ref={(el) => (tabRefs.current[tab.id] = el)}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`rounded-[9px] px-2.5 py-1.5 text-[11px] sm:px-3.5 sm:py-2 sm:text-xs font-bold transition duration-150 focus-visible:outline-none ${
                  isSelected
                    ? 'bg-[#06130F] text-[#3EE6B8] shadow-sm dark:bg-black/60 dark:text-[#3EE6B8] dark:border dark:border-[#3EE6B8]/40'
                    : 'text-ink-soft hover:text-ink hover:bg-elevated dark:text-[#A9BBB2] dark:hover:text-[#F2F7F4] dark:hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Large Split Card Below */}
        <div
          role="tabpanel"
          id={`panel-${currentTab.id}`}
          aria-labelledby={`tab-${currentTab.id}`}
          className="mt-8 mx-auto max-w-4xl rounded-[12px] border border-line bg-surface p-6 shadow-sm dark:border-white/10 dark:bg-[#0B2219]/90 sm:p-10"
        >
          <div className="grid md:grid-cols-[1.1fr_auto_0.9fr] gap-8 items-center">
            {/* Left side: Chip, title, plain words scenario, action */}
            <div className="flex flex-col items-start text-left">
              <span className="inline-flex items-center gap-1 rounded-[6px] border border-line bg-[#E9EEEC] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0A7A5C] dark:border-white/10 dark:bg-[#06130F] dark:text-[#3EE6B8]">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {currentTab.chip}
              </span>

              <h3 className="mt-4 text-xl sm:text-2xl font-bold leading-snug text-ink dark:text-[#F2F7F4]">
                {currentTab.title}
              </h3>

              <div className="mt-4 rounded-[8px] border border-line/80 bg-elevated/70 p-4 text-xs leading-relaxed text-ink-soft dark:border-white/10 dark:bg-[#06130F]/60 dark:text-[#A9BBB2]">
                <p>{currentTab.scenario}</p>
              </div>

              <div className="mt-6">
                <Link
                  to={currentTab.actionTo}
                  className="fresh-btn-primary inline-flex h-10 items-center justify-center gap-2 px-4 text-xs font-bold"
                >
                  {currentTab.actionText}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Thin vertical separator line */}
            <div className="hidden md:block h-52 w-px bg-line dark:bg-white/10" aria-hidden="true" />

            {/* Right side: Clean inline SVG visual */}
            <div className="flex items-center justify-center w-full py-4">
              {currentTab.svg}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
