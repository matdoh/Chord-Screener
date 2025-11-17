<style>
    .tilted {
        font-style: italic;
        opacity: 60%;
    }
    .outdated {
        color: #660000
    }
    .new {
        color: #44FF44;
    }
</style>

<h1>Consider this a Set of Sticky Notes, I refuse to write a real documentation</h1>
<h2>define_con.php</h2>
there is a file called "define_con.php" in the main folder. It will not be put on git for safety-reasons, but it looks like this:

```php
$servername = "localhost";
$user = "some username";
$pw = "some password";
$db = "some database name";

$_SESSION["con"] = new mysqli($servername, $user, $pw, $db);
$_SESSION["con"]->set_charset("utf8");
$_SESSION["db"] = true;
```
<h2>Database Structure</h2>
Italic rows are currently not used
<h3>songs</h3>
<table>
<th>name</th><th>type</th><th>description</th><th>editor range</th>
<tr>
    <td>Capo</td>
    <td>Int(4)</td>
    <td>Capo position</td>
    <td>i</td>
</tr>
<tr class="tilted">
    <td>Chords</td>
    <td>Int(1)</td>
    <td>no clue</td>
</tr>
<tr class="tilted">
    <td>Copyright</td>
    <td>Varchar(256)</td>
    <td>a copyright hint at the end of a song, currently not displayed.</td>
    <td>s: dummy in add, not in edit</td>
</tr>
<tr>
    <td>Deepsearch</td>
    <td>Varchar(256)</td>
    <td>String of keywords for a search-function</td>
    <td>s: dummy in add, not in edit</td>
</tr>
<tr class="tilted">
    <td>Deleted</td>
    <td>Tinyint(1)</td>
    <td>...</td>
</tr>
<tr>
    <td>Duration</td>
    <td>Int(1)</td>
    <td>Duration of the Song, in Seconds, used for Autoscroll</td>
</tr>
<tr class="tilted">
    <td>Duration2</td>
    <td>Int(1)</td>
    <td>prly the same as Duration, idk man</td>
</tr>
<tr class="tilted">
    <td>HasChildren</td>
    <td>Int(1)</td>
    <td>...</td>
</tr>
<tr>
    <td>Id</td>
    <td>Int(255)</td>
    <td>...</td>
    <td>i: in edit, a_i in add</td>
</tr>
<tr>
    <td>KeyShift</td>
    <td>Int(4)</td>
    <td>The set key (not the Original Key)</td>
    <td>i</td>
</tr>
<tr class="tilted">
    <td>LinkedAudio</td>
    <td>Varchar(256)</td>
    <td>a Link to some Audio</td>
</tr>
<tr class="tilted">
    <td>ModifiedDateTime</td>
    <td>Datetime</td>
    <td>...</td>
</tr>
<tr class="tilted">
    <td>NotesText</td>
    <td>Varchar(1)</td>
    <td>no clue</td>
</tr>
<tr class="tilted">
    <td>ParentId</td>
    <td>Int(1)</td>
    <td>...</td>
</tr>
<tr class="tilted">
    <td>SectionOrder</td>
    <td>Varchar(256)</td>
    <td>I must've known at some point but not anymore</td>
</tr>
<tr>
    <td>SongNumber</td>
    <td>Int(10)</td>
    <td>...</td>
</tr>
<tr class="tilted">
    <td>SyncId</td>
    <td>Varchar(32)</td>
    <td>key for syncing (as if I'd ever implement that)</td>
</tr>
<tr class="tilted">
    <td>TempoInt</td>
    <td>Int(1)</td>
    <td>I have a raw idea</td>
</tr>
<tr class="tilted">
    <td>Url</td>
    <td>Varchar(128)</td>
    <td>Some other link</td>
</tr>
<tr>
    <td>Zoom</td>
    <td>Double</td>
    <td>Zoom-preset</td>
</tr>
<tr class="tilted">
    <td>ZoomFactor</td>
    <td>Double</td>
    <td>same thing as Zoom ig</td>
</tr>
<tr>
    <td>author</td>
    <td>Varchar(128)</td>
    <td>...</td>
    <td>s</td>
</tr>
<tr class="outdated">
    <td>content</td>
    <td>Varchar(8192)</td>
    <td>The entire ChordPro-Content</td>
</tr>
<tr class="tilted">
    <td>drawingPathsBackup</td>
    <td>Varchar(1)</td>
    <td>I will never use this I promise</td>
</tr>
<tr class="tilted">
    <td>hash</td>
    <td>Varchar(64)</td>
    <td>no clue. But it exists.</td>
</tr>
<tr>
    <td>key</td>
    <td>Int(4)</td>
    <td>...</td>
    <td>i</td>
</tr>
<tr class="tilted">
    <td>locked</td>
    <td>Tinyint(1)</td>
    <td>...</td>
</tr>
<tr class="tilted">
    <td>midiOnLoad</td>
    <td>varchar(1)</td>
    <td>I will never</td>
</tr>
<tr>
    <td>name</td>
    <td>Varchar(128)</td>
    <td>...</td>
    <td>s</td>
</tr>
<tr>
    <td>subTitle</td>
    <td>Varchar(128)</td>
    <td>...</td>
    <td>s</td>
</tr>
<tr class="tilted">
    <td>timeSig</td>
    <td>Varchar(1)</td>
    <td>no clue</td>
</tr>
<tr class="tilted">
    <td>type</td>
    <td>Int(1)</td>
    <td>no clue</td>
</tr>
<tr class="tilted">
    <td>vName</td>
    <td>Varcahr(1)</td>
    <td>no clue</td>
</tr>
<tr class="tilted">
    <td>_displayParams</td>
    <td>Varchar(2)</td>
    <td>{}</td>
</tr>
<tr class="tilted">
    <td>_folders</td>
    <td>Varchar(2)</td>
    <td>[]</td>
</tr>
<tr class="tilted">
    <td>_tags</td>
    <td>Varchar(64)</td>
    <td>Actually Cool, Might implement</td>
</tr>
<tr class="new">
    <td>parts</td>
    <td>Varchar(8192)</td>
    <td>array(array(header, content))</td>
    <td>s</td>
</tr>
<tr class="new">
    <td>commentMatrix</td>
    <td>Varchar(1023)</td>
    <td>dict(author, dict(part, array(array(line, content))))</td>
    <td>s: dummycomment in add, will got its own editor</td>
</tr>
</table>
<h3>users</h3>
<table>
<th>name</th><th>type</th><th>description</th>
<tr>
    <td>Id</td>
    <td>Bigint(20)</td>
    <td>...</td>
</tr>
<tr class="tilted">
    <td>username</td>
    <td>Varchar(63)</td>
    <td>a display name</td>
</tr>
<tr>
    <td>hashed_access_key</td>
    <td>Varchar(127)</td>
    <td>Similar to a hashed password, only key will be used to login</td>
</tr>
<tr>
    <td>reference_key</td>
    <td>Varchar(127)</td>
    <td>Key used in visible code, to display comments etc.</td>
</tr>
</table>

<h2>Cookies</h2>
<table>
<th>name</th><th>type</th><th>description</th>
<tr>
    <td>access</td>
    <td>String</td>
    <td>hashed access key from the database</td>
</tr>
<tr>
    <td>ref</td>
    <td>String</td>
    <td>another hash value of lower security significance</td>
</tr>
</table>