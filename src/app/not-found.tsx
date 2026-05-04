import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="fr">
      <body className="bg-background text-foreground flex min-h-dvh items-center justify-center p-4">
        <div className="max-w-md text-center">
          <p className="text-primary text-sm font-medium tracking-wider uppercase">404</p>
          <h1 className="mt-3 text-3xl font-semibold">Page introuvable</h1>
          <p className="text-muted-foreground mt-3">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          <Link
            href="/fr"
            className="bg-primary text-primary-foreground mt-6 inline-block rounded-md px-4 py-2 text-sm font-medium"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </body>
    </html>
  );
}
