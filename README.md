# VibePlay

O **VibePlay** é um projeto acadêmico e prático de desenvolvimento web voltado para entretenimento casual no navegador. A proposta visual atual é o **VibePlay Lounge**, uma experiência escura, sólida e organizada com três áreas principais: jogo, quiz e mural.

Todo o projeto foi desenvolvido com HTML, CSS e JavaScript puro, sem frameworks e sem dependências externas.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript puro
- Canvas API
- Local Storage

O projeto:

- não usa frameworks;
- não usa banco de dados;
- não usa backend;
- não usa PHP;
- não depende de bibliotecas externas ou CDN;
- funciona diretamente no navegador e no GitHub Pages.

## Funcionalidades

- Tema escuro padrão com modo claro alternativo;
- Preferência de tema salva no `localStorage`;
- Página inicial responsiva com conceito **VibePlay Lounge**;
- Menu desktop e menu hamburguer funcional no celular;
- Scroll suave e header com efeito ao rolar;
- Jogo **Bloco Rush** com canvas, teclado, WASD e controles mobile;
- Pontuação, vidas, níveis, pausa, reinício e dificuldade progressiva;
- Ranking local do jogo salvo no navegador;
- **Quiz da Vibe** com progresso, alternativas selecionáveis e resultado personalizado;
- **Mural da Galera** com nome, mensagem, contador de caracteres e lista de recados;
- Recados salvos localmente com `localStorage`;
- Botão de voltar ao topo no rodapé;
- Layout adaptado para celular, tablet e desktop.

## Estrutura de arquivos

```text
vibeplay/
├── index.html
├── style.css
├── script.js
└── README.md
```

- `index.html`: contém a estrutura semântica e todo o conteúdo do site;
- `style.css`: define a identidade visual, os temas claro e escuro e a responsividade;
- `script.js`: controla menu, tema, jogo, quiz, mural, ranking e `localStorage`;
- `README.md`: apresenta a documentação do projeto.

## Como executar

Não é necessário instalar programas ou dependências.

1. Baixe ou clone o repositório.
2. Abra o arquivo `index.html` em um navegador moderno.

Também é possível publicar o projeto no GitHub Pages.

## Como publicar no GitHub Pages

1. Adicione os arquivos ao repositório.
2. Faça o commit e o push para o GitHub.
3. No repositório, acesse **Settings > Pages**.
4. Em **Source**, escolha **Deploy from a branch**.
5. Selecione a branch `main`.
6. Selecione a pasta `/root`.
7. Clique em **Save**.
8. Aguarde a publicação e acesse o link gerado pelo GitHub.

## Armazenamento local

O tema escolhido, o ranking do Bloco Rush e os recados do mural usam `localStorage`. Isso significa que os dados ficam salvos somente no navegador e no dispositivo de cada visitante. Eles não são enviados para servidor e não são compartilhados entre usuários ou navegadores diferentes.
