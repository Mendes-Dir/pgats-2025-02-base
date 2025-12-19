import http from 'k6/http';
import { group, check } from 'k6';
import { login } from './helpers/auth.helper.js';

export default function () {
  group('Fluxo de Checkout', () => {
    const token = login('alice@email.com', '123456');

    group('Criar checkout', () => {
      const res = http.post(`${__ENV.BASE_URL}/api/checkout`, JSON.stringify({
        items: [{ productId: 1, quantity: 1 }],
        freight: 10,
        paymentMethod: 'boleto'
      }), {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });

      check(res, { 'checkout ok': (r) => r.status === 200 });
    });
  });
}
