'use client';

import { BookOpen, FlaskConical } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';

/** Top switch between the reference workspace (La Gamme) and training (Apprendre). */
export function AcademyTopbar() {
  const pathname = usePathname();
  const onLearn = pathname.startsWith('/admin/academie/apprendre');

  return (
    <nav className="academy-switch" aria-label="Académie">
      <Link href="/admin/academie" className={onLearn ? '' : 'on'} aria-current={onLearn ? undefined : 'page'}>
        <FlaskConical size={15} aria-hidden /> La Gamme
      </Link>
      <Link href="/admin/academie/apprendre" className={onLearn ? 'on' : ''} aria-current={onLearn ? 'page' : undefined}>
        <BookOpen size={15} aria-hidden /> Apprendre
      </Link>
    </nav>
  );
}
