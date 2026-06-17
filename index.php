<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="VibePlay: entretenimento neon com jogo arcade, quiz interativo e mural da galera.">
    <title>VibePlay | Entretenimento Neon</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="ambient ambient-one" aria-hidden="true"></div>
    <div class="ambient ambient-two" aria-hidden="true"></div>

    <header class="site-header" id="topo">
        <nav class="navbar" aria-label="Menu principal">
            <a class="brand" href="#inicio" aria-label="Ir para o inicio da VibePlay">
                <span class="brand-mark">VP</span>
                <span>VibePlay</span>
            </a>

            <button class="menu-toggle" id="menuToggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="navLinks">
                <span></span>
                <span></span>
                <span></span>
            </button>

            <ul class="nav-links" id="navLinks">
                <li><a href="#inicio">Inicio</a></li>
                <li><a href="#arcade">Arcade</a></li>
                <li><a href="#quiz">Quiz</a></li>
                <li><a href="#mural">Mural</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section class="hero section-space" id="inicio" aria-labelledby="inicioTitulo">
            <div class="hero-content">
                <p class="section-kicker">Entretenimento em modo neon</p>
                <h1 id="inicioTitulo">VibePlay</h1>
                <p class="hero-slogan">Jogue, descubra sua vibe e deixe sua marca no mural mais brilhante da turma.</p>
                <div class="hero-actions">
                    <a class="btn btn-primary" href="#arcade">Jogar Neon Dodge</a>
                    <a class="btn btn-ghost" href="#quiz">Fazer quiz</a>
                </div>
                <div class="hero-highlights" aria-label="Destaques da plataforma">
                    <span>Arcade real</span>
                    <span>Quiz interativo</span>
                    <span>Ranking local</span>
                </div>
            </div>

            <aside class="hero-visual" aria-label="Painel visual futurista da VibePlay">
                <div class="visual-grid">
                    <div class="visual-card visual-score">
                        <span class="mini-label">Score vibe</span>
                        <strong>9.8</strong>
                        <small>energia maxima</small>
                    </div>
                    <div class="visual-card visual-player">
                        <span class="ship-preview"></span>
                        <span class="track-line"></span>
                        <span class="track-line short"></span>
                    </div>
                    <div class="visual-card visual-pulse">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </aside>

            <div class="attraction-grid" aria-label="Atracoes do site">
                <article class="attraction-card">
                    <span class="card-number">01</span>
                    <h2>Neon Dodge</h2>
                    <p>Um arcade rapido onde sua nave precisa escapar dos blocos que caem cada vez mais rapido.</p>
                </article>
                <article class="attraction-card">
                    <span class="card-number">02</span>
                    <h2>Quiz da Vibe</h2>
                    <p>Responda perguntas leves e descubra se voce combina mais com games, filmes, festa ou criacao.</p>
                </article>
                <article class="attraction-card">
                    <span class="card-number">03</span>
                    <h2>Mural da Galera</h2>
                    <p>Deixe um recado curto, veja mensagens recentes e mantenha a pagina viva com novas interacoes.</p>
                </article>
            </div>
        </section>

        <section class="section-space arcade-section" id="arcade" aria-labelledby="arcadeTitulo">
            <div class="section-heading">
                <p class="section-kicker">Jogo Arcade</p>
                <h2 id="arcadeTitulo">Neon Dodge</h2>
                <p>Controle a nave, desvie dos obstaculos, segure suas vidas e tente entrar no ranking.</p>
            </div>

            <div class="arcade-layout">
                <div class="game-shell">
                    <div class="game-topbar" aria-label="Informacoes do jogo">
                        <div class="status-pill">
                            <span>Pontos</span>
                            <strong id="scoreValue">0</strong>
                        </div>
                        <div class="status-pill">
                            <span>Vidas</span>
                            <strong id="livesValue">3</strong>
                        </div>
                        <div class="status-pill">
                            <span>Nivel</span>
                            <strong id="levelValue">1</strong>
                        </div>
                    </div>

                    <div class="canvas-wrap">
                        <canvas id="gameCanvas" width="900" height="520" aria-label="Area do jogo Neon Dodge"></canvas>
                        <div class="game-overlay" id="gameOverlay">
                            <div class="overlay-panel">
                                <p class="section-kicker">Pronto para desviar?</p>
                                <h3 id="overlayTitle">Neon Dodge</h3>
                                <p id="overlayText">Use as setas ou WASD no computador. No celular, use os botoes neon abaixo.</p>
                                <form class="score-form hidden" id="scoreForm">
                                    <label for="playerName">Seu nome no ranking</label>
                                    <input id="playerName" name="playerName" type="text" maxlength="20" placeholder="Ex: Player Neon">
                                    <button class="btn btn-primary" type="submit">Salvar pontuacao</button>
                                </form>
                                <button class="btn btn-primary" id="overlayStartBtn" type="button">Iniciar jogo</button>
                            </div>
                        </div>
                    </div>

                    <div class="game-controls">
                        <button class="btn btn-primary" id="startGameBtn" type="button">Iniciar</button>
                        <button class="btn btn-ghost" id="pauseGameBtn" type="button">Pausar</button>
                    </div>

                    <div class="mobile-controls" aria-label="Controles para celular">
                        <button type="button" class="control-btn" data-control="left" aria-label="Mover para esquerda">‹</button>
                        <div class="control-stack">
                            <button type="button" class="control-btn" data-control="up" aria-label="Mover para cima">⌃</button>
                            <button type="button" class="control-btn" data-control="down" aria-label="Mover para baixo">⌄</button>
                        </div>
                        <button type="button" class="control-btn" data-control="right" aria-label="Mover para direita">›</button>
                    </div>
                </div>

                <aside class="ranking-panel" aria-labelledby="rankingTitulo">
                    <div class="panel-heading">
                        <p class="section-kicker">Top jogadores</p>
                        <h3 id="rankingTitulo">Ranking</h3>
                    </div>
                    <ol class="ranking-list" id="rankingList">
                        <li class="empty-state">Carregando ranking...</li>
                    </ol>
                    <p class="ranking-note" id="rankingNote">As pontuacoes sao salvas localmente em JSON pelo PHP.</p>
                </aside>
            </div>
        </section>

        <section class="section-space quiz-section" id="quiz" aria-labelledby="quizTitulo">
            <div class="section-heading">
                <p class="section-kicker">Quiz Interativo</p>
                <h2 id="quizTitulo">Qual e sua vibe de entretenimento?</h2>
                <p>Escolha as alternativas que mais combinam com voce e descubra seu perfil.</p>
            </div>

            <div class="quiz-box" id="quizBox">
                <div class="quiz-progress" aria-hidden="true">
                    <span id="quizProgressBar"></span>
                </div>
                <article class="quiz-card" id="quizCard">
                    <p class="question-count" id="questionCount">Pergunta 1 de 5</p>
                    <h3 id="questionText">Carregando pergunta...</h3>
                    <div class="answer-grid" id="answerGrid"></div>
                </article>
                <article class="quiz-result hidden" id="quizResult" aria-live="polite">
                    <p class="section-kicker">Resultado</p>
                    <h3 id="resultTitle"></h3>
                    <p id="resultText"></p>
                    <button class="btn btn-primary" id="restartQuizBtn" type="button">Refazer quiz</button>
                </article>
            </div>
        </section>

        <section class="section-space mural-section" id="mural" aria-labelledby="muralTitulo">
            <div class="section-heading">
                <p class="section-kicker">Mural da Galera</p>
                <h2 id="muralTitulo">Deixe seu recado</h2>
                <p>Mensagem curta, clima leve e cards modernos para todo mundo aparecer.</p>
            </div>

            <div class="mural-layout">
                <form class="message-form" id="messageForm">
                    <label for="visitorName">Nome</label>
                    <input id="visitorName" name="nome" type="text" maxlength="30" placeholder="Seu nome">

                    <label for="visitorMessage">Mensagem</label>
                    <textarea id="visitorMessage" name="mensagem" rows="5" maxlength="140" placeholder="Escreva um recado de ate 140 caracteres"></textarea>
                    <div class="form-footer">
                        <span id="charCounter">0/140</span>
                        <button class="btn btn-primary" type="submit">Enviar recado</button>
                    </div>
                    <p class="form-feedback" id="messageFeedback" aria-live="polite"></p>
                </form>

                <div class="messages-area">
                    <div class="panel-heading">
                        <p class="section-kicker">Recados recentes</p>
                        <h3>Mensagens</h3>
                    </div>
                    <div class="message-grid" id="messageGrid">
                        <article class="message-card empty-state">Carregando recados...</article>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="site-footer">
        <div>
            <a class="brand footer-brand" href="#inicio">
                <span class="brand-mark">VP</span>
                <span>VibePlay</span>
            </a>
            <p>Uma plataforma simples de entretenimento neon feita com HTML, CSS, JavaScript e PHP.</p>
        </div>
        <div class="footer-links" aria-label="Links rapidos">
            <a href="#inicio">Inicio</a>
            <a href="#arcade">Arcade</a>
            <a href="#quiz">Quiz</a>
            <a href="#mural">Mural</a>
        </div>
        <p class="credits">Projeto escolar ficticio criado por VibePlay Studios.</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>
