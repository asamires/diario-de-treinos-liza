import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 }, // Sobe até 10 usuários simultâneos (Carga)
    { duration: '15s', target: 30 }, // Puxa para 30 usuários simultâneos (Estresse)
    { duration: '5s', target: 0 },   // Desacelera para 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],   // Exige menos de 1% de falhas
    http_req_duration: ['p(95)<500'], // 95% das requisições devem responder em menos de 500ms
  },
};

export default function () {
  const res = http.get('http://localhost:3000/api/treinos');

  check(res, {
    'Status 200 OK': (r) => r.status === 200,
  });

  sleep(0.5);
}
