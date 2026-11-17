import express from 'express';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { sequelize, Usuario, Treino, Serie } from './database.js';

const app = express();
const PORTA = 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/html/login.html');
});

function gerarHashSenha(senha) {
  return crypto.createHash('sha256').update(senha).digest('hex');
}

// Rota de Cadastro
app.post('/api/cadastro', async (req, res) => {
  try {
    const { nome, dataNascimento, user, email, senha, confirmarSenha } = req.body;

    if (!nome || !dataNascimento || !user || !email || !senha || !confirmarSenha) {
      return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
    }

    const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{2,80}$/;
    if (!regexNome.test(nome.trim())) {
      return res.status(400).json({ erro: 'O nome deve conter apenas letras.' });
    }

    if (user.trim().length < 3 || user.trim().length > 30 || /\s/.test(user.trim())) {
      return res.status(400).json({ erro: 'O user deve ter entre 3 e 30 caracteres sem espaços.' });
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email.trim())) {
      return res.status(400).json({ erro: 'Informe um e-mail válido contendo @ e ponto.' });
    }

    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const diffMes = hoje.getMonth() - nascimento.getMonth();
    if (diffMes < 0 || (diffMes === 0 && hoje.getDate() < nascimento.getDate())) idade--;

    if (isNaN(nascimento.getTime()) || idade < 14) {
      return res.status(400).json({ erro: 'Cadastro permitido apenas para maiores de 14 anos.' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
    }
    if (senha !== confirmarSenha) {
      return res.status(400).json({ erro: 'As senhas digitadas não conferem.' });
    }

    const usuarioExistente = await Usuario.findOne({
      where: {
        [Op.or]: [{ email: email.trim().toLowerCase() }, { user: user.trim().toLowerCase() }]
      }
    });

    if (usuarioExistente) {
      return res.status(409).json({ erro: 'Este user ou e-mail já está em uso.' });
    }

    const novoUsuario = await Usuario.create({
      nome: nome.trim(),
      dataNascimento,
      user: user.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      senha: gerarHashSenha(senha)
    });

    res.status(201).json({ id: novoUsuario.id, nome: novoUsuario.nome });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao criar conta no banco de dados.' });
  }
});

// Rota de Login
app.post('/api/login', async (req, res) => {
  try {
    const { login, senha } = req.body;
    const identificador = (login || '').trim().toLowerCase();

    if (!identificador || !senha) {
      return res.status(400).json({ erro: 'Informe seu e-mail/user e a senha.' });
    }

    const usuario = await Usuario.findOne({
      where: {
        [Op.or]: [{ email: identificador }, { user: identificador }]
      }
    });

    if (!usuario || usuario.senha !== gerarHashSenha(senha)) {
      return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
    }

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      user: usuario.user,
      email: usuario.email
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao processar o login.' });
  }
});

// Rota GET: Buscar treinos do usuário logado (passado via Query Param)
app.get('/api/treinos', async (req, res) => {
  try {
    const { usuarioId } = req.query;
    if (!usuarioId) {
      return res.status(400).json({ erro: 'Usuário não autenticado.' });
    }

    const treinos = await Treino.findAll({
      where: { UsuarioId: usuarioId },
      include: { model: Serie, as: 'series' },
      order: [['id', 'DESC']]
    });
    res.json(treinos);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar os treinos.' });
  }
});

// Rota POST: Criar treino amarrado ao usuário
app.post('/api/treinos', async (req, res) => {
  try {
    const { nome, tipo, duracao, distancia, series, usuarioId } = req.body;

    if (!nome || !tipo || !usuarioId) {
      return res.status(400).json({ erro: 'Dados incompletos para registrar o treino.' });
    }

    const novoTreino = await Treino.create(
      {
        nome,
        tipo,
        duracao: duracao ? Number(duracao) : null,
        distancia: distancia ? Number(distancia) : null,
        UsuarioId: usuarioId,
        series: series || []
      },
      {
        include: [{ model: Serie, as: 'series' }]
      }
    );

    res.status(201).json(novoTreino);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao guardar o treino na base de dados.' });
  }
});

// Rota DELETE: Excluir treino
app.delete('/api/treinos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const apagados = await Treino.destroy({ where: { id } });

    if (!apagados) {
      return res.status(404).json({ erro: 'Treino não encontrado.' });
    }

    res.status(204).send();
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao excluir o treino.' });
  }
});

sequelize.sync().then(() => {
  app.listen(PORTA, () => {
    console.log(`Servidor ativo em http://localhost:${PORTA}`);
  });
});
