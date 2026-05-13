const steps = [
  {
    title: 'Décrivez vos besoins',
    description:
      'Contactez-nous par téléphone, email ou via le formulaire. Précisez vos produits et volumes estimés.',
    color: '#1B5FA7',
  },
  {
    title: 'Recevez une offre personnalisée',
    description:
      'Nous préparons un devis adapté à votre activité, vos volumes et votre secteur.',
    color: '#0D3B73',
  },
  {
    title: 'Livraison selon votre zone',
    description:
      'Nous assurons la livraison avec nos propres véhicules selon votre zone géographique.',
    color: '#1F9C49',
  },
] as const;

export function HowItWorks() {
  return (
    <section className="bg-[#F8F7F4] py-[72px]">
      <div className="mx-auto max-w-[1400px] px-6">
        <header className="text-center">
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#1B5FA7]">
            COMMENT ÇA MARCHE
          </p>
          <h2 className="mb-2.5 text-[30px] font-semibold leading-[1.2] text-[#1C2B3A]">
            Simple, direct, sans intermédiaire
          </h2>
          <p className="mx-auto mb-12 max-w-[520px] text-[14px] leading-[1.7] text-[#6B7280]">
            Du premier contact à la livraison, l&apos;équipe Prodet gère tout.
          </p>
        </header>

        <div className="relative grid gap-8 md:grid-cols-3 md:gap-0">
          <div
            className="absolute left-[28px] top-0 bottom-0 border-l-2 border-dashed border-[rgba(27,95,167,0.25)] md:bottom-auto md:left-[calc(16.66%+24px)] md:right-[calc(16.66%+24px)] md:top-7 md:border-l-0 md:border-t-2"
            aria-hidden
          />
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="relative z-[1] grid grid-cols-[56px_minmax(0,1fr)] gap-5 text-left md:flex md:flex-col md:items-center md:px-6 md:text-center"
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#F8F7F4] text-[22px] font-medium text-white"
                style={{ backgroundColor: step.color }}
              >
                {index + 1}
              </div>
              <div className="md:flex md:flex-col md:items-center">
                <h3 className="mb-2 text-[15px] font-medium text-[#1C2B3A]">{step.title}</h3>
                <p className="max-w-[260px] text-[13px] leading-[1.65] text-[#6B7280]">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
