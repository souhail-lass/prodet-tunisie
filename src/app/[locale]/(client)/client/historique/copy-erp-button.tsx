'use client';

import { useState } from 'react';
import { Check, ClipboardCopy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CopyErpButton({ copyText }: { copyText: string }) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={copyToClipboard}>
      {copied ? (
        <Check className="h-4 w-4" aria-hidden />
      ) : (
        <ClipboardCopy className="h-4 w-4" aria-hidden />
      )}
      {copied ? 'Copié' : 'Copier pour ERP'}
    </Button>
  );
}
