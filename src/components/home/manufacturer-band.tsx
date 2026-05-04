import { LabelText } from '@/components/typography/label-text';
import type { HomeContent } from './content';

export function ManufacturerBand({ content }: { content: HomeContent }) {
  return (
    <section className="bg-secondary/35 border-border/70 border-b">
      <div className="section-shell py-14">
        <div className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
          <div className="surface-panel-strong relative min-h-[320px] overflow-hidden p-7 sm:p-8">
            <div className="grid-blueprint absolute inset-0 opacity-20" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <p className="product-code text-white/70">{content.manufacturer.visualEyebrow}</p>
                <h3 className="font-display mt-4 text-4xl font-semibold">
                  {content.manufacturer.visualTitle}
                </h3>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/84">
                  {content.manufacturer.visualBody}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {content.manufacturer.strip.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1rem] border border-white/18 bg-white/10 px-4 py-3 text-sm font-medium text-white"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <LabelText>{content.manufacturer.eyebrow}</LabelText>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">{content.manufacturer.title}</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl leading-8">
              {content.manufacturer.body}
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {content.manufacturer.claims.map((claim) => (
                <li key={claim} className="surface-panel px-5 py-4 text-sm text-foreground">
                  {claim}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
