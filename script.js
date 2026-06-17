document.addEventListener("DOMContentLoaded", () => {
    setupMenu();
    setupGame();
    setupQuiz();
    setupMural();
});

function setupMenu() {
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("is-open");
        menuToggle.classList.toggle("is-open", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("is-open");
            menuToggle.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Abrir menu");
        });
    });
}

function setupGame() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const scoreValue = document.getElementById("scoreValue");
    const livesValue = document.getElementById("livesValue");
    const levelValue = document.getElementById("levelValue");
    const startGameBtn = document.getElementById("startGameBtn");
    const pauseGameBtn = document.getElementById("pauseGameBtn");
    const overlay = document.getElementById("gameOverlay");
    const overlayTitle = document.getElementById("overlayTitle");
    const overlayText = document.getElementById("overlayText");
    const overlayStartBtn = document.getElementById("overlayStartBtn");
    const scoreForm = document.getElementById("scoreForm");
    const playerName = document.getElementById("playerName");
    const rankingList = document.getElementById("rankingList");
    const rankingNote = document.getElementById("rankingNote");

    const state = {
        running: false,
        paused: false,
        over: false,
        score: 0,
        lives: 3,
        level: 1,
        lastTime: 0,
        spawnTimer: 0,
        width: 900,
        height: 520,
        keys: {},
        touch: {},
        obstacles: [],
        particles: [],
        invincible: 0,
        savedScore: false,
        player: {
            x: 420,
            y: 430,
            size: 34,
            speed: 0.44
        }
    };

    let animationId = null;
    let pointerActive = false;

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        state.width = rect.width;
        state.height = rect.height;
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        state.player.x = clamp(state.player.x, state.player.size, state.width - state.player.size);
        state.player.y = clamp(state.player.y, state.player.size, state.height - state.player.size);
        drawScene();
    }

    function resetGame() {
        state.running = true;
        state.paused = false;
        state.over = false;
        state.score = 0;
        state.lives = 3;
        state.level = 1;
        state.lastTime = 0;
        state.spawnTimer = 0;
        state.obstacles = [];
        state.particles = [];
        state.invincible = 0;
        state.savedScore = false;
        state.player.x = state.width / 2;
        state.player.y = state.height - 70;
        updateStats();
        hideOverlay();
        pauseGameBtn.textContent = "Pausar";
    }

    function startGame() {
        cancelAnimationFrame(animationId);
        resetGame();
        animationId = requestAnimationFrame(gameLoop);
    }

    function gameLoop(timestamp) {
        if (!state.running) {
            return;
        }

        if (!state.lastTime) {
            state.lastTime = timestamp;
        }

        const delta = Math.min(timestamp - state.lastTime, 34);
        state.lastTime = timestamp;

        if (!state.paused) {
            updateGame(delta);
            drawScene();
        }

        animationId = requestAnimationFrame(gameLoop);
    }

    function updateGame(delta) {
        state.score += delta * (0.022 + state.level * 0.002);
        state.level = Math.max(1, Math.floor(state.score / 260) + 1);
        state.spawnTimer += delta;

        const spawnInterval = Math.max(330, 920 - state.level * 54);
        if (state.spawnTimer >= spawnInterval) {
            state.spawnTimer = 0;
            spawnObstacle();
        }

        movePlayer(delta);
        updateObstacles(delta);
        updateParticles(delta);

        if (state.invincible > 0) {
            state.invincible -= delta;
        }

        updateStats();
    }

    function movePlayer(delta) {
        const left = state.keys.ArrowLeft || state.keys.KeyA || state.touch.left;
        const right = state.keys.ArrowRight || state.keys.KeyD || state.touch.right;
        const up = state.keys.ArrowUp || state.keys.KeyW || state.touch.up;
        const down = state.keys.ArrowDown || state.keys.KeyS || state.touch.down;
        const distance = state.player.speed * delta;

        if (left) state.player.x -= distance;
        if (right) state.player.x += distance;
        if (up) state.player.y -= distance;
        if (down) state.player.y += distance;

        state.player.x = clamp(state.player.x, state.player.size, state.width - state.player.size);
        state.player.y = clamp(state.player.y, state.player.size, state.height - state.player.size);
    }

    function spawnObstacle() {
        const width = randomBetween(34, 92);
        const height = randomBetween(24, 68);
        const colors = ["#ff3fd4", "#28f7ff", "#b8ff4b", "#ffe66d", "#8f5bff"];
        state.obstacles.push({
            x: randomBetween(10, Math.max(20, state.width - width - 10)),
            y: -height - 8,
            width,
            height,
            speed: randomBetween(0.15, 0.23) + state.level * 0.025,
            drift: randomBetween(-0.075, 0.075),
            color: colors[Math.floor(Math.random() * colors.length)],
            spin: randomBetween(0, Math.PI)
        });
    }

    function updateObstacles(delta) {
        for (let i = state.obstacles.length - 1; i >= 0; i -= 1) {
            const obstacle = state.obstacles[i];
            obstacle.y += obstacle.speed * delta;
            obstacle.x += Math.sin(obstacle.y * 0.025 + obstacle.spin) * obstacle.drift * delta;

            if (obstacle.x < 4 || obstacle.x + obstacle.width > state.width - 4) {
                obstacle.drift *= -1;
            }

            if (obstacle.y > state.height + 80) {
                state.obstacles.splice(i, 1);
                continue;
            }

            if (state.invincible <= 0 && collidesWithPlayer(obstacle)) {
                state.obstacles.splice(i, 1);
                state.lives -= 1;
                state.invincible = 1150;
                burstParticles(state.player.x, state.player.y, obstacle.color);

                if (state.lives <= 0) {
                    finishGame();
                    return;
                }
            }
        }
    }

    function updateParticles(delta) {
        for (let i = state.particles.length - 1; i >= 0; i -= 1) {
            const particle = state.particles[i];
            particle.life -= delta;
            particle.x += particle.vx * delta;
            particle.y += particle.vy * delta;

            if (particle.life <= 0) {
                state.particles.splice(i, 1);
            }
        }
    }

    function burstParticles(x, y, color) {
        for (let i = 0; i < 14; i += 1) {
            state.particles.push({
                x,
                y,
                vx: randomBetween(-0.22, 0.22),
                vy: randomBetween(-0.24, 0.18),
                size: randomBetween(2, 5),
                color,
                life: randomBetween(260, 560)
            });
        }
    }

    function collidesWithPlayer(obstacle) {
        const playerBox = {
            x: state.player.x - state.player.size * 0.55,
            y: state.player.y - state.player.size * 0.55,
            width: state.player.size * 1.1,
            height: state.player.size * 1.1
        };

        return (
            playerBox.x < obstacle.x + obstacle.width &&
            playerBox.x + playerBox.width > obstacle.x &&
            playerBox.y < obstacle.y + obstacle.height &&
            playerBox.y + playerBox.height > obstacle.y
        );
    }

    function drawScene() {
        ctx.clearRect(0, 0, state.width, state.height);
        drawBackground();
        drawObstacles();
        drawParticles();
        drawPlayer();
    }

    function drawBackground() {
        const gradient = ctx.createLinearGradient(0, 0, state.width, state.height);
        gradient.addColorStop(0, "#070917");
        gradient.addColorStop(0.5, "#11142a");
        gradient.addColorStop(1, "#070917");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, state.width, state.height);

        ctx.save();
        ctx.strokeStyle = "rgba(40, 247, 255, 0.08)";
        ctx.lineWidth = 1;
        const grid = 36;
        for (let x = 0; x < state.width; x += grid) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, state.height);
            ctx.stroke();
        }
        for (let y = 0; y < state.height; y += grid) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(state.width, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawPlayer() {
        const blink = state.invincible > 0 && Math.floor(state.invincible / 110) % 2 === 0;
        if (blink) return;

        const { x, y, size } = state.player;
        ctx.save();
        ctx.shadowColor = "#28f7ff";
        ctx.shadowBlur = 24;
        ctx.fillStyle = "#28f7ff";
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * 0.72, y + size * 0.76);
        ctx.lineTo(x, y + size * 0.35);
        ctx.lineTo(x - size * 0.72, y + size * 0.76);
        ctx.closePath();
        ctx.fill();

        ctx.shadowColor = "#ff3fd4";
        ctx.fillStyle = "#ff3fd4";
        ctx.fillRect(x - size * 0.18, y + size * 0.42, size * 0.36, size * 0.46);
        ctx.restore();
    }

    function drawObstacles() {
        state.obstacles.forEach((obstacle) => {
            ctx.save();
            ctx.shadowColor = obstacle.color;
            ctx.shadowBlur = 18;
            ctx.fillStyle = obstacle.color;
            ctx.globalAlpha = 0.92;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
            ctx.strokeRect(obstacle.x + 3, obstacle.y + 3, obstacle.width - 6, obstacle.height - 6);
            ctx.restore();
        });
    }

    function drawParticles() {
        state.particles.forEach((particle) => {
            ctx.save();
            ctx.globalAlpha = clamp(particle.life / 560, 0, 1);
            ctx.fillStyle = particle.color;
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = 12;
            ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            ctx.restore();
        });
    }

    function updateStats() {
        scoreValue.textContent = String(Math.floor(state.score));
        livesValue.textContent = String(state.lives);
        levelValue.textContent = String(state.level);
    }

    function finishGame() {
        state.running = false;
        state.over = true;
        cancelAnimationFrame(animationId);
        updateStats();
        showOverlay(
            "Fim de jogo",
            `Sua pontuacao foi ${Math.floor(state.score)}. Salve seu nome para entrar no ranking.`,
            "Jogar novamente",
            true
        );
    }

    function togglePause() {
        if (!state.running) return;
        state.paused = !state.paused;
        pauseGameBtn.textContent = state.paused ? "Continuar" : "Pausar";

        if (state.paused) {
            showOverlay("Jogo pausado", "Respire, ajuste a mira e volte quando quiser.", "Continuar", false);
        } else {
            hideOverlay();
            state.lastTime = 0;
        }
    }

    function showOverlay(title, text, buttonText, showScoreForm) {
        overlayTitle.textContent = title;
        overlayText.textContent = text;
        overlayStartBtn.textContent = buttonText;
        scoreForm.classList.toggle("hidden", !showScoreForm);
        overlay.classList.remove("hidden");

        if (showScoreForm) {
            playerName.focus();
        }
    }

    function hideOverlay() {
        overlay.classList.add("hidden");
        scoreForm.classList.add("hidden");
    }

    async function loadRanking() {
        rankingList.innerHTML = '<li class="empty-state">Carregando ranking...</li>';
        try {
            const response = await fetch("ranking.php", { cache: "no-store" });
            const data = await response.json();

            if (!response.ok || !data.sucesso) {
                throw new Error(data.mensagem || "Nao foi possivel carregar o ranking.");
            }

            renderRanking(data.ranking || []);
            rankingNote.textContent = "Ranking atualizado com os melhores jogadores salvos em JSON.";
        } catch (error) {
            rankingList.innerHTML = '<li class="empty-state">Ranking indisponivel. Rode o projeto com PHP para ativar.</li>';
            rankingNote.textContent = "Use: php -S localhost:8000";
        }
    }

    function renderRanking(items) {
        if (!items.length) {
            rankingList.innerHTML = '<li class="empty-state">Ainda nao ha pontuacoes. Seja o primeiro nome neon.</li>';
            return;
        }

        rankingList.innerHTML = items
            .slice(0, 10)
            .map((item, index) => `
                <li>
                    <span class="rank-position">${index + 1}</span>
                    <span class="rank-name">${item.nome || "Player"}</span>
                    <span class="rank-score">${Number(item.pontos || 0)}</span>
                </li>
            `)
            .join("");
    }

    async function saveScore(event) {
        event.preventDefault();
        const name = playerName.value.trim();

        if (state.savedScore) {
            overlayText.textContent = "Essa pontuacao ja foi salva. Jogue de novo para tentar melhorar.";
            return;
        }

        if (!name) {
            overlayText.textContent = "Digite um nome para salvar sua pontuacao.";
            playerName.focus();
            return;
        }

        try {
            const response = await fetch("salvar_ranking.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: name,
                    pontos: Math.floor(state.score)
                })
            });
            const data = await response.json();

            if (!response.ok || !data.sucesso) {
                throw new Error(data.mensagem || "Nao foi possivel salvar.");
            }

            state.savedScore = true;
            scoreForm.classList.add("hidden");
            overlayText.textContent = "Pontuacao salva. Agora tente superar sua propria vibe.";
            await loadRanking();
        } catch (error) {
            overlayText.textContent = "Nao foi possivel salvar agora. Confira se o servidor PHP esta rodando.";
        }
    }

    function setTouchControl(control, active) {
        state.touch[control] = active;
    }

    function movePlayerToPointer(event) {
        if (!state.running || state.paused) return;
        const rect = canvas.getBoundingClientRect();
        state.player.x = clamp(event.clientX - rect.left, state.player.size, state.width - state.player.size);
        state.player.y = clamp(event.clientY - rect.top, state.player.size, state.height - state.player.size);
    }

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("keydown", (event) => {
        const playableKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS", "Space"];
        if (!playableKeys.includes(event.code)) return;

        const tag = document.activeElement.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea") return;

        event.preventDefault();
        if (event.code === "Space") {
            togglePause();
            return;
        }
        state.keys[event.code] = true;
    });
    window.addEventListener("keyup", (event) => {
        state.keys[event.code] = false;
    });
    window.addEventListener("blur", () => {
        state.keys = {};
        state.touch = {};
    });

    document.querySelectorAll("[data-control]").forEach((button) => {
        const control = button.dataset.control;
        button.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            button.setPointerCapture(event.pointerId);
            setTouchControl(control, true);
        });
        button.addEventListener("pointerup", () => setTouchControl(control, false));
        button.addEventListener("pointercancel", () => setTouchControl(control, false));
        button.addEventListener("pointerleave", () => setTouchControl(control, false));
    });

    canvas.addEventListener("pointerdown", (event) => {
        pointerActive = true;
        canvas.setPointerCapture(event.pointerId);
        movePlayerToPointer(event);
    });
    canvas.addEventListener("pointermove", (event) => {
        if (pointerActive) movePlayerToPointer(event);
    });
    canvas.addEventListener("pointerup", () => {
        pointerActive = false;
    });
    canvas.addEventListener("pointercancel", () => {
        pointerActive = false;
    });

    startGameBtn.addEventListener("click", startGame);
    pauseGameBtn.addEventListener("click", togglePause);
    overlayStartBtn.addEventListener("click", () => {
        if (state.running && state.paused) {
            togglePause();
        } else {
            startGame();
        }
    });
    scoreForm.addEventListener("submit", saveScore);

    resizeCanvas();
    loadRanking();
}

function setupQuiz() {
    const questionCount = document.getElementById("questionCount");
    const questionText = document.getElementById("questionText");
    const answerGrid = document.getElementById("answerGrid");
    const quizCard = document.getElementById("quizCard");
    const quizResult = document.getElementById("quizResult");
    const quizProgressBar = document.getElementById("quizProgressBar");
    const resultTitle = document.getElementById("resultTitle");
    const resultText = document.getElementById("resultText");
    const restartQuizBtn = document.getElementById("restartQuizBtn");

    const questions = [
        {
            text: "Quando voce tem uma noite livre, qual plano chama mais?",
            answers: [
                { text: "Entrar numa partida ranqueada e buscar vitoria.", vibe: "gamer" },
                { text: "Maratonar um filme ou serie com pipoca.", vibe: "cinefilo" },
                { text: "Chamar a galera para sair ou conversar.", vibe: "festeiro" },
                { text: "Criar playlist, desenho, texto ou ideia nova.", vibe: "criativo" }
            ]
        },
        {
            text: "Qual energia combina com seu grupo ideal?",
            answers: [
                { text: "Competitiva, estrategica e cheia de desafio.", vibe: "gamer" },
                { text: "Tranquila, com historias para comentar depois.", vibe: "cinefilo" },
                { text: "Alta, espontanea e sempre com gente por perto.", vibe: "festeiro" },
                { text: "Diferente, curiosa e fora do obvio.", vibe: "criativo" }
            ]
        },
        {
            text: "Que tipo de recompensa te deixa mais feliz?",
            answers: [
                { text: "Subir de nivel e aparecer no topo.", vibe: "gamer" },
                { text: "Descobrir uma obra que vira favorita.", vibe: "cinefilo" },
                { text: "Guardar uma memoria divertida com amigos.", vibe: "festeiro" },
                { text: "Terminar algo com a sua cara.", vibe: "criativo" }
            ]
        },
        {
            text: "Escolha um ambiente para passar horas sem ver o tempo.",
            answers: [
                { text: "Setup com controle, headset e tela brilhando.", vibe: "gamer" },
                { text: "Sofa confortavel e clima de cinema.", vibe: "cinefilo" },
                { text: "Lugar com musica, conversa e movimento.", vibe: "festeiro" },
                { text: "Mesa cheia de ideias, cores e referencias.", vibe: "criativo" }
            ]
        },
        {
            text: "Se sua vibe fosse uma frase, qual seria?",
            answers: [
                { text: "So paro depois da revanche.", vibe: "gamer" },
                { text: "Tenho uma recomendacao perfeita para isso.", vibe: "cinefilo" },
                { text: "Bora juntar todo mundo.", vibe: "festeiro" },
                { text: "E se a gente fizesse diferente?", vibe: "criativo" }
            ]
        }
    ];

    const results = {
        gamer: {
            title: "Gamer competitivo",
            text: "Voce curte desafio, evolucao e aquele gostinho de superar o proprio recorde. Seu entretenimento ideal tem acao, ranking e adrenalina."
        },
        cinefilo: {
            title: "Cinefilo de plantao",
            text: "Sua vibe e mergulhar em historias, personagens e universos. Para voce, uma boa noite pode ser uma tela, uma trama forte e comentarios depois."
        },
        festeiro: {
            title: "Festeiro social",
            text: "Voce transforma qualquer rolê em lembranca. O que importa e compartilhar energia, rir junto e manter a galera conectada."
        },
        criativo: {
            title: "Criativo alternativo",
            text: "Voce gosta do diferente, do autoral e do inesperado. Sua diversao aparece quando existe liberdade para inventar, misturar e experimentar."
        }
    };

    const quizState = {
        index: 0,
        scores: {}
    };

    function resetQuiz() {
        quizState.index = 0;
        quizState.scores = { gamer: 0, cinefilo: 0, festeiro: 0, criativo: 0 };
        quizResult.classList.add("hidden");
        quizCard.classList.remove("hidden");
        renderQuestion();
    }

    function renderQuestion() {
        const question = questions[quizState.index];
        const progress = (quizState.index / questions.length) * 100;
        quizProgressBar.style.width = `${progress}%`;
        questionCount.textContent = `Pergunta ${quizState.index + 1} de ${questions.length}`;
        questionText.textContent = question.text;
        answerGrid.innerHTML = "";

        question.answers.forEach((answer) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "answer-btn";
            button.textContent = answer.text;
            button.addEventListener("click", () => chooseAnswer(answer.vibe));
            answerGrid.appendChild(button);
        });

        quizCard.classList.remove("is-changing");
        void quizCard.offsetWidth;
        quizCard.classList.add("is-changing");
    }

    function chooseAnswer(vibe) {
        quizState.scores[vibe] += 1;
        quizState.index += 1;

        if (quizState.index >= questions.length) {
            showResult();
            return;
        }

        renderQuestion();
    }

    function showResult() {
        quizProgressBar.style.width = "100%";
        const winner = Object.entries(quizState.scores).sort((a, b) => b[1] - a[1])[0][0];
        resultTitle.textContent = results[winner].title;
        resultText.textContent = results[winner].text;
        quizCard.classList.add("hidden");
        quizResult.classList.remove("hidden");
    }

    restartQuizBtn.addEventListener("click", resetQuiz);
    resetQuiz();
}

function setupMural() {
    const form = document.getElementById("messageForm");
    const nameInput = document.getElementById("visitorName");
    const messageInput = document.getElementById("visitorMessage");
    const charCounter = document.getElementById("charCounter");
    const feedback = document.getElementById("messageFeedback");
    const messageGrid = document.getElementById("messageGrid");

    function updateCounter() {
        charCounter.textContent = `${messageInput.value.length}/140`;
    }

    function setFeedback(message, isError = false) {
        feedback.textContent = message;
        feedback.classList.toggle("error", isError);
    }

    async function loadMessages() {
        messageGrid.innerHTML = '<article class="message-card empty-state">Carregando recados...</article>';
        try {
            const response = await fetch("carregar_recados.php", { cache: "no-store" });
            const data = await response.json();

            if (!response.ok || !data.sucesso) {
                throw new Error(data.mensagem || "Nao foi possivel carregar os recados.");
            }

            renderMessages(data.recados || []);
        } catch (error) {
            messageGrid.innerHTML = '<article class="message-card empty-state">Mural indisponivel. Rode com PHP para carregar os recados.</article>';
        }
    }

    function renderMessages(messages) {
        if (!messages.length) {
            messageGrid.innerHTML = '<article class="message-card empty-state">Ainda nao tem recado. Abra o mural com a primeira mensagem.</article>';
            return;
        }

        messageGrid.innerHTML = messages
            .slice()
            .reverse()
            .map((message) => `
                <article class="message-card">
                    <h4>${message.nome || "Visitante"}</h4>
                    <time>${message.data || ""}</time>
                    <p>${message.mensagem || ""}</p>
                </article>
            `)
            .join("");
    }

    async function submitMessage(event) {
        event.preventDefault();
        const nome = nameInput.value.trim();
        const mensagem = messageInput.value.trim();

        if (!nome || !mensagem) {
            setFeedback("Preencha nome e mensagem antes de enviar.", true);
            return;
        }

        if (mensagem.length > 140) {
            setFeedback("A mensagem precisa ter no maximo 140 caracteres.", true);
            return;
        }

        try {
            const response = await fetch("salvar_recado.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, mensagem })
            });
            const data = await response.json();

            if (!response.ok || !data.sucesso) {
                throw new Error(data.mensagem || "Nao foi possivel salvar o recado.");
            }

            form.reset();
            updateCounter();
            setFeedback("Recado enviado com sucesso.");
            await loadMessages();
        } catch (error) {
            setFeedback("Nao foi possivel enviar agora. Confira se o servidor PHP esta rodando.", true);
        }
    }

    messageInput.addEventListener("input", updateCounter);
    form.addEventListener("submit", submitMessage);
    updateCounter();
    loadMessages();
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}
