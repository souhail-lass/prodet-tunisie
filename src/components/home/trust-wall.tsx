import { LabelText } from '@/components/typography/label-text';
import type { HomeContent } from './content';

export function TrustWall({ content }: { content: HomeContent }) {
  return (
    <section className="bg-secondary/35 border-border/70 border-b">
      <div className="section-shell py-12">
        <div className="surface-panel px-6 py-7 sm:px-8">
          <LabelText>{content.trust.eyebrow}</LabelText>
          <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">{content.trust.title}</h2>
          <ul className="mt-7 flex flex-wrap gap-3">
            {content.trust.pills.map((pill) => (
              <li
                key={pill}
                className="rounded-full border border-border bg-secondary px-4 py-2 text-sm text-foreground"
              >
                {pill}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
