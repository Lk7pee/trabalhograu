# BRASA BURGER

Site comercial fictício de uma hamburgueria artesanal, desenvolvido para demonstrar como uma experiência de delivery moderna pode ser construída apenas com tecnologias nativas da web.

O projeto funciona diretamente no navegador, sem instalação, framework, backend ou banco de dados.

## Objetivo

Apresentar a **BRASA BURGER** como uma marca premium e permitir que o visitante conheça o cardápio, filtre produtos, monte um pedido, aplique um cupom e gere uma mensagem pronta para envio pelo WhatsApp.

## Tecnologias

- HTML5 semântico;
- CSS3 responsivo, com animações e temas claro/escuro;
- JavaScript puro;
- `localStorage` para manter o carrinho, o cupom e o tema no navegador.

## Funcionalidades

- Header fixo e menu responsivo;
- Hero comercial com destaques da marca;
- Cardápio com 10 produtos e filtros por categoria;
- Carrinho com inclusão, remoção e controle de quantidade;
- Cálculo de subtotal, entrega, desconto e total;
- Frete grátis em pedidos a partir de R$ 100;
- Cupom `BRASA10` com 10% de desconto;
- Formulário com validação de nome, endereço e itens;
- Modal de revisão do pedido;
- Mensagem formatada para envio pelo WhatsApp;
- Carrinho salvo temporariamente no `localStorage`;
- Tema claro/escuro salvo no navegador;
- Animações ao rolar, navegação ativa e botão de voltar ao topo;
- Layout adaptado para celular, tablet e computador.

## Estrutura

```text
vibeplay/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Como executar

Abra o arquivo `index.html` em qualquer navegador moderno. Não é necessário instalar dependências nem iniciar servidor.

## Personalização rápida

- Número do WhatsApp: altere `WHATSAPP_NUMBER` no início de `script.js`;
- Produtos e preços: altere o array `products` em `script.js`;
- Taxa e frete grátis: altere `DELIVERY_FEE` e `FREE_DELIVERY_MINIMUM`;
- Cores: altere as variáveis no início de `style.css`;
- Dados de contato: edite a seção `#contato` em `index.html`.

> Os dados comerciais, depoimentos, endereço e telefone são fictícios e foram criados para fins acadêmicos.
