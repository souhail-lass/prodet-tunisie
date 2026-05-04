import type { ReactNode } from 'react';

// The locale-aware layout lives at src/app/[locale]/layout.tsx.
// This root layout exists only because Next.js requires it; do not add UI here.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
