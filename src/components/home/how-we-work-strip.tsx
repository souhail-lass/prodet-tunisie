import { LabelText } from '@/components/typography/label-text';
import type { HomeContent } from './content';

export function HowWeWorkStrip({ content }: { content: HomeContent }) {
  return (
    <section className="catalog-divider border-border/80 border-b">
      <div className="section-shell py-14">
        <header className="max-w-3xl">
          <LabelText>{content.workflow.eyebrow}</LabelText>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">{content.workflow.title}</h2>
        </header>

        <ol className="mt-10 grid gap-5 lg:grid-cols-3">
          {content.workflow.steps.map((step, index) => (
            <li key={step.title} className="surface-panel p-6">
              <p className="font-display text-primary text-4xl font-semibold">
                0{index + 1}
              </p>
              <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-7">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
