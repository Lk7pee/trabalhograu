<?php
header('Content-Type: application/json; charset=utf-8');

$arquivo = __DIR__ . '/dados/recados.json';

function ler_json($arquivo) {
    if (!file_exists($arquivo) || filesize($arquivo) === 0) {
        return [];
    }

    $conteudo = file_get_contents($arquivo);
    $dados = json_decode($conteudo, true);
    return is_array($dados) ? $dados : [];
}

$recados = ler_json($arquivo);

echo json_encode([
    'sucesso' => true,
    'recados' => $recados
], JSON_UNESCAPED_UNICODE);
