
<?php
/*ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);*/

$methode = $_SERVER['REQUEST_METHOD'];
$req = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$wanted = NULL;
global $con;
require_once "../define_con.php";
require_once "song.php";

switch ($methode) {
    case 'GET':
        if(!empty($_GET['song'])) {
            $wanted = $_GET['song'];
        } else {
            $wanted = "list";
        }
        switch ($wanted) {
            case NULL: echo '404: You are looking for something that isn\'t here.'; break;
            case "list": // Verzeichnis auflisten
                $songlist = [];
                $sql=$con->prepare("SELECT `Deepsearch`, `Id`, `author`, `name` FROM songs");
                $sql->execute();
                $sql->bind_result($deepsearch, $id, $author, $name);
                while($sql->fetch()) {
                    array_push($songlist, [$name, $author, $deepsearch, $id]);
                }

                echo json_encode($songlist);
                break;
            default:
                $song = Song::newFromDatabaseByName($wanted);
                if(!empty($song)) {
                    echo $song->toJSON();
                } else {
                    echo "There was an Error";
                }
                break;
        }
        break;
    case 'POST':
        $rawData = file_get_contents("php://input");
        $data = json_decode($rawData, true);

        if ($data["action"] == "edit") {
            $editsql = $con->prepare("UPDATE `songs` SET `name` = ?, `subTitle` = ?, `author` = ?, `key` = ?, `KeyShift` = ?, `Capo` = ?, `parts` = ? WHERE `songs`.`Id` = ?;");
            if ($editsql) {
                $editsql->bind_param("sssiiisi", $data["name"], $data["altt"], $data["auth"], $data["key"], $data["keyshift"], $data["capo"], $data["parts"], $data["id"]);
                if ($editsql->execute()) {
                    echo "oki u good";
                } else {
                    echo "There was a meowstake: " . $editsql->error;
                }
            } else {
                die("SQL error: " . $con->error);
            }
        } else {
            echo "Not supported yet so u did bulls";
        }
        break;
}
?>