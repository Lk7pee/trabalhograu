const $ = (seletor) => document.querySelector(seletor);

const botaoMenu = $("#botaoMenu");
const linksMenu = $("#linksMenu");

botaoMenu.addEventListener("click", () => {
    linksMenu.classList.toggle("aberto");
});

linksMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => linksMenu.classList.remove("aberto"));
});

// Jogo Neon Dodge
const canvas = $("#canvasJogo");
const ctx = canvas.getContext("2d");
const pontosEl = $("#pontos");
const vidasEl = $("#vidas");
const nivelEl = $("#nivel");
const formRanking = $("#formRanking");
const pontosFinais = $("#pontosFinais");
const nomeJogador = $("#nomeJogador");
const listaRanking = $("#listaRanking");

let jogo = {
    rodando: false,
    pausado: false,
    pontos: 0,
    vidas: 3,
    nivel: 1,
    ultimoTempo: 0,
    tempoObstaculo: 0,
    teclas: {},
    toque: {},
    obstaculos: [],
    jogador: { x: 360, y: 340, tamanho: 28, velocidade: 5 }
};

function ajustarCanvas() {
    const largura = canvas.clientWidth;
    const altura = canvas.clientHeight;
    canvas.width = largura;
    canvas.height = altura;
    jogo.jogador.x = Math.min(jogo.jogador.x, largura - 30);
    jogo.jogador.y = Math.min(jogo.jogador.y, altura - 30);
    desenharJogo();
}

function iniciarJogo() {
    jogo.rodando = true;
    jogo.pausado = false;
    jogo.pontos = 0;
    jogo.vidas = 3;
    jogo.nivel = 1;
    jogo.ultimoTempo = 0;
    jogo.tempoObstaculo = 0;
    jogo.obstaculos = [];
    jogo.jogador.x = canvas.width / 2;
    jogo.jogador.y = canvas.height - 55;
    formRanking.classList.add("escondido");
    atualizarPlacar();
    requestAnimationFrame(loopJogo);
}

function loopJogo(tempo) {
    if (!jogo.rodando) return;
    if (!jogo.ultimoTempo) jogo.ultimoTempo = tempo;

    const intervalo = tempo - jogo.ultimoTempo;
    jogo.ultimoTempo = tempo;

    if (!jogo.pausado) {
        atualizarJogo(intervalo);
        desenharJogo();
    }

    requestAnimationFrame(loopJogo);
}

function atualizarJogo(intervalo) {
    jogo.pontos += Math.floor(intervalo / 16);
    jogo.nivel = Math.floor(jogo.pontos / 250) + 1;
    jogo.tempoObstaculo += intervalo;

    moverJogador();

    const demora = Math.max(350, 900 - jogo.nivel * 70);
    if (jogo.tempoObstaculo > demora) {
        jogo.tempoObstaculo = 0;
        criarObstaculo();
    }

    jogo.obstaculos.forEach((obstaculo) => {
        obstaculo.y += obstaculo.velocidade + jogo.nivel * 0.3;
    });

    jogo.obstaculos = jogo.obstaculos.filter((obstaculo) => obstaculo.y < canvas.height + 60);

    for (const obstaculo of jogo.obstaculos) {
        if (bateu(obstaculo)) {
            jogo.vidas--;
            obstaculo.y = canvas.height + 100;
            if (jogo.vidas <= 0) finalizarJogo();
        }
    }

    atualizarPlacar();
}

function moverJogador() {
    const j = jogo.jogador;
    if (jogo.teclas.ArrowLeft || jogo.teclas.a || jogo.toque.left) j.x -= j.velocidade;
    if (jogo.teclas.ArrowRight || jogo.teclas.d || jogo.toque.right) j.x += j.velocidade;
    if (jogo.teclas.ArrowUp || jogo.teclas.w || jogo.toque.up) j.y -= j.velocidade;
    if (jogo.teclas.ArrowDown || jogo.teclas.s || jogo.toque.down) j.y += j.velocidade;

    j.x = Math.max(j.tamanho, Math.min(canvas.width - j.tamanho, j.x));
    j.y = Math.max(j.tamanho, Math.min(canvas.height - j.tamanho, j.y));
}

function criarObstaculo() {
    const tamanho = 25 + Math.random() * 35;
    jogo.obstaculos.push({
        x: Math.random() * (canvas.width - tamanho),
        y: -tamanho,
        largura: tamanho,
        altura: tamanho,
        velocidade: 2 + Math.random() * 3,
        cor: Math.random() > 0.5 ? "#ff43d0" : "#27f5ff"
    });
}

function bateu(obstaculo) {
    const j = jogo.jogador;
    return (
        j.x - j.tamanho < obstaculo.x + obstaculo.largura &&
        j.x + j.tamanho > obstaculo.x &&
        j.y - j.tamanho < obstaculo.y + obstaculo.altura &&
        j.y + j.tamanho > obstaculo.y
    );
}

function desenharJogo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#050611";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(39, 245, 255, 0.12)";
    for (let x = 0; x < canvas.width; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 36) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.shadowBlur = 18;
    jogo.obstaculos.forEach((obstaculo) => {
        ctx.shadowColor = obstaculo.cor;
        ctx.fillStyle = obstaculo.cor;
        ctx.fillRect(obstaculo.x, obstaculo.y, obstaculo.largura, obstaculo.altura);
    });

    const j = jogo.jogador;
    ctx.shadowColor = "#b8ff55";
    ctx.fillStyle = "#b8ff55";
    ctx.beginPath();
    ctx.moveTo(j.x, j.y - j.tamanho);
    ctx.lineTo(j.x + j.tamanho, j.y + j.tamanho);
    ctx.lineTo(j.x - j.tamanho, j.y + j.tamanho);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
}

function finalizarJogo() {
    jogo.rodando = false;
    pontosFinais.textContent = jogo.pontos;
    formRanking.classList.remove("escondido");
}

function atualizarPlacar() {
    pontosEl.textContent = jogo.pontos;
    vidasEl.textContent = jogo.vidas;
    nivelEl.textContent = jogo.nivel;
}

$("#iniciarJogo").addEventListener("click", iniciarJogo);
$("#pausarJogo").addEventListener("click", () => {
    if (jogo.rodando) jogo.pausado = !jogo.pausado;
});

window.addEventListener("keydown", (evento) => jogo.teclas[evento.key] = true);
window.addEventListener("keyup", (evento) => jogo.teclas[evento.key] = false);
window.addEventListener("resize", ajustarCanvas);

document.querySelectorAll("[data-move]").forEach((botao) => {
    const direcao = botao.dataset.move;
    botao.addEventListener("pointerdown", () => jogo.toque[direcao] = true);
    botao.addEventListener("pointerup", () => jogo.toque[direcao] = false);
    botao.addEventListener("pointerleave", () => jogo.toque[direcao] = false);
});

function carregarRanking() {
    const ranking = JSON.parse(localStorage.getItem("vibeplay-ranking")) || [];
    listaRanking.innerHTML = ranking.length ? "" : "<li>Ninguém no ranking ainda.</li>";
    ranking.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = `${item.nome} - ${item.pontos} pontos`;
        listaRanking.appendChild(li);
    });
}

formRanking.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const nome = nomeJogador.value.trim();
    if (!nome) return;

    const ranking = JSON.parse(localStorage.getItem("vibeplay-ranking")) || [];
    ranking.push({ nome, pontos: jogo.pontos });
    ranking.sort((a, b) => b.pontos - a.pontos);
    localStorage.setItem("vibeplay-ranking", JSON.stringify(ranking.slice(0, 5)));

    nomeJogador.value = "";
    formRanking.classList.add("escondido");
    carregarRanking();
});

// Quiz
const perguntas = [
    {
        texto: "No tempo livre, você prefere:",
        opcoes: [
            ["Jogar e competir", "Gamer competitivo"],
            ["Assistir filmes e séries", "Cinéfilo de plantão"],
            ["Sair com a galera", "Festeiro social"],
            ["Criar algo diferente", "Criativo alternativo"]
        ]
    },
    {
        texto: "Seu rolê perfeito tem:",
        opcoes: [
            ["Desafio", "Gamer competitivo"],
            ["Pipoca", "Cinéfilo de plantão"],
            ["Música", "Festeiro social"],
            ["Arte", "Criativo alternativo"]
        ]
    },
    {
        texto: "Você se anima mais com:",
        opcoes: [
            ["Ranking", "Gamer competitivo"],
            ["História boa", "Cinéfilo de plantão"],
            ["Amigos juntos", "Festeiro social"],
            ["Ideias novas", "Criativo alternativo"]
        ]
    }
];

const textosResultado = {
    "Gamer competitivo": "Sua vibe é vencer desafios, subir de nível e buscar o topo.",
    "Cinéfilo de plantão": "Sua vibe é curtir histórias, personagens e boas maratonas.",
    "Festeiro social": "Sua vibe é juntar pessoas e transformar tudo em lembrança.",
    "Criativo alternativo": "Sua vibe é inventar, experimentar e fugir do óbvio."
};

let perguntaAtual = 0;
let pontosQuiz = {};

function mostrarPergunta() {
    $("#resultadoQuiz").classList.add("escondido");
    $("#contadorQuiz").textContent = `Pergunta ${perguntaAtual + 1} de ${perguntas.length}`;
    $("#perguntaQuiz").textContent = perguntas[perguntaAtual].texto;
    $("#opcoesQuiz").innerHTML = "";

    perguntas[perguntaAtual].opcoes.forEach(([texto, resultado]) => {
        const botao = document.createElement("button");
        botao.textContent = texto;
        botao.addEventListener("click", () => responderQuiz(resultado));
        $("#opcoesQuiz").appendChild(botao);
    });
}

function responderQuiz(resultado) {
    pontosQuiz[resultado] = (pontosQuiz[resultado] || 0) + 1;
    perguntaAtual++;

    if (perguntaAtual >= perguntas.length) {
        const vencedor = Object.entries(pontosQuiz).sort((a, b) => b[1] - a[1])[0][0];
        $("#opcoesQuiz").innerHTML = "";
        $("#contadorQuiz").textContent = "";
        $("#perguntaQuiz").textContent = "";
        $("#tituloResultado").textContent = vencedor;
        $("#textoResultado").textContent = textosResultado[vencedor];
        $("#resultadoQuiz").classList.remove("escondido");
        return;
    }

    mostrarPergunta();
}

$("#refazerQuiz").addEventListener("click", () => {
    perguntaAtual = 0;
    pontosQuiz = {};
    mostrarPergunta();
});

// Mural
const formMural = $("#formMural");
const listaRecados = $("#listaRecados");

function carregarRecados() {
    const recados = JSON.parse(localStorage.getItem("vibeplay-recados")) || [];
    listaRecados.innerHTML = "";

    if (!recados.length) {
        listaRecados.innerHTML = "<p>Ainda não tem recado.</p>";
        return;
    }

    recados.slice().reverse().forEach((recado) => {
        const card = document.createElement("article");
        card.className = "recado";
        card.innerHTML = `<h4>${recado.nome}</h4><p>${recado.mensagem}</p>`;
        listaRecados.appendChild(card);
    });
}

formMural.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const nome = $("#nomeRecado").value.trim();
    const mensagem = $("#mensagemRecado").value.trim();
    const erro = $("#erroMural");

    if (!nome || !mensagem) {
        erro.textContent = "Preencha nome e mensagem.";
        return;
    }

    erro.textContent = "";
    const recados = JSON.parse(localStorage.getItem("vibeplay-recados")) || [];
    recados.push({ nome, mensagem });
    localStorage.setItem("vibeplay-recados", JSON.stringify(recados.slice(-8)));
    formMural.reset();
    carregarRecados();
});

ajustarCanvas();
carregarRanking();
mostrarPergunta();
carregarRecados();
