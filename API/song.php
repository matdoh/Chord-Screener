<?php
class song
{
    private $Capo;
    private $Deepsearch;
    private $Duration;
    private $Id;
    private $Zoom;
    private $author;
    private $key;
    private $name;
    private $subTitle;
    private $parts;
    private $commentMatrix;

    public function __construct($Capo, $Deepsearch, $Duration, $Id, $Zoom, $author, $key, $name, $subTitle, $parts, $commentMatrix) { //from songbookpro-json
        $this->Capo = $Capo;
        $this->Deepsearch = $Deepsearch;
        $this->Duration = $Duration;
        $this->Id = $Id;
        $this->Zoom = $Zoom;
        $this->author = $author;
        $this->key = $key;
        $this->name = $name;
        $this->subTitle = $subTitle;
        $this->parts = $parts;
        $this->commentMatrix = $commentMatrix;
    }

    public static function newFromDatabase($Id) {
        global $con;
        require_once "../define_con.php";
        $sql = $con->prepare("SELECT `Capo`, `Deepsearch`, `Duration`, `Id`, `Zoom`, `author`, `key`, `name`, `subTitle`, `parts`, `commentMatrix` FROM `songs` WHERE `Id` = ?");
        $sql->bind_param("i", $Id);
        $sql->execute();
        $sql->bind_result($capo, $deepsearch, $duration, $id, $zoom, $author, $key, $name, $subTitle, $parts, $commentMatrix);
        while ($sql->fetch()) {
            return new song($capo, $deepsearch, $duration, $id, $zoom, $author, $key, $name, $subTitle, $parts, $commentMatrix);
        }
        return null;
    }

    public static function newFromDatabaseByName($name) {
        global $con;
        require_once "../define_con.php";
        $sql = $con->prepare("SELECT `Capo`, `Deepsearch`, `Duration`, `Id`, `Zoom`, `author`, `key`, `name`, `subTitle`, `parts`, `commentMatrix` FROM `songs` WHERE `name` = ?");
        $sql->bind_param("s", $name);
        $sql->execute();
        $sql->bind_result($capo, $deepsearch, $duration, $id, $zoom, $author, $key, $name, $subTitle, $parts, $commentMatrix);
        while ($sql->fetch()) {
            return new song($capo, $deepsearch, $duration, $id, $zoom, $author, $key, $name, $subTitle, $parts, $commentMatrix);
        }
        return null;
    }

    public function toJSON() {
        $data = array();
        $data["Capo"] = $this->Capo;
        $data["Deepsearch"] = $this->Deepsearch;
        $data["Duration"] = $this->Duration;
        $data["Id"] = $this->Id;
        $data["Zoom"] = $this->Zoom;
        $data["author"] = $this->author;
        $data["key"] = $this->key;
        $data["name"] = $this->name;
        $data["subTitle"] = $this->subTitle;
        $data["parts"] = $this->parts;
        $data["commentMatrix"] = $this->commentMatrix;
        return json_encode($data);
    }
}