'use client';

import { ArrowLeft } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { readLastCatalogueBrowse } from '@/lib/catalogue-browse';

export function ProductBackLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const router = useRouter();

  return (
    <Link
      href={href}
      className="product-toolbar__back"
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const browse = readLastCatalogueBrowse();
        if (!browse || browse === href) return;
        event.preventDefault();
        router.push(browse);
      }}
    >
      <ArrowLeft size={16} aria-hidden />
      {label}
    </Link>
  );
}
