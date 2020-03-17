<?php
$basePath = dirname(__DIR__);
$json = json_decode(file_get_contents($basePath . '/json/world.json'), true);
$pool = array();
foreach($json['features'] AS $f) {
    $pool[$f['properties']['ISO_A2']] = array();
}

$twJsonFile = $basePath . '/json/tw.json';
file_put_contents($twJsonFile, file_get_contents('https://www.cdc.gov.tw/CountryEpidLevel/ExportJSON'));
$bom = pack('H*','EFBBBF');
$twJsonText = str_replace($bom, '', file_get_contents($twJsonFile));
$twJson = json_decode($twJsonText, true);
file_put_contents($twJsonFile, json_encode($twJson, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
foreach($twJson AS $alert) {
    if($alert['ISO3166'] === 'TW') {
        continue;
    }
    $alertType = '';
    switch($alert['severity_level']) {
        case '第一級:注意(Watch)':
            $alertType = 'advisory';
        break;
        case '第二級:警示(Alert)':
            $alertType = 'quarantine';
        break;
        case '第三級:警告(Warning)':
            $alertType = 'restricted';
        break;
    }
    if(empty($alert['ISO3166']) && false !== strpos($alert['areaDesc'], '全球')) {
        $targets = array_keys($pool);
        foreach($targets AS $target) {
            if($target !== 'TW' && !isset($pool['TW'][$target])) {
                $pool['TW'][$target] = array(
                    'homeCountry' => 'Taiwan',
                    'homeCountryCode' => 'TW',
                    'targetCountry' => $alert['areaDesc_EN'],
                    'targetCountryCode' => $target,
                    'type' => $alertType,
                    'source' => $alert['Source'],
                    'sourceUrl' => $alert['web'],
                    'startDate' => substr($alert['effective'], 0, 10),
                    'endDate' => substr($alert['expires'], 0, 10),
                    'titleZh-TW' => $alert['headline'],
                    'descriptionZh-TW' => $alert['areaDetail'],
                );
            }
        }
    } else {
        $pool['TW'][$alert['ISO3166']] = array(
            'homeCountry' => 'Taiwan',
            'homeCountryCode' => 'TW',
            'targetCountry' => $alert['areaDesc_EN'],
            'targetCountryCode' => $alert['ISO3166'],
            'type' => $alertType,
            'source' => $alert['Source'],
            'sourceUrl' => $alert['web'],
            'startDate' => substr($alert['effective'], 0, 10),
            'endDate' => substr($alert['expires'], 0, 10),
            'titleZh-TW' => $alert['headline'],
            'descriptionZh-TW' => $alert['areaDetail'],
        );
    }
}

$fh = fopen($basePath . '/data/data.csv', 'r');
$header = fgetcsv($fh, 2048);
while($line = fgetcsv($fh, 2048)) {
    if(isset($pool[$line[1]])) {
        $pool[$line[1]][$line[3]] = array_combine($header, $line);
    }
}

// // generate random demo data
// $keys = array_keys($pool);
// $subKeys = $keys;
// $status = array('advisory', 'restricted', 'quarantine');
// foreach($keys AS $key) {
//     shuffle($subKeys);
//     $randomCount = rand(5,20);
//     for($i = 0; $i < $randomCount; $i++) {
//         if($key !== $subKeys[$i]) {
//             $randomStatus = rand(0,2);
//             $pool[$key][$subKeys[$i]] = $status[$randomStatus];    
//         }
//     }
// }

file_put_contents($basePath . '/json/data.json', json_encode($pool, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));