import 'server-only';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'product-assets';
let ensured = false;

/** Public bucket for product technical sheets + custom images. Auto-created. */
async function ensureBucket(admin: ReturnType<typeof createSupabaseAdminClient>): Promise<void> {
  if (ensured) return;
  const { data } = await admin.storage.getBucket(BUCKET);
  if (!data) {
    await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 20 * 1024 * 1024 });
  }
  ensured = true;
}

export async function uploadProductAsset(params: {
  productId: string;
  kind: 'sheet' | 'safety' | 'image';
  fileName: string;
  bytes: Uint8Array;
  contentType: string;
}): Promise<string> {
  const admin = createSupabaseAdminClient();
  await ensureBucket(admin);

  const ext = (params.fileName.split('.').pop() || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8);
  const path = `products/${params.productId}/${params.kind}-${Date.now()}${ext ? `.${ext}` : ''}`;

  const { error } = await admin.storage.from(BUCKET).upload(path, params.bytes, {
    contentType: params.contentType,
    upsert: true,
  });
  if (error) throw new Error(error.message);

  return admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
