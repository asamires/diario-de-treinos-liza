import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  iterations: 5, // Executa o ciclo completo 5 vezes seguidas
};

const BASE_URL = 'http://localhost:3000/api/treinos';

export default function () {
  // 1. Criar treino (POST)
  const payload = JSON.stringify({
    nome: 'Supino Reto k6',
    tipo: 'musculacao',
    series: [{ repeticoes: 12, carga: 30 }]
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const resPost = http.post(BASE_URL, payload, params);

  check(resPost, {
    'POST status é 201': (r) => r.status === 201,
    'Retornou ID do banco': (r) => r.json('id') !== undefined,
  });

  const idCriado = resPost.json('id');
  sleep(0.5);

  // 2. Listar treinos (GET)
  const resGet = http.get(BASE_URL);
  check(resGet, {
    'GET status é 200': (r) => r.status === 200,
    'Lista não está vazia': (r) => r.json().length > 0,
  });

  sleep(0.5);

  // 3. Excluir o treino criado (DELETE)
  if (idCriado) {
    const resDel = http.del(`${BASE_URL}/${idCriado}`);
    check(resDel, {
      'DELETE status é 204': (r) => r.status === 204,
    });
  }
}
