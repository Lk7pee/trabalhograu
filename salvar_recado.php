<?php
header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('America/Sao_Paulo');

$arquivo = __DIR__ . '/dados/recados.json';

function responder($sucesso, $mensagem, $extra = [], $status = 200) {
    http_response_code($status);
    echo json_encode(array_merge([
        'sucesso' => $sucesso,
        'mensagem' => $mensagem
    ], $extra), JSON_UNESCAPED_UNICODE);
    exit;
}

function tamanho_texto($texto) {
    return function_exists('mb_strlen') ? mb_strlen($texto, 'UTF-8') : strlen($texto);
}

function ler_json($arquivo) {
    if (!file_exists($arquivo) || filesize($arquivo) === 0) {
        return [];
    }

    $conteudo = file_get_contents($arquivo);
    $dados = json_decode($conteudo, true);
    return is_array($dados) ? $dados : [];
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Metodo nao permitido.', [], 405);
}

$entrada = json_decode(file_get_contents('php://input'), true);
if (!is_array($entrada)) {
    $entrada = $_POST;
}

$nome = trim($entrada['nome'] ?? '');
$mensagem = trim($entrada['mensagem'] ?? '');

if ($nome === '' || $mensagem === '') {
    responder(false, 'Preencha nome e mensagem.', [], 400);
}

if (tamanho_texto($nome) > 30) {
    responder(false, 'O nome deve ter no maximo 30 caracteres.', [], 400);
}

if (tamanho_texto($mensagem) > 140) {
    responder(false, 'A mensagem deve ter no maximo 140 caracteres.', [], 400);
}

if (!is_dir(dirname($arquivo))) {
    mkdir(dirname($arquivo), 0775, true);
}

$recados = ler_json($arquivo);
$recados[] = [
    'nome' => htmlspecialchars($nome, ENT_QUOTES, 'UTF-8'),
    'mensagem' => htmlspecialchars($mensagem, ENT_QUOTES, 'UTF-8'),
    'data' => date('d/m/Y H:i')
];

// Mantem o mural leve e evita um arquivo grande demais para um projeto simples.
$recados = array_slice($recados, -50);

$salvo = file_put_contents(
    $arquivo,
    json_encode($recados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
    LOCK_EX
);

if ($salvo === false) {
    responder(false, 'Nao foi possivel salvar o recado.', [], 500);
}

responder(true, 'Recado salvo com sucesso.', ['recados' => $recados]);
