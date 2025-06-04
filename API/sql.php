
<?php
$methode = $_SERVER['REQUEST_METHOD'];
$req = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$wanted = NULL;

switch ($methode) {
    case 'GET':
        if(!empty($_GET['song'])) {
            $wanted = $_GET['song'];
        } else {
            $wanted = "list";
        }
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
    case 'POST':
        $wanted = "create";
        switch ($wanted) {
            case "create":

        }
}
?>