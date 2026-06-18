# VibePlay

O **VibePlay** é um projeto acadêmico e prático de desenvolvimento web voltado para entretenimento. O site reúne uma página inicial responsiva, o jogo arcade **Neon Dodge**, um quiz interativo de personalidade e um mural de recados.

Todo o projeto foi desenvolvido com as três linguagens principais da web e funciona diretamente no navegador.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript

O projeto:

- não usa frameworks;
- não usa banco de dados;
- não usa backend;
- não usa PHP;
- não depende de bibliotecas externas ou CDN;
- funciona diretamente no navegador e no GitHub Pages.

## Funcionalidades

- Página inicial responsiva com identidade neon, gamer e futurista;
- Seções de destaques e explicação das experiências;
- Menu de navegação adaptado para dispositivos móveis;
- Jogo **Neon Dodge** com teclado, WASD e controles para celular;
- Pontuação, vidas, níveis e dificuldade progressiva;
- Ranking local com os melhores resultados;
- Quiz interativo com progresso, sete perguntas e resultados personalizados;
- Mural de recados com validação e contador de caracteres;
- Armazenamento local do ranking e dos recados com `localStorage`;
- Layout adaptado para celular, tablet e desktop;
- Cuidados básicos de acessibilidade, contraste e navegação por teclado.

## Estrutura de arquivos

```text
vibeplay/
├── index.html
├── style.css
├── script.js
└── README.md
```

- `index.html`: contém a estrutura semântica e todo o conteúdo do site;
- `style.css`: define a identidade visual, animações leves e responsividade;
- `script.js`: controla o menu, o jogo, o quiz, o mural e o `localStorage`;
- `README.md`: apresenta a documentação do projeto.

## Como executar

Não é necessário instalar programas ou dependências.

1. Baixe ou clone o repositório.
2. Abra o arquivo `index.html` em um navegador moderno.

Também é possível acessar o projeto pelo endereço publicado no GitHub Pages.

## Como publicar no GitHub Pages

1. Adicione os arquivos ao repositório.
2. Faça o commit e o push para o GitHub.
3. No repositório, acesse **Settings > Pages**.
4. Em **Source**, escolha **Deploy from a branch**.
5. Selecione a branch `main`.
6. Selecione a pasta `/root`.
7. Clique em **Save**.
8. Aguarde a publicação e acesse o link gerado pelo GitHub.

## Observação importante

O ranking do Neon Dodge e o mural usam `localStorage`. Isso significa que os dados ficam salvos somente no navegador e no dispositivo de cada visitante. Eles não são enviados para um servidor e não são compartilhados entre usuários ou navegadores diferentes.
