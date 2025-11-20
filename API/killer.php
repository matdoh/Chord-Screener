<?php
require_once "../define_con.php";

function ensure_roles () {
    if(!$_SESSION["hasRoles"]) {
        global $con;
        $sql=$con->prepare("SELECT `roles` FROM `user` WHERE `hashed_access_key`=?;");
        $sql->bind_param("s", $_COOKIE["access"]);
        $sql->execute();
        $sql->bind_result($roles);
        while($sql->fetch()) {
            $_SESSION["hasRoles"]=true;
            foreach(str_split($roles) as $role) {
                $_SESSION["roles"][]=(int)$role;
            }
        }
    }
}

function allow_action($category, $required_rank) {
    ensure_roles();
    if($_SESSION["roles"][$category] < $required_rank) {die("Access denied.");}
}

function allow_by_role($rolename) {
    switch(strtolower($rolename)) {
        case "previewer": allow_action(0, 1); break;
        case "viewer": allow_action(0, 2); break;
        case "commenter":
        case "member": allow_action(0, 3); break;
        case "editor": allow_action(1, 1); break;
        case "bandmanager": allow_action(2, 1); break;
        default: die("role synonym not found");
    }
}