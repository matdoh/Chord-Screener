
<?php
$methode = $_SERVER['REQUEST_METHOD'];
$req = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$wanted = NULL;
if(!empty($_GET['song'])) {$wanted = $_GET['song'];}
else {$wanted = "list";}

$data = json_decode(substr(file_get_contents('files/dataFile.txt'), 3));

switch ($methode) {
    case 'GET':
        switch ($wanted) {
            case NULL: echo '404: You are looking for something that isn\'t here.';
            case "list": // Verzeichnis auflisten
                $me = $data->songs;
                $returnarray = array();

                foreach($me as $m) {
                    if($m->Deleted == false) {
                        $returnarray[] = [$m->name, $m->author, $m->DeepSearch];
                    }
                }

                echo json_encode($returnarray);
            default:
                foreach ($data->songs as $song) {
                    if($song->name == $wanted) {
                        echo json_encode($song);
                        break;
                    }
                }

        }
        break;
}
?>