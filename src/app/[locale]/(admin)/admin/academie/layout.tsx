import type { ReactNode } from 'react';
import '@/styles/prodet/academy.css';

export default function AcademyLayout({ children }: { children: ReactNode }) {
  return <div className="academy-root">{children}</div>;
}
