// Seeds the database with sample data so the storefront and admin dashboard
// have real content to show. Safe to re-run: it skips products if any already
// exist, and upserts the coupon / wallet / settings.
//
// Usage:  cd backend && npm run seed

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { syrianProducts } from '../../src/data/syrianProducts.js';

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

async function seedProducts() {
  const { count } = await sb.from('products').select('*', { count: 'exact', head: true });
  if (count > 0) {
    console.log(`• products: ${count} already exist — skipping`);
    return;
  }
  const rows = syrianProducts.map((p) => ({
    name: p.name,
    description: p.description || '',
    price: p.price,
    image: Array.isArray(p.image) ? p.image : [p.image].filter(Boolean),
    category: p.category || '',
    sub_category: p.subCategory || '',
    bestseller: !!p.bestseller,
    min_order_quantity: p.minOrderQuantity || 1,
    stock: 100,
  }));
  const { error } = await sb.from('products').insert(rows);
  if (error) throw error;
  console.log(`• products: inserted ${rows.length}`);
}

async function seedCoupon() {
  const { error } = await sb.from('coupons').upsert(
    { code: 'SAVE10', discount: 10, discount_type: 'percent', active: true },
    { onConflict: 'code' }
  );
  if (error) throw error;
  console.log('• coupon: SAVE10 (10% off) ready');
}

async function seedWallet() {
  const { data } = await sb.from('crypto_wallets').select('id').limit(1);
  if (data && data.length) {
    console.log('• crypto wallet: already present — skipping');
    return;
  }
  const { error } = await sb.from('crypto_wallets').insert({
    crypto_type: 'USDT',
    network: 'TRC20',
    wallet_address: 'TXYZsampleWalletAddress000000000000',
  });
  if (error) throw error;
  console.log('• crypto wallet: USDT/TRC20 added');
}

async function seedSettings() {
  const { error } = await sb.from('settings').upsert({
    id: 1,
    footer_email: 'support@ymgspharmacy.com',
    footer_phone: '+1 555 000 1234',
    contact_email: 'contact@ymgspharmacy.com',
    contact_phone: '+1 555 000 1234',
    contact_address: '123 Health St, Damascus, Syria',
    business_hours: 'Sun–Thu, 9am–6pm',
  });
  if (error) throw error;
  console.log('• settings: store contact info set');
}

async function main() {
  console.log(`Seeding ${process.env.SUPABASE_URL} ...`);
  await seedProducts();
  await seedCoupon();
  await seedWallet();
  await seedSettings();
  console.log('\nDone. Coupon code to test checkout: SAVE10');
}

main().catch((e) => {
  console.error('Seed failed:', e.message || e);
  process.exit(1);
});
