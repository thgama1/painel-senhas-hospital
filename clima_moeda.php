<?php
// 1. Desativa a exibição de erros para não sujar o JSON
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

// Função para buscar dados com bypass de segurança (SSL e User-Agent)
function buscar_dados($url) {
    $opts = [
        "http" => [
            "method" => "GET",
            "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\n"
        ],
        "ssl" => [
            "verify_peer" => false,
            "verify_peer_name" => false,
        ]
    ];
    $context = stream_context_create($opts);
    return @file_get_contents($url, false, $context);
}

// 2. Busca Moedas
$jsonMoedas = buscar_dados("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL");
$dataMoedas = json_decode($jsonMoedas, true);

$dolar = "R$ --";
$euro = "R$ --";

// Verifica se os dados existem antes de acessar
if (isset($dataMoedas['USDBRL']['bid'])) {
    $dolar = "R$ " . number_format($dataMoedas['USDBRL']['bid'], 2, ',', '.');
}
if (isset($dataMoedas['EURBRL']['bid'])) {
    $euro = "R$ " . number_format($dataMoedas['EURBRL']['bid'], 2, ',', '.');
}

// 3. Busca Clima (Open-Meteo - Volta Redonda)
$jsonClima = buscar_dados("https://api.open-meteo.com/v1/forecast?latitude=-22.52&longitude=-44.10&current_weather=true");
$dataClima = json_decode($jsonClima, true);

$temp = $dataClima['current_weather']['temperature'] ?? '--';
$clima = $temp . "°C";

// 4. Retorno Limpo para o JavaScript
echo json_encode([
    'dolar' => $dolar,
    'euro'  => $euro,
    'clima' => $clima
]);