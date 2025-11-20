
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
require_once "killer.php";
ensure_roles();

switch ($methode) {
    case 'GET':
        if(!empty($_GET['song'])) {
            $wanted = $_GET['song'];
        } elseif(!empty($_GET['roles'])) {
            $wanted = "roles";
        } else {
            $wanted = "list";
        }
        switch ($wanted) {
            case "list": // Verzeichnis auflisten
                allow_by_role("PreViewer");
                $songlist = [];
                $sql=$con->prepare("SELECT `Deepsearch`, `Id`, `author`, `name` FROM songs WHERE `Deleted` <= 0");
                $sql->execute();
                $sql->bind_result($deepsearch, $id, $author, $name);
                while($sql->fetch()) {
                    array_push($songlist, [$name, $author, $deepsearch, $id]);
                }

                echo json_encode($songlist);
                break;
            case "roles":
                echo get_roles();
                break;
            default:
                allow_by_role("Viewer");
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
            allow_by_role("Editor");
            $editsql = $con->prepare("UPDATE `songs` SET `name` = ?, `subTitle` = ?, `author` = ?, `key` = ?, `KeyShift` = ?, `Capo` = ?, `parts` = ?, `Deepsearch` = ?, `Copyright` = ? WHERE `songs`.`Id` = ?;");
            if ($editsql) {
                $editsql->bind_param("sssiiisssi", $data["name"], $data["altt"], $data["auth"], $data["key"], $data["keyshift"], $data["capo"], $data["parts"], $data["deepsearch"], $data["copyr"], $data["id"]);
                if ($editsql->execute()) {
                    echo "oki u good";
                } else {
                    echo "There was a meowstake: " . $editsql->error;
                }
            } else {
                die("SQL error: " . $con->error);
            }
        } else if ($data["action"] == "add") {
            allow_by_role("Editor");
            $addsql = $con->prepare("INSERT INTO `songs` (`Capo`, `Chords`, `Copyright`, `Deepsearch`, `Deleted`, `Duration`, `Duration2`, `HasChildren`, `Id`, `KeyShift`, `LinkedAudio`, `ModifiedDateTime`, `NotesText`, `ParentId`, `SectionOrder`, `SongNumber`, `SyncId`, `TempoInt`, `Url`, `Zoom`, `ZoomFactor`, `author`, `content`, `drawingPathsBackup`, `hash`, `key`, `locked`, `midiOnLoad`, `name`, `subTitle`, `timeSig`, `type`, `vName`, `_displayParams`, `_folders`, `_tags`, `parts`, `commentMatrix`) VALUES (?, NULL, ?, ?, '0', '0', '0', '0', NULL, ?, NULL, current_timestamp(), '', '0', '', NULL, '', '0', '', '1', '1', ?, '', NULL, '', ?, '0', NULL, ?, ?, '', '1', NULL, '{}', '[]', '[]', ?, ?);");
            if ($addsql) {
                $commentmatrix = '{"0":{"0":[[0, "default comment"]],"2":[[0, "wie immer break auf A"]]}}';
                $addsql->bind_param("issisissss", $data["capo"], $data["copyr"], $data["deepsearch"], $data["keyshift"], $data["auth"], $data["key"], $data["name"], $data["altt"], $data["parts"], $commentmatrix);
                if ($addsql->execute()) {
                    echo "oki u good";
                } else {
                    echo "There was a meowstake: " . $addsql->error;
                }
            }
        } else if ($data["action"] == "delete") {
            allow_by_role("Editor");
            $editsql = $con->prepare("UPDATE `songs` SET `Deleted` = 1 WHERE `songs`.`Id` = ?;");
            if ($editsql) {
                $editsql->bind_param("i", $data["id"]);
                if ($editsql->execute()) {
                    echo "oki u good";
                } else {
                    echo "There was a meowstake: " . $editsql->error;
                }
            } else {
                die("SQL error: " . $con->error);
            }
        }
        break;
}