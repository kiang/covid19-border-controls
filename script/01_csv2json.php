<?php
$basePath = dirname(__DIR__);
$json = json_decode(file_get_contents($basePath . '/json/world.json'), true);
$pool = array();
$nameCodes = array();
foreach($json['features'] AS $f) {
    $pool[$f['properties']['ISO_A2']] = array();
    $nameCodes[$f['properties']['NAME']] = $f['properties']['ISO_A2'];
}

$fh = fopen($basePath . '/data/country_epid_level_taiwan.csv', 'r');
$nameCodeMap = array(
    'Cape Verde' => 'CV',
    'Central African Republic' => 'CF',
    'Cote d\'Ivoire' => 'CI',
    'Democratic Republic of the Congo' => 'CD',
    'Eswatini' => 'SZ',
    'Guinea' => 'GQ',
    'Sudan' => 'SS',
    'Dominican Republic' => 'DO',
    'United States' => 'US',
    'Korea, North' => 'KP',
    'Korea, South' => 'KR',
    'Lao PDR' => 'LA',
    'Bosnia and Herzegovina' => 'BA',
    'Czech Republic' => 'CZ',
    'France' => 'FR',
    'Norway' => 'NO',
    'Marshall Islands' => 'MH',
    'Solomon Islands' => 'SB',
    'Falkland Islands' => 'FK',
    'French Guiana' => 'GY',
    'Kiribati' => 'KI',
    'Western Sahara' => 'EH',
);
$header = fgetcsv($fh, 2048);
while($line = fgetcsv($fh, 2048)) {
    $data = array_combine($header, $line);
    $data['code'] = false;
    if(isset($nameCodeMap[$data['country']])) {
        $data['code'] = $nameCodeMap[$data['country']];
    } else {
        foreach($nameCodes AS $name => $code) {
            if(false === $data['code'] && false !== strpos($data['country'], $name)) {
                $data['code'] = $code;
            }
        }    
    }
    $data['type'] = '';
    switch($data['level']) {
        case 1:
            $data['type'] = 'advisory';
        break;
        case 2:
            $data['type'] = 'quarantine';
        break;
        case 3:
            $data['type'] = 'restricted';
        break;
    }
    $pool['TW'][$data['code']] = array(
        'homeCountryCode' => 'TW',
        'targetCountry' => $data['country'],
        'targetCountryCode' => $data['code'],
        'type' => $data['type'],
        'titleZh-TW' => $data['label'],
        'descriptionZh-TW' => $data['note'],
    );
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