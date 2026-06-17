<?php
header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('America/Sao_Paulo');

$arquivo = __DIR__ . '/dados/ranking.json';

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
$pontos = filter_var($entrada['pontos'] ?? null, FILTER_VALIDATE_INT);

if ($nome === '') {
    responder(false, 'Digite um nome para o ranking.', [], 400);
}

if (tamanho_texto($nome) > 20) {
    responder(false, 'O nome deve ter no maximo 20 caracteres.', [], 400);
}

if ($pontos === false || $pontos < 0) {
    responder(false, 'Pontuacao invalida.', [], 400);
}

if (!is_dir(dirname($arquivo))) {
    mkdir(dirname($arquivo), 0775, true);
}

$ranking = ler_json($arquivo);
$ranking[] = [
    'nome' => htmlspecialchars($nome, ENT_QUOTES, 'UTF-8'),
    'pontos' => $pontos,
    'data' => date('d/m/Y H:i')
];

usort($ranking, function ($a, $b) {
    return ($b['pontos'] ?? 0) <=> ($a['pontos'] ?? 0);
});

$ranking = array_slice($ranking, 0, 10);

$salvo = file_put_contents(
    $arquivo,
    json_encode($ranking, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
    LOCK_EX
);

if ($salvo === false) {
    responder(false, 'Nao foi possivel salvar o ranking.', [], 500);
}

responder(true, 'Pontuacao salva com sucesso.', ['ranking' => $ranking]);
