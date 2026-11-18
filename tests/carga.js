
import http from 'k6/http';
import { check, sleep } from 'k6';

const usuarioId = __ENV.USUARIO_ID;

export const options = {
  stages: [
    { duration: '10s', target: 5 },  // Aumenta até 5 usuários
    { duration: '40s', target: 10 }, // Aumenta até 10 usuários
    { duration: '1m', target: 10 },  // Mantém 10 usuários
    { duration: '10s', target: 0 }, // Finaliza os acessos
  ],

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const res = http.get(
    `http://localhost:3000/api/treinos?usuarioId=${usuarioId}`
  );

  check(res, {
    'Status 200 OK': (r) => r.status === 200,
    'Resposta abaixo de 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
