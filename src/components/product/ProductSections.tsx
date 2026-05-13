'use client';

import {
  AlertCircle,
  AlertTriangle,
  Beaker,
  Droplet,
  EyeOff,
  Info,
  Settings,
  Stethoscope,
  Thermometer,
  type LucideIcon,
} from 'lucide-react';
import type { Product } from '@/data/types';
import { ProductAccordion } from './ProductAccordion';

export function ProductSections({ product }: { product: Product }) {
  const descriptionParagraphs = splitParagraphs(
    product.description || 'Description disponible sur demande.',
  );
  const usageSteps = product.howToUse ? parseStepList(product.howToUse) : [];
  const showUsage = Boolean(product.howToUse || product.dosage || product.dilutionRates?.length);

  return (
    <div className="grid gap-3">
      <ProductAccordion title="Aperçu & description" icon={Info} defaultOpen>
        <div className="space-y-3">
          {descriptionParagraphs.map((paragraph) => (
            <p key={paragraph} className="text-[12px] leading-6 text-[#6B7280]">
              {paragraph}
            </p>
          ))}
        </div>
      </ProductAccordion>

      {showUsage ? (
        <ProductAccordion title="Mode d'emploi & dosage" icon={Droplet} defaultOpen>
          <div className="space-y-4">
            {product.howToUse ? (
              usageSteps.length > 0 ? (
                <ol className="list-decimal space-y-2 pl-5 text-[12px] leading-6 text-[#6B7280]">
                  {usageSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-[12px] leading-6 text-[#6B7280]">{product.howToUse}</p>
              )
            ) : null}

            {product.dilutionRates?.length ? (
              <table className="w-full border-collapse overflow-hidden text-left text-[12px]">
                <thead>
                  <tr className="text-[#9CA3AF]">
                    <th className="border-[0.5px] border-[#E5E7EB] px-3 py-2 font-medium">
                      Usage
                    </th>
                    <th className="border-[0.5px] border-[#E5E7EB] px-3 py-2 font-medium">
                      Dosage
                    </th>
                    <th className="border-[0.5px] border-[#E5E7EB] px-3 py-2 font-medium">
                      Ratio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {product.dilutionRates.map((rate, index) => (
                    <tr key={rate.label} className={index % 2 === 1 ? 'bg-[#F9FAFB]' : 'bg-white'}>
                      <td className="border-[0.5px] border-[#E5E7EB] px-3 py-2 text-[#1C2B3A]">
                        {rate.label}
                      </td>
                      <td className="border-[0.5px] border-[#E5E7EB] px-3 py-2 text-[#6B7280]">
                        {rate.rate}
                      </td>
                      <td className="border-[0.5px] border-[#E5E7EB] px-3 py-2 text-[#6B7280]">
                        {extractRatio(rate.rate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : product.dosage ? (
              <span className="inline-flex rounded-full bg-[#EFF6FF] px-3 py-1.5 text-[12px] font-medium text-[#1B5FA7]">
                {product.dosage}
              </span>
            ) : null}
          </div>
        </ProductAccordion>
      ) : null}

      {product.composition ? (
        <ProductAccordion title="Composition" icon={Beaker} defaultOpen={false}>
          <p className="text-[12px] leading-6 text-[#6B7280]">{product.composition}</p>
        </ProductAccordion>
      ) : null}

      {product.precautions?.length ? (
        <ProductAccordion
          title="Précautions d'emploi"
          icon={AlertTriangle}
          iconBg="#FEF2F2"
          iconColor="#DC2626"
          defaultOpen={false}
        >
          <ul className="space-y-2">
            {product.precautions.map((precaution) => {
              const Icon = getPrecautionIcon(precaution);

              return (
                <li key={precaution} className="flex gap-2 text-[12px] leading-6 text-[#6B7280]">
                  <Icon className="mt-1 h-3.5 w-3.5 shrink-0 text-[#DC2626]" aria-hidden />
                  <span>{precaution}</span>
                </li>
              );
            })}
          </ul>
        </ProductAccordion>
      ) : null}

      {product.specs?.length ? (
        <ProductAccordion title="Spécifications techniques" icon={Settings} defaultOpen={false}>
          <table className="w-full border-collapse text-left text-[12px]">
            <tbody>
              {product.specs.map((spec) => (
                <tr key={spec.label}>
                  <th className="w-2/5 border-[0.5px] border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 font-medium text-[#1C2B3A]">
                    {spec.label}
                  </th>
                  <td className="border-[0.5px] border-[#E5E7EB] bg-white px-3 py-2 text-[#6B7280]">
                    {spec.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ProductAccordion>
      ) : null}
    </div>
  );
}

function splitParagraphs(value: string): string[] {
  return value
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function parseStepList(value: string): string[] {
  const hasListSyntax = /^\s*(?:\d+[\).]|[-•])/mu.test(value) || value.includes('\n');
  if (!hasListSyntax) return [];

  return value
    .split(/\n|(?:^|\s)\d+[\).]\s*|[-•]\s*/u)
    .map((step) => step.trim())
    .filter(Boolean);
}

function extractRatio(value: string): string {
  const percentage = value.match(/\d+(?:[,.]\d+)?\s*%/u);
  if (percentage?.[0]) return percentage[0];

  const perUnit = value.match(/par\s+\d+\s*(?:litres?|l|kg)/iu);
  return perUnit?.[0] ?? '—';
}

function getPrecautionIcon(value: string): LucideIcon {
  const normalized = value.toLocaleLowerCase('fr');

  if (normalized.includes('gel') || normalized.includes('température') || normalized.includes('temperature')) {
    return Thermometer;
  }
  if (normalized.includes('yeux')) return EyeOff;
  if (normalized.includes('médecin') || normalized.includes('medecin') || normalized.includes('consulter')) {
    return Stethoscope;
  }

  return AlertCircle;
}
