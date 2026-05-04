import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPublicEnv } from '@/lib/env';

interface WhatsAppLinkProps {
  message?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function WhatsAppLink({
  message,
  className,
  variant = 'outline',
  size = 'default',
}: WhatsAppLinkProps) {
  const t = useTranslations('common');
  const env = getPublicEnv();
  const phone = env.NEXT_PUBLIC_DEFAULT_WHATSAPP_E164;

  if (!phone) return null;

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const url = message
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${cleanPhone}`;

  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={cn(className)}
      aria-label={t('actions.openWhatsApp')}
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-4 w-4" aria-hidden />
        <span>WhatsApp</span>
      </a>
    </Button>
  );
}
