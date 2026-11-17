import http from 'k6/http';
import { check, group } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: { checks: ['rate == 1'] }
};

const BASE_URL = 'http://localhost:3000';

const H = {
  headers: { 'Content-Type': 'application/json' }
};

const post = (p, b) =>
  http.post(`${BASE_URL}${p}`, JSON.stringify(b), H);

export default function () {
  const user = `reg${Date.now()}`;

  const dados = {
    nome: 'Regressao',
    dataNascimento: '2000-01-01',
    user: user,
    email: `${user}@teste.com`,
    senha: '123456',
    confirmarSenha: '123456'
  };

  group('Cadastro', function () {
    const resposta = post('/api/cadastro', dados);

    console.log('STATUS CADASTRO:', resposta.status);
    console.log('RESPOSTA CADASTRO:', resposta.body);

    check(resposta, {
      'criar conta (201)': (r) => r.status === 201
    });
  });

  group('Cadastro duplicado', function () {
    const respostaDuplicada = post('/api/cadastro', dados);

    console.log('STATUS DUPLICADO:', respostaDuplicada.status);
    console.log('RESPOSTA DUPLICADA:', respostaDuplicada.body);

    check(respostaDuplicada, {
      'impedir cadastro duplicado (409)': (r) => r.status === 409
    });
  });

  group('Login com senha correta', function () {
    const respostaLogin = post('/api/login', {
      login: dados.user,
      senha: dados.senha
    });

    console.log('STATUS LOGIN:', respostaLogin.status);
    console.log('RESPOSTA LOGIN:', respostaLogin.body);

    check(respostaLogin, {
      'realizar login (200)': (r) => r.status === 200
    });
  });

  group('Login com senha incorreta', function () {
    const respostaSenhaIncorreta = post('/api/login', {
      login: dados.user,
      senha: 'senhaerrada'
    });

    console.log('STATUS SENHA INCORRETA:', respostaSenhaIncorreta.status);

    check(respostaSenhaIncorreta, {
      'rejeitar senha incorreta (401)': (r) => r.status === 401
    });
  });
}