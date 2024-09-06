
<?php
function executeRESTCall($methode, $adresse, $daten = false) {
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $adresse);
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $methode);
    if ($daten){
        $head = ['Content-Type: application/text',
            'Content-Length: '. strlen($daten)];
        curl_setopt($curl, CURLOPT_HTTPHEADER, $head);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $daten);
    }
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    return curl_exec($curl);
}
echo (executeRESTCall('GET', 'http://localhost/API/index.php/'));
?>