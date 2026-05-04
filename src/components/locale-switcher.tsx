'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { Languages } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { locales, localeLabels, type Locale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

export function LocaleSwitcher() {
  const t = useTranslations('common');
  const tHeader = useTranslations('header');
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  function onLocaleChange(nextLocale: Locale) {
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- typed routes can't validate dynamic pathname
        { pathname, params },
        { locale: nextLocale },
      );
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full border border-transparent px-3"
          aria-label={tHeader('languageMenuLabel')}
          disabled={isPending}
        >
          <Languages className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{localeLabels[currentLocale]}</span>
          <span className="sr-only sm:hidden">{t('actions.switchLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuCheckboxItem
            key={locale}
            checked={locale === currentLocale}
            onCheckedChange={(checked) => {
              if (checked) onLocaleChange(locale);
            }}
          >
            {localeLabels[locale]}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
