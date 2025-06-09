<?php
    global $con;
    require_once "define_con.php";
    $allowaccesss = false;
    if(isset($_COOKIE["access"]) || isset($_POST["loginfield"])) {

        // Check for database connection error
        if (!$con || $con->connect_error) {
            die("DB connection failed: " . $con->connect_error);
        }

        $sql = $con->prepare("SELECT reference_key FROM user WHERE hashed_access_key = ?");

        // Try via Cookie
        if (isset($_COOKIE["access"])) {
            $sql->bind_param("s", $_COOKIE["access"]);
            $sql->execute();
            $sql->bind_result($res);
            while($sql->fetch()) {
                if($res==$_COOKIE["ref"]) {
                    $allowaccesss = true;
                    setcookie("access", $_COOKIE["access"], time() + (86400 * 30));
                    setcookie("ref", $_COOKIE["ref"], time() + (86400 * 30));
                }
            }
        } else { //Try via key
            $hashedkey = hash("sha256", $_POST["loginfield"]);
            $sql->bind_param("s", $hashedkey);
            $sql->execute();
            $sql->bind_result($res);
            while($sql->fetch()) {
                if($res) {
                    $allowaccesss = true;
                    setcookie("access", $hashedkey, time() + (86400 * 30));
                    setcookie("ref", $res, time() + (86400 * 30));
                }
            }
        }


    }
    if(!$allowaccesss) {
        header("Location: denied.html");
    } else {
        readfile("screen.html");
    }
?>
