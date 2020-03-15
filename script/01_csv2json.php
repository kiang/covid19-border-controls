<?php
$basePath = dirname(__DIR__);
$json = json_decode(file_get_contents($basePath . '/json/world.json'), true);
$pool = array();
foreach($json['features'] AS $f) {
    $pool[$f['properties']['iso_a2']] = array();
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