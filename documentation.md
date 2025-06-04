<style>
    .tilted {
        font-style: italic;
        opacity: 60%;
    }
</style>

<h1>Consider this a Set of Sticky Notes, I refuse to write a real documentation</h1>
<h2>Database Structure</h2>
Italic rows are currently not used
<table>
<th>name</th><th>type</th><th>description</th>
<tr>
    <td>Capo</td>
    <td>Int(4)</td>
    <td>Capo position</td>
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
</tr>
<tr>
    <td>Deepsearch</td>
    <td>Varchar(256)</td>
    <td>String of keywords for a search-function</td>
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
<tr class="tilted">
    <td>Id</td>
    <td>Int(255)</td>
    <td>...</td>
</tr>
<tr class="tilted">
    <td>KeyShift</td>
    <td>Int(4)</td>
    <td>Problably to change displayed Key w/o using actual key, might implement at some point</td>
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
<tr class="tilted">
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
</tr>
<tr>
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
</tr>
<tr>
    <td>subTitle</td>
    <td>Varchar(128)</td>
    <td>...</td>
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
</table>