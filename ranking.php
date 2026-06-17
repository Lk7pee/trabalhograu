<?php
header('Content-Type: application/json; charset=utf-8');

$arquivo = __DIR__ . '/dados/ranking.json';

function ler_json($arquivo) {
    if (!file_exists($arquivo) || filesize($arquivo) === 0) {
        return [];
    }

    $conteudo = file_get_contents($arquivo);
    $dados = json_decode($conteudo, true);
    return is_array($dados) ? $dados : [];
}

$ranking = ler_json($arquivo);

usort($ranking, function ($a, $b) {
    return ($b['pontos'] ?? 0) <=> ($a['pontos'] ?? 0);
});

echo json_encode([
    'sucesso' => true,
    'ranking' => array_slice($ranking, 0, 10)
], JSON_UNESCAPED_UNICODE);
