"use strict";

const $ = (seletor, contexto = document) => contexto.querySelector(seletor);
const $$ = (seletor, contexto = document) => [...contexto.querySelectorAll(seletor)];

const CHAVES_STORAGE = {
    ranking: "vibeplay-ranking",
    recados: "vibeplay-recados",
    tema: "vibeplay-theme"
};

function lerStorage(chave, valorPadrao = []) {
    try {
        const valor = JSON.parse(localStorage.getItem(chave));
        return valor ?? valorPadrao;
    } catch (erro) {
        console.warn(`Não foi possível ler ${chave}.`, erro);
        return valorPadrao;
    }
}

function salvarStorage(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
        return true;
    } catch (erro) {
        console.warn(`Não foi possível salvar ${chave}.`, erro);
        return false;
    }
}

// Navegação
const topo = $("#topo");
const botaoMenu = $("#botaoMenu");
const botaoTema = $("#botaoTema");
const linksMenu = $("#linksMenu");
const linksNavegacao = $$("#linksMenu a");
const metaThemeColor = $('meta[name="theme-color"]');
let canvasProntoParaTema = false;

function lerTemaPreferido() {
    try {
        return (localStorage.getItem(CHAVES_STORAGE.tema) || "").replaceAll('"', "");
    } catch (erro) {
        console.warn("Não foi possível ler o tema salvo.", erro);
        return "";
    }
}

function salvarTemaPreferido(tema) {
    try {
        localStorage.setItem(CHAVES_STORAGE.tema, tema);
    } catch (erro) {
        console.warn("Não foi possível salvar o tema.", erro);
    }
}

function aplicarTema(tema, deveRedesenhar = true) {
    const temaClaro = tema === "light";
    document.body.classList.toggle("light-theme", temaClaro);

    if (botaoTema) {
        botaoTema.textContent = temaClaro ? "Modo escuro" : "Modo claro";
        botaoTema.setAttribute("aria-label", temaClaro ? "Ativar modo escuro" : "Ativar modo claro");
    }

    if (metaThemeColor) {
        metaThemeColor.setAttribute("content", temaClaro ? "#F8F3EA" : "#11100E");
    }

    if (deveRedesenhar && canvasProntoParaTema) {
        desenharJogo(performance.now());
    }
}

const temaInicial = lerTemaPreferido() === "light" ? "light" : "dark";
aplicarTema(temaInicial, false);

function fecharMenu() {
    linksMenu.classList.remove("aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("menu-aberto");
}

function alternarMenu() {
    const estaAberto = botaoMenu.getAttribute("aria-expanded") === "true";

    if (estaAberto) {
        fecharMenu();
        return;
    }

    linksMenu.classList.add("aberto");
    botaoMenu.setAttribute("aria-expanded", "true");
    botaoMenu.setAttribute("aria-label", "Fechar menu");
    document.body.classList.add("menu-aberto");
}

botaoMenu.addEventListener("click", alternarMenu);
botaoTema?.addEventListener("click", () => {
    const proximoTema = document.body.classList.contains("light-theme") ? "dark" : "light";
    aplicarTema(proximoTema);
    salvarTemaPreferido(proximoTema);
});
linksNavegacao.forEach((link) => link.addEventListener("click", fecharMenu));

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        fecharMenu();
    }
});

document.addEventListener("click", (evento) => {
    const menuEstaAberto = botaoMenu.getAttribute("aria-expanded") === "true";
    if (menuEstaAberto && !evento.target.closest(".menu")) {
        fecharMenu();
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
        fecharMenu();
    }
});

function atualizarTopo() {
    topo.classList.toggle("com-fundo", window.scrollY > 18);
}

window.addEventListener("scroll", atualizarTopo, { passive: true });
atualizarTopo();

if ("IntersectionObserver" in window) {
    const secoesNavegaveis = ["inicio", "destaques", "arcade", "quiz", "mural"]
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    const observadorSecoes = new IntersectionObserver(
        (entradas) => {
            const secaoVisivel = entradas
                .filter((entrada) => entrada.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!secaoVisivel) return;

            linksNavegacao.forEach((link) => {
                const ativo = link.getAttribute("href") === `#${secaoVisivel.target.id}`;
                link.classList.toggle("ativo", ativo);
                if (ativo) {
                    link.setAttribute("aria-current", "page");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        },
        { rootMargin: "-28% 0px -62% 0px", threshold: [0, 0.1, 0.3] }
    );

    secoesNavegaveis.forEach((secao) => observadorSecoes.observe(secao));
}

// Bloco Rush
const canvas = $("#canvasJogo");
const contexto = canvas.getContext("2d");
const pontosEl = $("#pontos");
const vidasEl = $("#vidas");
const nivelEl = $("#nivel");
const statusJogoEl = $("#statusJogo");
const statusJogoContainer = $(".status-jogo");
const botaoIniciar = $("#iniciarJogo");
const botaoPausar = $("#pausarJogo");
const formRanking = $("#formRanking");
const pontosFinais = $("#pontosFinais");
const nomeJogador = $("#nomeJogador");
const erroRanking = $("#erroRanking");
const listaRanking = $("#listaRanking");
const botaoLimparRanking = $("#limparRanking");

const CORES_JOGO = ["#F4A261", "#E76F51", "#2A9D8F", "#B56576", "#E9C46A"];

const jogo = {
    rodando: false,
    pausado: false,
    quadroAnimacao: null,
    ultimoTempo: 0,
    pontos: 0,
    vidas: 3,
    nivel: 1,
    tempoObstaculo: 0,
    invulneravelAte: 0,
    largura: 760,
    altura: 428,
    escalaPixel: 1,
    teclas: new Set(),
    toque: new Set(),
    obstaculos: [],
    particulas: [],
    estrelas: [],
    jogador: {
        x: 380,
        y: 365,
        raio: 15,
        velocidade: 285
    }
};

let pontuacaoFinalPendente = 0;

function limitar(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(maximo, valor));
}

function criarEstrelas() {
    const quantidade = Math.max(28, Math.floor((jogo.largura * jogo.altura) / 9000));
    jogo.estrelas = Array.from({ length: quantidade }, () => ({
        x: Math.random() * jogo.largura,
        y: Math.random() * jogo.altura,
        raio: 0.35 + Math.random() * 1.15,
        alpha: 0.15 + Math.random() * 0.55,
        velocidade: 8 + Math.random() * 22
    }));
}

function ajustarCanvas() {
    const retangulo = canvas.getBoundingClientRect();
    const larguraAnterior = jogo.largura || retangulo.width;
    const alturaAnterior = jogo.altura || retangulo.height;
    const novaLargura = Math.max(280, Math.round(retangulo.width));
    const novaAltura = Math.max(230, Math.round(retangulo.height));
    const escalaPixel = Math.min(window.devicePixelRatio || 1, 2);

    jogo.largura = novaLargura;
    jogo.altura = novaAltura;
    jogo.escalaPixel = escalaPixel;

    canvas.width = Math.round(novaLargura * escalaPixel);
    canvas.height = Math.round(novaAltura * escalaPixel);
    contexto.setTransform(escalaPixel, 0, 0, escalaPixel, 0, 0);

    if (larguraAnterior && alturaAnterior) {
        const escalaX = novaLargura / larguraAnterior;
        const escalaY = novaAltura / alturaAnterior;

        jogo.jogador.x *= escalaX;
        jogo.jogador.y *= escalaY;
        jogo.obstaculos.forEach((obstaculo) => {
            obstaculo.x *= escalaX;
            obstaculo.y *= escalaY;
        });
    }

    jogo.jogador.x = limitar(jogo.jogador.x, jogo.jogador.raio + 5, novaLargura - jogo.jogador.raio - 5);
    jogo.jogador.y = limitar(jogo.jogador.y, jogo.jogador.raio + 5, novaAltura - jogo.jogador.raio - 5);

    criarEstrelas();
    desenharJogo(performance.now());
}

function atualizarStatusJogo(texto, estado = "pronto") {
    statusJogoEl.innerHTML = "";
    const indicador = document.createElement("i");
    statusJogoEl.append(indicador, document.createTextNode(` ${texto}`));

    statusJogoContainer.classList.toggle("pausado", estado === "pausado");
    statusJogoContainer.classList.toggle("encerrado", estado === "encerrado");
}

function atualizarPlacar() {
    pontosEl.textContent = Math.floor(jogo.pontos).toLocaleString("pt-BR");
    vidasEl.textContent = jogo.vidas;
    nivelEl.textContent = jogo.nivel;
}

function reiniciarEstadoJogo() {
    jogo.pontos = 0;
    jogo.vidas = 3;
    jogo.nivel = 1;
    jogo.tempoObstaculo = 0;
    jogo.invulneravelAte = 0;
    jogo.ultimoTempo = 0;
    jogo.obstaculos = [];
    jogo.particulas = [];
    jogo.teclas.clear();
    jogo.toque.clear();
    jogo.jogador.x = jogo.largura / 2;
    jogo.jogador.y = jogo.altura - 46;
}

function iniciarJogo() {
    if (jogo.quadroAnimacao !== null) {
        cancelAnimationFrame(jogo.quadroAnimacao);
        jogo.quadroAnimacao = null;
    }

    reiniciarEstadoJogo();
    jogo.rodando = true;
    jogo.pausado = false;
    pontuacaoFinalPendente = 0;

    formRanking.classList.add("escondido");
    erroRanking.textContent = "";
    nomeJogador.classList.remove("invalido");
    botaoPausar.disabled = false;
    botaoPausar.textContent = "Pausar";
    botaoIniciar.innerHTML = '<span aria-hidden="true">↻</span> Reiniciar';
    atualizarStatusJogo("Jogando");
    atualizarPlacar();
    jogo.quadroAnimacao = requestAnimationFrame(loopJogo);
}

function alternarPausa() {
    if (!jogo.rodando) return;

    jogo.pausado = !jogo.pausado;
    jogo.ultimoTempo = 0;
    botaoPausar.textContent = jogo.pausado ? "Continuar" : "Pausar";
    atualizarStatusJogo(jogo.pausado ? "Pausado" : "Jogando", jogo.pausado ? "pausado" : "pronto");
    desenharJogo(performance.now());
}

function loopJogo(tempoAtual) {
    if (!jogo.rodando) {
        jogo.quadroAnimacao = null;
        return;
    }

    if (!jogo.ultimoTempo) {
        jogo.ultimoTempo = tempoAtual;
    }

    const intervalo = Math.min((tempoAtual - jogo.ultimoTempo) / 1000, 0.035);
    jogo.ultimoTempo = tempoAtual;

    if (!jogo.pausado) {
        atualizarJogo(intervalo, tempoAtual);
    }

    desenharJogo(tempoAtual);

    if (jogo.rodando) {
        jogo.quadroAnimacao = requestAnimationFrame(loopJogo);
    } else {
        jogo.quadroAnimacao = null;
    }
}

function atualizarJogo(intervalo, tempoAtual) {
    jogo.pontos += intervalo * (58 + jogo.nivel * 2);
    const novoNivel = Math.floor(jogo.pontos / 420) + 1;

    if (novoNivel !== jogo.nivel) {
        jogo.nivel = novoNivel;
        criarExplosao(jogo.largura / 2, 38, varCor("--accent"), 18);
    }

    moverJogador(intervalo);
    atualizarEstrelas(intervalo);

    jogo.tempoObstaculo += intervalo * 1000;
    const intervaloObstaculo = Math.max(270, 910 - (jogo.nivel - 1) * 62);

    while (jogo.tempoObstaculo >= intervaloObstaculo) {
        jogo.tempoObstaculo -= intervaloObstaculo;
        criarObstaculo();
    }

    jogo.obstaculos.forEach((obstaculo) => {
        obstaculo.y += obstaculo.velocidade * intervalo;
        obstaculo.rotacao += obstaculo.giro * intervalo;
    });

    for (const obstaculo of jogo.obstaculos) {
        if (!obstaculo.atingido && colidiu(obstaculo) && tempoAtual >= jogo.invulneravelAte) {
            obstaculo.atingido = true;
            jogo.vidas -= 1;
            jogo.invulneravelAte = tempoAtual + 850;
            criarExplosao(jogo.jogador.x, jogo.jogador.y, obstaculo.cor, 24);

            if (jogo.vidas <= 0) {
                atualizarPlacar();
                finalizarJogo();
                break;
            }
        }
    }

    jogo.obstaculos = jogo.obstaculos.filter(
        (obstaculo) => !obstaculo.atingido && obstaculo.y < jogo.altura + obstaculo.tamanho * 2
    );

    jogo.particulas.forEach((particula) => {
        particula.x += particula.vx * intervalo;
        particula.y += particula.vy * intervalo;
        particula.vida -= intervalo;
        particula.vx *= 0.985;
        particula.vy *= 0.985;
    });
    jogo.particulas = jogo.particulas.filter((particula) => particula.vida > 0);

    atualizarPlacar();
}

function moverJogador(intervalo) {
    const esquerda = jogo.teclas.has("arrowleft") || jogo.teclas.has("a") || jogo.toque.has("left");
    const direita = jogo.teclas.has("arrowright") || jogo.teclas.has("d") || jogo.toque.has("right");
    const cima = jogo.teclas.has("arrowup") || jogo.teclas.has("w") || jogo.toque.has("up");
    const baixo = jogo.teclas.has("arrowdown") || jogo.teclas.has("s") || jogo.toque.has("down");

    let eixoX = Number(direita) - Number(esquerda);
    let eixoY = Number(baixo) - Number(cima);

    if (eixoX && eixoY) {
        const normalizacao = Math.SQRT1_2;
        eixoX *= normalizacao;
        eixoY *= normalizacao;
    }

    jogo.jogador.x += eixoX * jogo.jogador.velocidade * intervalo;
    jogo.jogador.y += eixoY * jogo.jogador.velocidade * intervalo;
    jogo.jogador.x = limitar(jogo.jogador.x, jogo.jogador.raio + 4, jogo.largura - jogo.jogador.raio - 4);
    jogo.jogador.y = limitar(jogo.jogador.y, jogo.jogador.raio + 4, jogo.altura - jogo.jogador.raio - 4);
}

function atualizarEstrelas(intervalo) {
    jogo.estrelas.forEach((estrela) => {
        estrela.y += (estrela.velocidade + jogo.nivel * 2) * intervalo;
        if (estrela.y > jogo.altura) {
            estrela.y = -3;
            estrela.x = Math.random() * jogo.largura;
        }
    });
}

function criarObstaculo() {
    const tamanho = 18 + Math.random() * 27;
    const margem = tamanho + 3;
    const velocidadeBase = 115 + jogo.nivel * 15;

    jogo.obstaculos.push({
        x: margem + Math.random() * Math.max(1, jogo.largura - margem * 2),
        y: -tamanho * 1.8,
        tamanho,
        velocidade: velocidadeBase + Math.random() * 78,
        cor: CORES_JOGO[Math.floor(Math.random() * CORES_JOGO.length)],
        rotacao: Math.random() * Math.PI,
        giro: (Math.random() - 0.5) * 2.4,
        atingido: false
    });

    if (jogo.nivel >= 5 && Math.random() < Math.min(0.34, jogo.nivel * 0.035)) {
        const tamanhoExtra = 14 + Math.random() * 18;
        jogo.obstaculos.push({
            x: tamanhoExtra + Math.random() * Math.max(1, jogo.largura - tamanhoExtra * 2),
            y: -tamanhoExtra * 3.5,
            tamanho: tamanhoExtra,
            velocidade: velocidadeBase + 55 + Math.random() * 90,
            cor: CORES_JOGO[Math.floor(Math.random() * CORES_JOGO.length)],
            rotacao: Math.random() * Math.PI,
            giro: (Math.random() - 0.5) * 3.2,
            atingido: false
        });
    }
}

function colidiu(obstaculo) {
    const metade = obstaculo.tamanho / 2;
    const pontoX = limitar(jogo.jogador.x, obstaculo.x - metade, obstaculo.x + metade);
    const pontoY = limitar(jogo.jogador.y, obstaculo.y - metade, obstaculo.y + metade);
    const distanciaX = jogo.jogador.x - pontoX;
    const distanciaY = jogo.jogador.y - pontoY;
    const raioColisao = jogo.jogador.raio * 0.72;

    return distanciaX * distanciaX + distanciaY * distanciaY < raioColisao * raioColisao;
}

function criarExplosao(x, y, cor, quantidade = 18) {
    for (let indice = 0; indice < quantidade; indice += 1) {
        const angulo = Math.random() * Math.PI * 2;
        const forca = 35 + Math.random() * 135;
        jogo.particulas.push({
            x,
            y,
            vx: Math.cos(angulo) * forca,
            vy: Math.sin(angulo) * forca,
            vida: 0.35 + Math.random() * 0.55,
            vidaInicial: 0.9,
            tamanho: 1 + Math.random() * 3,
            cor
        });
    }
}

function varCor(nome) {
    const estiloBody = getComputedStyle(document.body).getPropertyValue(nome).trim();
    return estiloBody || getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
}

function desenharFundo() {
    contexto.fillStyle = varCor("--surface") || "#211F1A";
    contexto.fillRect(0, 0, jogo.largura, jogo.altura);

    contexto.fillStyle = varCor("--surface-2") || "#2A2721";
    for (let y = 0; y < jogo.altura; y += 86) {
        contexto.fillRect(0, y, jogo.largura, 34);
    }

    jogo.estrelas.forEach((estrela) => {
        contexto.globalAlpha = estrela.alpha * 0.55;
        contexto.fillStyle = estrela.raio > 1 ? varCor("--accent-3") : varCor("--text-soft");
        contexto.fillRect(estrela.x, estrela.y, estrela.raio * 2, estrela.raio * 2);
    });
    contexto.globalAlpha = 1;

    contexto.save();
    contexto.strokeStyle = varCor("--border") || "rgba(255, 244, 223, 0.14)";
    contexto.lineWidth = 1;

    for (let x = jogo.largura / 4; x < jogo.largura; x += jogo.largura / 4) {
        contexto.beginPath();
        contexto.moveTo(x, 16);
        contexto.lineTo(x, jogo.altura - 16);
        contexto.stroke();
    }

    contexto.strokeStyle = varCor("--border-strong") || "rgba(255, 244, 223, 0.28)";
    contexto.lineWidth = 2;
    contexto.strokeRect(10, 10, jogo.largura - 20, jogo.altura - 20);
    contexto.restore();
}

function desenharObstaculos() {
    jogo.obstaculos.forEach((obstaculo) => {
        contexto.save();
        contexto.translate(obstaculo.x, obstaculo.y);
        contexto.rotate(obstaculo.rotacao);
        contexto.strokeStyle = "rgba(17, 16, 14, 0.72)";
        contexto.fillStyle = obstaculo.cor;
        contexto.lineWidth = 2;
        contexto.fillRect(-obstaculo.tamanho / 2, -obstaculo.tamanho / 2, obstaculo.tamanho, obstaculo.tamanho);
        contexto.strokeRect(-obstaculo.tamanho / 2, -obstaculo.tamanho / 2, obstaculo.tamanho, obstaculo.tamanho);
        contexto.fillStyle = "rgba(255, 244, 223, 0.24)";
        contexto.fillRect(-obstaculo.tamanho / 2 + 4, -obstaculo.tamanho / 2 + 4, obstaculo.tamanho * 0.28, obstaculo.tamanho * 0.28);
        contexto.restore();
    });
}

function desenharParticulas() {
    jogo.particulas.forEach((particula) => {
        contexto.save();
        contexto.globalAlpha = limitar(particula.vida / particula.vidaInicial, 0, 1);
        contexto.fillStyle = particula.cor;
        contexto.fillRect(particula.x, particula.y, particula.tamanho, particula.tamanho);
        contexto.restore();
    });
}

function desenharJogador(tempoAtual) {
    const estaPiscando = tempoAtual < jogo.invulneravelAte && Math.floor(tempoAtual / 90) % 2 === 0;
    if (estaPiscando) return;

    const jogador = jogo.jogador;
    contexto.save();
    contexto.translate(jogador.x, jogador.y);

    contexto.fillStyle = "rgba(0, 0, 0, 0.28)";
    contexto.beginPath();
    contexto.arc(3, 4, jogador.raio * 0.96, 0, Math.PI * 2);
    contexto.fill();

    contexto.fillStyle = varCor("--accent") || "#2A9D8F";
    contexto.strokeStyle = "rgba(255, 244, 223, 0.34)";
    contexto.lineWidth = 2;
    contexto.beginPath();
    contexto.arc(0, 0, jogador.raio, 0, Math.PI * 2);
    contexto.fill();
    contexto.stroke();

    contexto.fillStyle = varCor("--accent-3") || "#E9C46A";
    contexto.beginPath();
    contexto.arc(0, 0, jogador.raio * 0.42, 0, Math.PI * 2);
    contexto.fill();
    contexto.restore();
}

function desenharInterfaceCanvas() {
    contexto.save();
    contexto.font = "800 11px Segoe UI, sans-serif";
    contexto.fillStyle = varCor("--text-muted") || "#CBBFA8";
    contexto.fillText(`VELOCIDADE x${(1 + (jogo.nivel - 1) * 0.12).toFixed(2)}`, 13, 21);
    contexto.textAlign = "right";
    contexto.fillText(`NÍVEL ${String(jogo.nivel).padStart(2, "0")}`, jogo.largura - 13, 21);
    contexto.restore();
}

function desenharMensagemCanvas(titulo, subtitulo) {
    contexto.save();
    contexto.fillStyle = "rgba(17, 16, 14, 0.76)";
    contexto.fillRect(0, 0, jogo.largura, jogo.altura);
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "#FFF4DF";
    contexto.font = `900 ${Math.max(26, Math.min(48, jogo.largura / 13))}px "Segoe UI", sans-serif`;
    contexto.fillText(titulo, jogo.largura / 2, jogo.altura / 2 - 15);
    contexto.fillStyle = "#E9C46A";
    contexto.font = `800 ${Math.max(10, Math.min(13, jogo.largura / 48))}px "Segoe UI", sans-serif`;
    contexto.fillText(subtitulo, jogo.largura / 2, jogo.altura / 2 + 30);
    contexto.restore();
}

function desenharJogo(tempoAtual = 0) {
    contexto.setTransform(jogo.escalaPixel, 0, 0, jogo.escalaPixel, 0, 0);
    contexto.clearRect(0, 0, jogo.largura, jogo.altura);
    desenharFundo();
    desenharObstaculos();
    desenharParticulas();
    desenharJogador(tempoAtual);
    desenharInterfaceCanvas();

    if (!jogo.rodando && jogo.vidas > 0) {
        desenharMensagemCanvas("BLOCO RUSH", "CLIQUE EM INICIAR PARA JOGAR");
    } else if (jogo.pausado) {
        desenharMensagemCanvas("PAUSADO", "CLIQUE EM CONTINUAR");
    } else if (!jogo.rodando && jogo.vidas <= 0) {
        desenharMensagemCanvas("FIM DE JOGO", `${Math.floor(jogo.pontos)} PONTOS`);
    }
}

function finalizarJogo() {
    jogo.rodando = false;
    jogo.pausado = false;
    pontuacaoFinalPendente = Math.floor(jogo.pontos);
    pontosFinais.textContent = pontuacaoFinalPendente.toLocaleString("pt-BR");
    formRanking.classList.remove("escondido");
    botaoPausar.disabled = true;
    botaoPausar.textContent = "Pausar";
    botaoIniciar.innerHTML = '<span aria-hidden="true">↻</span> Jogar novamente';
    atualizarStatusJogo("Encerrado", "encerrado");
    nomeJogador.focus({ preventScroll: true });
}

botaoIniciar.addEventListener("click", iniciarJogo);
botaoPausar.addEventListener("click", alternarPausa);

window.addEventListener("keydown", (evento) => {
    const tecla = evento.key.toLowerCase();
    const teclaDeJogo = ["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d"].includes(tecla);
    const escrevendo = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);

    if (teclaDeJogo && jogo.rodando && !escrevendo) {
        evento.preventDefault();
        jogo.teclas.add(tecla);
    }

    if (tecla === "p" && jogo.rodando && !escrevendo) {
        alternarPausa();
    }
});

window.addEventListener("keyup", (evento) => {
    jogo.teclas.delete(evento.key.toLowerCase());
});

window.addEventListener("blur", () => {
    jogo.teclas.clear();
    jogo.toque.clear();
    $$(".controles-mobile button").forEach((botao) => botao.classList.remove("pressionado"));
});

$$("[data-move]").forEach((botao) => {
    const direcao = botao.dataset.move;

    const iniciarMovimento = (evento) => {
        evento.preventDefault();
        jogo.toque.add(direcao);
        botao.classList.add("pressionado");
        if (botao.setPointerCapture) {
            botao.setPointerCapture(evento.pointerId);
        }
    };

    const encerrarMovimento = () => {
        jogo.toque.delete(direcao);
        botao.classList.remove("pressionado");
    };

    botao.addEventListener("pointerdown", iniciarMovimento);
    botao.addEventListener("pointerup", encerrarMovimento);
    botao.addEventListener("pointercancel", encerrarMovimento);
    botao.addEventListener("lostpointercapture", encerrarMovimento);
});

if ("ResizeObserver" in window) {
    const observadorCanvas = new ResizeObserver(ajustarCanvas);
    observadorCanvas.observe(canvas);
} else {
    window.addEventListener("resize", ajustarCanvas);
}

function obterRanking() {
    const rankingBruto = lerStorage(CHAVES_STORAGE.ranking, []);
    if (!Array.isArray(rankingBruto)) return [];

    return rankingBruto
        .map((item) => ({
            nome: String(item?.nome || "").trim().slice(0, 18),
            pontos: Math.max(0, Number.parseInt(item?.pontos, 10) || 0)
        }))
        .filter((item) => item.nome)
        .sort((a, b) => b.pontos - a.pontos)
        .slice(0, 7);
}

function carregarRanking() {
    const ranking = obterRanking();
    listaRanking.innerHTML = "";
    botaoLimparRanking.disabled = ranking.length === 0;

    if (!ranking.length) {
        const itemVazio = document.createElement("li");
        itemVazio.className = "estado-vazio";
        itemVazio.textContent = "Ainda não há resultados. Seja o primeiro!";
        listaRanking.appendChild(itemVazio);
        return;
    }

    ranking.forEach((item) => {
        const linha = document.createElement("li");
        const nome = document.createElement("span");
        const pontos = document.createElement("span");
        nome.className = "ranking-nome";
        pontos.className = "ranking-pontos";
        nome.textContent = item.nome;
        pontos.textContent = `${item.pontos.toLocaleString("pt-BR")} pts`;
        linha.append(nome, pontos);
        listaRanking.appendChild(linha);
    });
}

formRanking.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const nome = nomeJogador.value.replace(/\s+/g, " ").trim();

    if (nome.length < 2) {
        nomeJogador.classList.add("invalido");
        nomeJogador.setAttribute("aria-invalid", "true");
        erroRanking.textContent = "Digite um nome com pelo menos 2 caracteres.";
        nomeJogador.focus();
        return;
    }

    const nomeComparacao = nome.toLocaleLowerCase("pt-BR");
    const rankingSemJogador = obterRanking().filter(
        (item) => item.nome.toLocaleLowerCase("pt-BR") !== nomeComparacao
    );
    const melhorAnterior = obterRanking().find(
        (item) => item.nome.toLocaleLowerCase("pt-BR") === nomeComparacao
    );
    const melhorPontuacao = Math.max(pontuacaoFinalPendente, melhorAnterior?.pontos || 0);
    const novoRanking = [...rankingSemJogador, { nome, pontos: melhorPontuacao }]
        .sort((a, b) => b.pontos - a.pontos)
        .slice(0, 7);

    if (!salvarStorage(CHAVES_STORAGE.ranking, novoRanking)) {
        erroRanking.textContent = "Não foi possível salvar. Verifique as permissões do navegador.";
        return;
    }

    nomeJogador.value = "";
    nomeJogador.classList.remove("invalido");
    nomeJogador.removeAttribute("aria-invalid");
    erroRanking.textContent = "";
    formRanking.classList.add("escondido");
    carregarRanking();
});

nomeJogador.addEventListener("input", () => {
    nomeJogador.classList.remove("invalido");
    nomeJogador.removeAttribute("aria-invalid");
    erroRanking.textContent = "";
});

botaoLimparRanking.addEventListener("click", () => {
    const ranking = obterRanking();
    if (!ranking.length) return;

    if (window.confirm("Deseja apagar todo o ranking salvo neste navegador?")) {
        salvarStorage(CHAVES_STORAGE.ranking, []);
        carregarRanking();
    }
});

// Quiz da Vibe
const perguntasQuiz = [
    {
        texto: "Sexta-feira à noite: qual plano ganha seu voto?",
        opcoes: [
            ["Uma partida valendo revanche", "gamer"],
            ["Uma maratona com pipoca", "cinema"],
            ["Um rolê com a galera", "social"],
            ["Criar algo fora do comum", "criativo"]
        ]
    },
    {
        texto: "O que mais prende sua atenção em uma experiência?",
        opcoes: [
            ["Desafio e evolução", "gamer"],
            ["História e personagens", "cinema"],
            ["Pessoas e energia", "social"],
            ["Estética e originalidade", "criativo"]
        ]
    },
    {
        texto: "Escolha uma trilha sonora para o seu momento:",
        opcoes: [
            ["Eletrônica acelerada", "gamer"],
            ["Tema épico de cinema", "cinema"],
            ["Hit que todo mundo canta", "social"],
            ["Uma descoberta alternativa", "criativo"]
        ]
    },
    {
        texto: "Quando aparece um tempo livre inesperado, você...",
        opcoes: [
            ["Tenta bater um recorde", "gamer"],
            ["Procura algo bom para assistir", "cinema"],
            ["Chama alguém para conversar", "social"],
            ["Começa um projeto novo", "criativo"]
        ]
    },
    {
        texto: "Qual destas conquistas parece mais satisfatória?",
        opcoes: [
            ["Chegar ao topo do ranking", "gamer"],
            ["Encontrar uma obra inesquecível", "cinema"],
            ["Criar uma memória em grupo", "social"],
            ["Transformar uma ideia em realidade", "criativo"]
        ]
    },
    {
        texto: "Seu ambiente ideal tem...",
        opcoes: [
            ["Botões grandes, cores e movimento", "gamer"],
            ["Sofá confortável e tela grande", "cinema"],
            ["Música, conversa e movimento", "social"],
            ["Cores, referências e espaço livre", "criativo"]
        ]
    },
    {
        texto: "No fim de uma boa experiência, você quer sentir que...",
        opcoes: [
            ["Superou seus limites", "gamer"],
            ["Viveu outra história", "cinema"],
            ["Se conectou com alguém", "social"],
            ["Descobriu uma nova possibilidade", "criativo"]
        ]
    }
];

const perfisQuiz = {
    gamer: {
        titulo: "Player Imparável",
        descricao: "Você transforma diversão em missão. Gosta de aprender padrões, superar desafios e sentir aquela evolução nítida a cada tentativa.",
        dica: "Experimente uma sessão de Bloco Rush e desafie alguém a superar seu placar.",
        icone: "◆"
    },
    cinema: {
        titulo: "Explorador de Histórias",
        descricao: "Sua diversão favorita abre portais para outros mundos. Narrativas, atmosferas e personagens marcantes são o combustível da sua imaginação.",
        dica: "Monte uma sessão temática com um filme, uma série curta e a trilha sonora certa.",
        icone: "◉"
    },
    social: {
        titulo: "Conector de Vibes",
        descricao: "Para você, a melhor parte de qualquer programa é compartilhar. Sua energia cresce quando há conversa, risadas e boas memórias em grupo.",
        dica: "Convide a galera para comparar resultados do quiz e criar um campeonato rápido.",
        icone: "✦"
    },
    criativo: {
        titulo: "Criador de Universos",
        descricao: "Você busca o inesperado e enxerga diversão como espaço para inventar. Estética, ideias novas e liberdade para experimentar movem a sua vibe.",
        dica: "Crie uma playlist visual, um mini desenho ou uma rodada temática inspirada na sua diversão favorita.",
        icone: "✎"
    }
};

const contadorQuiz = $("#contadorQuiz");
const porcentagemQuiz = $("#porcentagemQuiz");
const barraQuiz = $("#barraQuiz");
const perguntaQuizEl = $("#perguntaQuiz");
const opcoesQuizEl = $("#opcoesQuiz");
const quizPerguntas = $("#quizPerguntas");
const resultadoQuiz = $("#resultadoQuiz");
const tituloResultado = $("#tituloResultado");
const textoResultado = $("#textoResultado");
const dicaResultado = $("#dicaResultado");
const iconeResultado = $("#iconeResultado");
const botaoRefazerQuiz = $("#refazerQuiz");

let perguntaAtual = 0;
let pontosQuiz = { gamer: 0, cinema: 0, social: 0, criativo: 0 };
let ordemRespostas = [];

function mostrarPerguntaQuiz() {
    const pergunta = perguntasQuiz[perguntaAtual];
    const progresso = Math.round(((perguntaAtual + 1) / perguntasQuiz.length) * 100);

    quizPerguntas.classList.remove("escondido");
    resultadoQuiz.classList.add("escondido");
    opcoesQuizEl.classList.remove("travado");
    contadorQuiz.textContent = `Pergunta ${perguntaAtual + 1} de ${perguntasQuiz.length}`;
    porcentagemQuiz.textContent = `${progresso}%`;
    barraQuiz.style.width = `${progresso}%`;
    perguntaQuizEl.textContent = pergunta.texto;
    opcoesQuizEl.innerHTML = "";

    pergunta.opcoes.forEach(([texto, perfil], indice) => {
        const botao = document.createElement("button");
        const letra = document.createElement("span");
        const textoBotao = document.createElement("span");
        botao.type = "button";
        botao.className = "opcao-quiz";
        letra.className = "opcao-letra";
        textoBotao.className = "opcao-texto";
        letra.textContent = String.fromCharCode(65 + indice);
        textoBotao.textContent = texto;
        botao.append(letra, textoBotao);
        botao.addEventListener("click", () => responderQuiz(perfil, botao));
        opcoesQuizEl.appendChild(botao);
    });
}

function responderQuiz(perfil, botaoSelecionado) {
    if (opcoesQuizEl.classList.contains("travado")) return;

    opcoesQuizEl.classList.add("travado");
    botaoSelecionado?.classList.add("selecionada");

    window.setTimeout(() => {
        pontosQuiz[perfil] += 1;
        ordemRespostas.push(perfil);
        perguntaAtual += 1;

        if (perguntaAtual < perguntasQuiz.length) {
            mostrarPerguntaQuiz();
            return;
        }

        opcoesQuizEl.classList.remove("travado");
        mostrarResultadoQuiz();
    }, 180);
}

function descobrirPerfilVencedor() {
    return Object.keys(pontosQuiz).sort((perfilA, perfilB) => {
        const diferenca = pontosQuiz[perfilB] - pontosQuiz[perfilA];
        if (diferenca !== 0) return diferenca;
        return ordemRespostas.lastIndexOf(perfilB) - ordemRespostas.lastIndexOf(perfilA);
    })[0];
}

function mostrarResultadoQuiz() {
    const perfil = perfisQuiz[descobrirPerfilVencedor()];
    quizPerguntas.classList.add("escondido");
    resultadoQuiz.classList.remove("escondido");
    tituloResultado.textContent = perfil.titulo;
    textoResultado.textContent = perfil.descricao;
    dicaResultado.textContent = perfil.dica;
    iconeResultado.textContent = perfil.icone;
}

botaoRefazerQuiz.addEventListener("click", () => {
    perguntaAtual = 0;
    pontosQuiz = { gamer: 0, cinema: 0, social: 0, criativo: 0 };
    ordemRespostas = [];
    mostrarPerguntaQuiz();
});

// Mural de recados
const formMural = $("#formMural");
const nomeRecado = $("#nomeRecado");
const mensagemRecado = $("#mensagemRecado");
const contadorMensagem = $("#contadorMensagem");
const erroMural = $("#erroMural");
const listaRecados = $("#listaRecados");
const botaoLimparRecados = $("#limparRecados");
const LIMITE_MENSAGEM = 160;

function normalizarRecados() {
    const recadosBrutos = lerStorage(CHAVES_STORAGE.recados, []);
    if (!Array.isArray(recadosBrutos)) return [];

    return recadosBrutos
        .map((recado, indice) => ({
            id: String(recado?.id || `legado-${indice}`),
            nome: String(recado?.nome || "").replace(/\s+/g, " ").trim().slice(0, 25),
            mensagem: String(recado?.mensagem || "").trim().slice(0, LIMITE_MENSAGEM),
            data: recado?.data && !Number.isNaN(new Date(recado.data).getTime()) ? recado.data : null
        }))
        .filter((recado) => recado.nome && recado.mensagem)
        .slice(-12);
}

function formatarDataRecado(data) {
    if (!data) return "Salvo localmente";

    const dataRecado = new Date(data);
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    }).format(dataRecado);
}

function iniciaisDoNome(nome) {
    return nome
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join("")
        .toLocaleUpperCase("pt-BR");
}

function criarCardRecado(recado) {
    const card = document.createElement("article");
    const cabecalho = document.createElement("div");
    const avatar = document.createElement("span");
    const dados = document.createElement("div");
    const autor = document.createElement("h4");
    const data = document.createElement("time");
    const mensagem = document.createElement("p");

    card.className = "recado";
    cabecalho.className = "recado-cabecalho";
    avatar.className = "recado-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = iniciaisDoNome(recado.nome);
    autor.textContent = recado.nome;
    data.textContent = formatarDataRecado(recado.data);
    if (recado.data) {
        data.dateTime = recado.data;
    }
    mensagem.textContent = recado.mensagem;

    dados.append(autor, data);
    cabecalho.append(avatar, dados);
    card.append(cabecalho, mensagem);
    return card;
}

function carregarRecados() {
    const recados = normalizarRecados();
    listaRecados.innerHTML = "";
    botaoLimparRecados.disabled = recados.length === 0;

    if (!recados.length) {
        const vazio = document.createElement("div");
        const icone = document.createElement("span");
        const texto = document.createElement("p");
        vazio.className = "sem-recados";
        icone.setAttribute("aria-hidden", "true");
        icone.textContent = "✦";
        texto.textContent = "O mural está esperando o primeiro recado.";
        vazio.append(icone, texto);
        listaRecados.appendChild(vazio);
        return;
    }

    recados
        .slice()
        .reverse()
        .forEach((recado) => listaRecados.appendChild(criarCardRecado(recado)));
}

function atualizarContadorMensagem() {
    const tamanho = mensagemRecado.value.length;
    contadorMensagem.textContent = `${tamanho} / ${LIMITE_MENSAGEM}`;
    contadorMensagem.classList.toggle("limite-proximo", tamanho >= LIMITE_MENSAGEM * 0.85);
}

function limparEstadoCampo(campo) {
    campo.classList.remove("invalido");
    campo.removeAttribute("aria-invalid");
    erroMural.textContent = "";
    erroMural.classList.remove("sucesso");
}

nomeRecado.addEventListener("input", () => limparEstadoCampo(nomeRecado));
mensagemRecado.addEventListener("input", () => {
    limparEstadoCampo(mensagemRecado);
    atualizarContadorMensagem();
});

formMural.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const nome = nomeRecado.value.replace(/\s+/g, " ").trim();
    const mensagem = mensagemRecado.value.trim();

    limparEstadoCampo(nomeRecado);
    limparEstadoCampo(mensagemRecado);

    if (nome.length < 2) {
        nomeRecado.classList.add("invalido");
        nomeRecado.setAttribute("aria-invalid", "true");
        erroMural.textContent = "Informe um nome com pelo menos 2 caracteres.";
        nomeRecado.focus();
        return;
    }

    if (mensagem.length < 3) {
        mensagemRecado.classList.add("invalido");
        mensagemRecado.setAttribute("aria-invalid", "true");
        erroMural.textContent = "Escreva uma mensagem com pelo menos 3 caracteres.";
        mensagemRecado.focus();
        return;
    }

    const recados = normalizarRecados();
    recados.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        nome,
        mensagem,
        data: new Date().toISOString()
    });

    if (!salvarStorage(CHAVES_STORAGE.recados, recados.slice(-12))) {
        erroMural.textContent = "Não foi possível salvar. Verifique as permissões do navegador.";
        return;
    }

    formMural.reset();
    atualizarContadorMensagem();
    erroMural.textContent = "Recado publicado com sucesso!";
    erroMural.classList.add("sucesso");
    carregarRecados();
});

botaoLimparRecados.addEventListener("click", () => {
    const recados = normalizarRecados();
    if (!recados.length) return;

    if (window.confirm("Deseja apagar todos os seus recados salvos neste navegador?")) {
        salvarStorage(CHAVES_STORAGE.recados, []);
        erroMural.textContent = "";
        erroMural.classList.remove("sucesso");
        carregarRecados();
    }
});

// Inicialização
$("#anoAtual").textContent = new Date().getFullYear();
atualizarPlacar();
atualizarStatusJogo("Pronto");
ajustarCanvas();
canvasProntoParaTema = true;
carregarRanking();
mostrarPerguntaQuiz();
atualizarContadorMensagem();
carregarRecados();
