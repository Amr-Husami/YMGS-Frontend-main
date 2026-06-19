// End-to-end smoke test for the YMGS backend.
//
// Usage:
//   node scripts/smoke-test.mjs                 # tests against http://localhost:4000
//   BASE_URL=http://localhost:4000 node scripts/smoke-test.mjs
//   ADMIN_EMAIL=admin@ymgs.com ADMIN_PASSWORD=password123 node scripts/smoke-test.mjs
//
// Public + logged-in-user flows run automatically. Admin flows (create/update/
// delete product, list orders/users) only run if you pass ADMIN_EMAIL +
// ADMIN_PASSWORD for an account whose role is 'admin'.

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

let passed = 0;
let failed = 0;

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

function check(name, ok, detail = '') {
  if (ok) {
    passed++;
    console.log(`${green('PASS')} ${name}`);
  } else {
    failed++;
    console.log(`${red('FAIL')} ${name} ${detail ? dim('— ' + detail) : ''}`);
  }
  return ok;
}

// Tiny fetch wrapper. token -> sent as the `token` header (frontend convention).
async function req(method, path, { body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.token = token;
  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON */
  }
  return { status: res.status, data };
}

async function main() {
  console.log(dim(`\nTesting ${BASE_URL}\n`));

  // 1. Health
  const health = await req('GET', '/api/health');
  if (!check('health endpoint', health.status === 200 && health.data?.success, `status ${health.status}`)) {
    console.log(red('\nBackend not reachable — is it running? (npm run dev)\n'));
    process.exit(1);
  }

  // 2. Register a fresh user
  const email = `smoke_${Date.now()}@example.com`;
  const password = 'password123';
  const reg = await req('POST', '/api/user/register', { body: { name: 'Smoke Test', email, password } });
  const okReg = check('register new user', reg.status === 201 && reg.data?.token, JSON.stringify(reg.data));
  const token = reg.data?.token;

  // 3. Duplicate register should be rejected
  const dup = await req('POST', '/api/user/register', { body: { name: 'Dup', email, password } });
  check('reject duplicate email', dup.status === 409, `status ${dup.status}`);

  // 4. Login
  const login = await req('POST', '/api/user/login', { body: { email, password } });
  check('login with correct password', login.status === 200 && login.data?.token, JSON.stringify(login.data));

  // 5. Login with wrong password
  const badLogin = await req('POST', '/api/user/login', { body: { email, password: 'wrong' } });
  check('reject wrong password', badLogin.status === 401, `status ${badLogin.status}`);

  // 6. Product listing (public)
  const list = await req('POST', '/api/product/user/list', { body: { limit: 5 } });
  check('product list', list.status === 200 && Array.isArray(list.data?.products), JSON.stringify(list.data).slice(0, 120));
  const sampleProductId = list.data?.products?.[0]?._id;

  // 7. Cart (requires auth)
  if (token) {
    const cartId = sampleProductId || 'test-item-1';
    const add = await req('POST', '/api/cart/add', { token, body: { itemId: cartId, cartData: { quantity: 2 } } });
    check('cart add', add.status === 200 && add.data?.success, JSON.stringify(add.data));

    const getCart = await req('POST', '/api/cart/get', { token });
    check('cart get reflects add', getCart.data?.cartData?.[cartId]?.quantity === 2, JSON.stringify(getCart.data));

    // 8. Save + get address
    const addr = { firstName: 'Smoke', lastName: 'Test', email, street: '1 Main', city: 'Town', state: 'ST', zipcode: '12345', country: 'US', phone: '5550000' };
    const saveAddr = await req('POST', '/api/address/save', { token, body: { address: addr } });
    check('address save', saveAddr.status === 201 && Array.isArray(saveAddr.data?.addresses), JSON.stringify(saveAddr.data).slice(0, 120));

    const getAddr = await req('GET', '/api/address/get', { token });
    check('address get', getAddr.data?.addresses?.length >= 1, JSON.stringify(getAddr.data).slice(0, 120));

    // 9. Place an order
    const order = await req('POST', '/api/order/place', {
      token,
      body: {
        items: [{ _id: cartId, name: 'Test', price: 10, image: ['x'], quantity: 2 }],
        amount: 25,
        originalAmount: 25,
        address: addr,
      },
    });
    check('place order (COD)', order.status === 201 && order.data?.order?._id, JSON.stringify(order.data).slice(0, 120));

    // 10. User orders via token
    const myOrders = await req('POST', '/api/order/userorders', { token, body: { page: 1, limit: 5 } });
    check('userorders via token', myOrders.data?.orders?.length >= 1, JSON.stringify(myOrders.data).slice(0, 120));

    // 11. User orders via email (guest lookup)
    const byEmail = await req('POST', '/api/order/userorders', { body: { email, page: 1, limit: 5 } });
    check('userorders via email', byEmail.data?.orders?.length >= 1, JSON.stringify(byEmail.data).slice(0, 120));
  }

  // 12. Public storefront support endpoints
  const settings = await req('GET', '/api/order/settings');
  check('order settings shape', settings.data?.settings && 'footerEmail' in settings.data.settings, JSON.stringify(settings.data).slice(0, 120));

  const wallets = await req('GET', '/api/order/crypto-wallets');
  check('crypto wallets', wallets.status === 200 && Array.isArray(wallets.data?.wallets), JSON.stringify(wallets.data).slice(0, 120));

  const blogs = await req('GET', '/api/blog/list?page=1&limit=3');
  check('blog list', blogs.status === 200 && Array.isArray(blogs.data?.blogs), JSON.stringify(blogs.data).slice(0, 120));

  const contact = await req('POST', '/api/contact/submit', { body: { name: 'Smoke', email, phone: '5550000', message: 'hi' } });
  check('contact submit', contact.status === 201 && contact.data?.success, JSON.stringify(contact.data));

  const badCoupon = await req('POST', '/api/order/verify-coupon', { body: { couponCode: 'NOPE', amount: 50 } });
  check('verify-coupon rejects unknown code', badCoupon.data?.success === false, JSON.stringify(badCoupon.data));

  // 13. Admin flows (optional)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    console.log(dim('\n-- admin flows --'));
    const al = await req('POST', '/api/user/login', { body: { email: adminEmail, password: adminPassword } });
    const adminToken = al.data?.token;
    if (!check('admin login', al.data?.user?.role === 'admin', `role=${al.data?.user?.role}`)) {
      console.log(red(`  ${adminEmail} is not an admin. Promote it:`));
      console.log(dim(`  update public.users set role='admin' where email='${adminEmail}';`));
    } else {
      const created = await req('POST', '/api/product/add', {
        token: adminToken,
        body: { name: 'Smoke Product', price: 9.99, category: 'Test', stock: 5, image: ['https://x/y.png'] },
      });
      const pid = created.data?.product?._id;
      check('admin create product', created.status === 201 && pid, JSON.stringify(created.data).slice(0, 120));

      const upd = await req('PUT', `/api/product/${pid}`, { token: adminToken, body: { price: 12.5 } });
      check('admin update product', upd.data?.product?.price == 12.5, JSON.stringify(upd.data).slice(0, 120));

      const del = await req('DELETE', `/api/product/${pid}`, { token: adminToken });
      check('admin delete product', del.data?.success, JSON.stringify(del.data));

      const orders = await req('GET', '/api/order/list', { token: adminToken });
      check('admin list orders', Array.isArray(orders.data?.orders), JSON.stringify(orders.data).slice(0, 80));

      const users = await req('GET', '/api/user/list', { token: adminToken });
      check('admin list users', Array.isArray(users.data?.users), JSON.stringify(users.data).slice(0, 80));
    }
  } else {
    console.log(dim('\n(skipping admin flows — set ADMIN_EMAIL and ADMIN_PASSWORD to include them)'));
  }

  // Summary
  console.log(`\n${passed} passed, ${failed ? red(failed + ' failed') : green('0 failed')}\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(red('Smoke test crashed:'), e);
  process.exit(1);
});
