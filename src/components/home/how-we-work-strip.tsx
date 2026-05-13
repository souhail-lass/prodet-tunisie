import { siteContent } from '@/data/site-content';
import { AnimateOnScroll } from '@/components/motion/animate-on-scroll';
import { workflowIcons } from '@/components/public-icons';
import { LabelText } from '@/components/typography/label-text';

export function HowWeWorkStrip() {
  const copy = siteContent.home.howItWorks;

  return (
    <section className="bg-white">
      <div className="section-shell py-18 lg:py-20">
        <header className="max-w-3xl">
          <LabelText>{copy.label}</LabelText>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-prodet-text sm:text-4xl lg:text-[44px]">
            {copy.title}
          </h2>
        </header>

        <div className="mt-12 rounded-[34px] border border-border/80 bg-white px-6 py-4 shadow-[0_28px_54px_-44px_rgba(11,61,115,0.22)] sm:px-8 lg:px-10">
          <AnimateOnScroll as="ol" staggerChildren className="grid gap-2 lg:grid-cols-3 lg:gap-0">
            {copy.steps.map((step, index) => {
              const Icon = workflowIcons[Math.min(index, workflowIcons.length - 1)]!;

              return (
                <li
                  key={step.title}
                  data-animate-child
                  className="relative py-6 lg:px-8 lg:py-8 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:border-border/80"
                >
                  <div className="flex items-start justify-between gap-6">
                    <span className="text-5xl font-semibold tracking-[-0.06em] text-primary/18 sm:text-6xl">
                      0{index + 1}
                    </span>
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-[0_18px_30px_-26px_rgba(15,93,168,0.55)]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-prodet-text">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.body}</p>
                </li>
              );
            })}
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
