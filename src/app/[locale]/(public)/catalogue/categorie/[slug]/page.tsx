import { notFound, redirect } from 'next/navigation';
import { getUseCaseBySlug } from '@/data/queries';

export default async function LegacyCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const useCase = getUseCaseBySlug(slug);

  if (!useCase) notFound();

  redirect(`/${locale}/catalogue?useCase=${useCase.id}`);
}
