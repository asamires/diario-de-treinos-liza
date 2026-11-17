const usuarioLogado = JSON.parse(sessionStorage.getItem("usuarioLogado"));

if (!usuarioLogado || !usuarioLogado.id) {
    window.location.href = "login.html";
}

let treinoEditando = null;

const formTreino = document.getElementById("formTreino");
const tipo = document.getElementById("tipo");
const nome = document.getElementById("nome");

const camposSeries = document.getElementById("camposSeries");
const camposCardio = document.getElementById("camposCardio");

const quantidadeSeries = document.getElementById("quantidadeSeries");
const listaSeries = document.getElementById("listaSeries");
const listaTreinos = document.getElementById("listaTreinos");

tipo.addEventListener("change", () => {
  camposSeries.style.display = "none";
  camposCardio.style.display = "none";
  listaSeries.innerHTML = "";
  quantidadeSeries.value = "";

  if (tipo.value === "musculacao" || tipo.value === "alongamento") {
    camposSeries.style.display = "flex";
  } else if (tipo.value === "cardio") {
    camposCardio.style.display = "flex";
  }
});

quantidadeSeries.addEventListener("input", () => {
  const qtd = Number(quantidadeSeries.value);
  listaSeries.innerHTML = "";

  if (qtd < 1 || !Number.isInteger(qtd) || qtd > 50) return;

  for (let i = 1; i <= qtd; i++) {
    const serie = document.createElement("div");
    serie.classList.add("serie");
    serie.innerHTML = `
      <h3>Série ${i}</h3>
      <div class="campo-serie">
        <label for="repeticoes-${i}">Repetições</label>
        <input type="number" id="repeticoes-${i}" min="1" placeholder="Ex: 12" required>
      </div>
      <div class="campo-serie">
        <label for="carga-${i}">Carga (kg)</label>
        <input type="number" id="carga-${i}" min="0" step="0.5" placeholder="Ex: 20" required>
      </div>
    `;
    listaSeries.appendChild(serie);
  }
});

// Busca apenas os treinos do usuário logado
async function carregarTreinos() {
  const resposta = await fetch(`/api/treinos?usuarioId=${usuarioLogado.id}`);
  const treinos = await resposta.json();
  mostrarTreinos(treinos);
}

function mostrarTreinos(treinos) {
  listaTreinos.innerHTML = "";

  if (treinos.length === 0) {
    listaTreinos.innerHTML = `
      <li class="lista-vazia">
        <img src="../assets/gym cinza.png" alt="Ícone de halter">
        <p>Nenhum exercício registrado ainda.</p>
      </li>
    `;
    return;
  }

  treinos.forEach((treino) => {
    const item = document.createElement("li");
    item.classList.add("item-treino");

    const titulo = document.createElement("h3");
    titulo.textContent = treino.nome;

    const categoria = document.createElement("p");
    categoria.textContent = treino.tipo;

    const detalhes = document.createElement("div");
    detalhes.classList.add("detalhes-treino");

    if (treino.tipo === "cardio") {
      detalhes.textContent = `Duração: ${treino.duracao} minutos`;
      if (treino.distancia) {
        detalhes.textContent += ` | Distância: ${treino.distancia} km`;
      }
    } else if (treino.series) {
      treino.series.forEach((serie, indice) => {
        const linha = document.createElement("p");
        linha.textContent = `Série ${indice + 1}: ${serie.repeticoes} repetições | ${serie.carga} kg`;
        detalhes.appendChild(linha);
      });
    }

    const btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.textContent = "Excluir";
    btnExcluir.classList.add("btn-excluir");

    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.textContent = "Editar";
    btnEditar.classList.add("btn-editar");

   
    btnExcluir.addEventListener("click", async () => {
    const confirmarExclusao = confirm(
    `Deseja realmente excluir o exercício "${treino.nome}"?`
    );

  if (confirmarExclusao) {
    await fetch(`/api/treinos/${treino.id}`, {
      method: "DELETE"
    });

    carregarTreinos();
  }
});

    btnEditar.addEventListener("click", () => {
  treinoEditando = treino.id;

  nome.value = treino.nome;
  tipo.value = treino.tipo;

  tipo.dispatchEvent(new Event("change"));

  if (treino.tipo === "musculacao" || treino.tipo === "alongamento") {
    quantidadeSeries.value = treino.series.length;
    quantidadeSeries.dispatchEvent(new Event("input"));

    treino.series.forEach((serie, indice) => {
      document.getElementById(`repeticoes-${indice + 1}`).value = serie.repeticoes;
      document.getElementById(`carga-${indice + 1}`).value = serie.carga;
    });
  }

  if (treino.tipo === "cardio") {
    document.getElementById("duracaoCardio").value = treino.duracao || "";
    document.getElementById("distanciaCardio").value = treino.distancia || "";
  }

  formTreino.querySelector('button[type="submit"]').textContent = "Salvar alterações";

  formTreino.scrollIntoView({ behavior: "smooth" });
});

    const grupoBotoes = document.createElement("div");
    grupoBotoes.classList.add("grupo-botoes");

    grupoBotoes.append(btnEditar, btnExcluir);

    item.append(titulo, categoria, detalhes, grupoBotoes);
    listaTreinos.appendChild(item);

    
  });
}

// Envia o novo treino amarrado ao ID do usuário atual
formTreino.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const dadosTreino = {
    nome: nome.value.trim(),
    tipo: tipo.value,
    series: [],
    duracao: null,
    distancia: null,
    usuarioId: usuarioLogado.id
  };

  if (tipo.value === "musculacao" || tipo.value === "alongamento") {
    const qtd = Number(quantidadeSeries.value);
    for (let i = 1; i <= qtd; i++) {
      const rep = document.getElementById(`repeticoes-${i}`).value;
      const carga = document.getElementById(`carga-${i}`).value;

      if (!rep || !carga) {
        alert(`Preencha as repetições e a carga da série ${i}.`);
        return;
      }
      dadosTreino.series.push({ repeticoes: Number(rep), carga: Number(carga) });
    }
  }

  if (tipo.value === "cardio") {
    const duracao = document.getElementById("duracaoCardio").value;
    const distancia = document.getElementById("distanciaCardio").value;

    if (!duracao || Number(duracao) < 1) {
      alert("Informe a duração do exercício.");
      return;
    }
    dadosTreino.duracao = Number(duracao);
    dadosTreino.duracao = Number(duracao);
    dadosTreino.distancia = distancia ? Number(distancia) : null;
  }

  await fetch("/api/treinos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosTreino)
  });

  formTreino.reset();
  camposSeries.style.display = "none";
  camposCardio.style.display = "none";
  listaSeries.innerHTML = "";
  carregarTreinos();
});

carregarTreinos();
