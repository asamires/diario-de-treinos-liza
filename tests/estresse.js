
import http from 'k6/http';
import { check, sleep } from 'k6';

const usuarioId = __ENV.USUARIO_ID;

export const options = {
  stages: [
    { duration: '10s', target: 10 }, // 10 usuários
    { duration: '15s', target: 20 }, // 20 usuários
    { duration: '15s', target: 30 }, // 30 usuários
    { duration: '15s', target: 50 }, // 50 usuários
    { duration: '15s', target: 70 }, // 70 usuários
    { duration: '10s', target: 0 },  // Finaliza
  ],

  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const res = http.get(
    `http://localhost:3000/api/treinos?usuarioId=${usuarioId}`
  );

  check(res, {
    'Status 200 OK': (r) => r.status === 200,
    'Resposta recebida': (r) => r.status !== 0,
  });

  sleep(0.5);
}
