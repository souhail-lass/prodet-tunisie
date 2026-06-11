/** WhatsApp glyph matching the design-system Icons.Whatsapp (lucide-style, 2px stroke). */
export function WhatsappIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 21l1.6-5A8 8 0 1 1 8 19.4z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5M9 9.5c0-.6.4-1 1-1s1 .4 1 1.2c0 .5-.3.9-.6 1.2M14.5 15c.6 0 1-.4 1-1s-.4-1-1.2-1c-.5 0-.9.3-1.2.6" />
    </svg>
  );
}
