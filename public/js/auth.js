const formLogin = document.getElementById("formLogin");
const formCadastro = document.getElementById("formCadastro");

// 1. Fluxo de Login
if (formLogin) {
  formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const login = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    const resposta = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro || "Falha ao fazer login.");
      return;
    }

    sessionStorage.setItem("usuarioLogado", JSON.stringify(dados));
    window.location.href = "/html/index.html";
  });
}

// 2. Fluxo de Cadastro
if (formCadastro) {
  formCadastro.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const payload = {
      nome: document.getElementById("nome").value.trim(),
      dataNascimento: document.getElementById("dataNascimento").value,
      user: document.getElementById("user").value.trim(),
      email: document.getElementById("email").value.trim(),
      senha: document.getElementById("senha").value,
      confirmarSenha: document.getElementById("confirmarSenha").value
    };

    const resposta = await fetch("/api/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro || "Erro ao realizar cadastro.");
      return;
    }

    alert("Conta criada com sucesso! Faça seu login.");
    window.location.href = "/html/login.html";
  });
}
