const SDGS = [
  {
    number: 2,
    title: 'Zero Hunger',
    text: 'More meals reach people who need them.',
    tone: 'bg-sdg2 text-brand-950',
  },
  {
    number: 3,
    title: 'Good Health',
    text: 'Clear handling and inspection guidance.',
    tone: 'bg-sdg3 text-brand-950',
  },
  {
    number: 11,
    title: 'Sustainable Cities',
    text: 'Local recovery instead of long transport.',
    tone: 'bg-sdg11 text-brand-950',
  },
  {
    number: 12,
    title: 'Responsible Consumption',
    text: 'Less edible food is thrown away.',
    tone: 'bg-sdg12 text-brand-950',
  },
  {
    number: 17,
    title: 'Partnerships',
    text: 'Donors, volunteers and NGOs working together.',
    tone: 'bg-sdg17 text-white',
  },
]

export default function SdgGrid() {
  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
            Aligned with global goals
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Small handoffs, wider impact.
          </h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Each rescued meal touches several Sustainable Development Goals at
            once — from hunger relief to responsible consumption.
          </p>
        </div>

        <ul className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {SDGS.map((sdg) => (
            <li key={sdg.number}>
              <div
                className={`group flex h-full min-h-[164px] flex-col justify-between rounded-2xl p-4 shadow-soft ring-1 ring-inset ring-brand-950/10 transition duration-200 hover:-translate-y-1 hover:shadow-card ${sdg.tone}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-display text-3xl font-extrabold leading-none">
                    {sdg.number}
                  </span>
                  <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    SDG
                  </span>
                </div>
                <div className="mt-5">
                  <h3 className="text-sm font-bold leading-snug">{sdg.title}</h3>
                  <p className="mt-1 text-[13px] leading-snug opacity-85">{sdg.text}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs leading-relaxed text-ink-muted">
          Colored tiles reference the UN Sustainable Development Goals. No
          official UN logos are used.
        </p>
      </div>
    </section>
  )
}
