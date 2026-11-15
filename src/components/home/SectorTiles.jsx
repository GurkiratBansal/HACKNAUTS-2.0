// FRESH:FILE  Six sector tiles with consistent inline SVG illustrations and bottom-left labels.
// FRESH:AREA  Layout

import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

const TILES = [
  {
    title: 'Weddings and events',
    to: '/donor/add',
    svg: (
      <svg className="h-8 w-8 text-[#3EE6B8]" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M16 4C11 4 7 8 7 13C7 18 10 22 16 28C22 22 25 18 25 13C25 8 21 4 16 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 13C12 11 13.8 9.5 16 9.5C18.2 9.5 20 11 20 13C20 15.5 17 17.5 16 18C15 17.5 12 15.5 12 13Z" stroke="#19C8D8" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    title: 'Restaurants',
    to: '/donor/add',
    svg: (
      <svg className="h-8 w-8 text-[#3EE6B8]" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M7 6V14C7 16.2 8.8 18 11 18V27" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 6V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 6V14C15 16.2 13.2 18 11 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 6C19.8 6 18 7.8 18 10V18H22V27" stroke="#19C8D8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Community kitchens',
    to: '/donor/add',
    svg: (
      <svg className="h-8 w-8 text-[#3EE6B8]" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="5" y="11" width="22" height="15" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10 11V8C10 6.9 10.9 6 12 6H20C21.1 6 22 6.9 22 8V11" stroke="#19C8D8" strokeWidth="1.8" />
        <path d="M12 17H20M12 21H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Households',
    to: '/donor/add',
    svg: (
      <svg className="h-8 w-8 text-[#3EE6B8]" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M5 14L16 5L27 14V26C27 26.6 26.6 27 26 27H6C5.4 27 5 26.6 5 26V14Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M13 27V17H19V27" stroke="#19C8D8" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: 'NGOs',
    to: '/map',
    svg: (
      <svg className="h-8 w-8 text-[#3EE6B8]" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M16 6C11.6 6 8 9.6 8 14C8 19.5 16 27 16 27C16 27 24 19.5 24 14C24 9.6 20.4 6 16 6Z" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16" cy="14" r="3.5" stroke="#19C8D8" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: 'Relief and emergencies',
    to: '/map',
    svg: (
      <svg className="h-8 w-8 text-[#3EE6B8]" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M16 4L4 26H28L16 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M16 13V18M16 22V22.5" stroke="#19C8D8" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function SectorTiles() {
  return (
    <section className="border-b border-white/10 bg-[#06130F] py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-[8px] border border-white/10 bg-[#0B2219] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#3EE6B8]">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            <span>Community Sources</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F2F7F4]">
            Who channels surplus through FRESH
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
          {TILES.map((tile) => {
            const Content = (
              <div className="group relative flex h-36 flex-col justify-between rounded-[10px] border border-white/10 bg-[#0B2219]/60 p-4 backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:border-[#3EE6B8]/40 hover:bg-[#0B2219]/90 hover:shadow-lg sm:h-40">
                <div className="shrink-0 transition group-hover:scale-105">
                  {tile.svg}
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold leading-snug text-[#F2F7F4] transition group-hover:text-[#3EE6B8]">
                    {tile.title}
                  </span>
                </div>
              </div>
            )

            return tile.to ? (
              <Link
                key={tile.title}
                to={tile.to}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EE6B8] rounded-[10px]"
              >
                {Content}
              </Link>
            ) : (
              <div key={tile.title}>{Content}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
