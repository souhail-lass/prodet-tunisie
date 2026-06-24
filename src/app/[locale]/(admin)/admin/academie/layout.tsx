import type { ReactNode } from 'react';
import { AcademyTopbar } from '@/features/academy/academy-topbar';
import '@/styles/prodet/academy.css';

export default function AcademyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="academy-root">
      <AcademyTopbar />
      {children}
    </div>
  );
}
