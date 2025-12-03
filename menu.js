//imports
import {dynamic_text, sleep} from "./inc/utils.js";

//Global Vars
const dynamicsearch = document.getElementById('searchv');
const scrollinput = document.getElementById('AVSpeedSlide');
const screenbar = document.getElementById('screenbar');
const scrollSect = document.getElementById('chordScreen');
const editSect = document.getElementById('editScreen');
const scaleinput = document.getElementById('ScaleIn');
const songlist = document.getElementById('songlist');
const loader = document.getElementById('loading');
const editortextinputs = document.querySelectorAll('#ehead label input[type=text]');
const Kreuzkey = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
const bKey = ["A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab"];
const keyDict = [
    ["A", Kreuzkey],
    ["Bb", bKey],
    ["B", Kreuzkey],
    ["C", Kreuzkey],
    ["Db", bKey],
    ["D", Kreuzkey],
    ["Eb", bKey],
    ["E", Kreuzkey],
    ["F#", Kreuzkey],
    ["Gb", bKey],
    ["G", Kreuzkey],
    ["Ab", bKey]];
const defscrollspeed = 30;
const hasTouch = matchMedia("(pointer: coarse)").matches;
var viewer = "";
var displayedKey = null;
var actualKey = null;
var capopos = 0;
var textmode = -1;
var currentData;
var full = false;
var autoscrollvar = false;
var AVThresholdStamp = 0;
var LoadThresholdStamp = 0;
var GuestureThresholdStamp = 0;
var scrollspeed = 0;
var current_window = "list"; // "chords", "edit", "add"
var editor_len = 0;
var editor_comments = {}

//INITIALIZE SITE
//Start-functions
setViewer();
grab();
removeUninteresting();
search();
dynamicsearch.addEventListener('input', search);
//chordbarbuts
document.getElementById("backtolistbut").addEventListener("click", back_to_list);
document.getElementById("transupbut").addEventListener("click", () => transpose(1));
document.getElementById("transdownbut").addEventListener("click", () => transpose(11));
document.getElementById("capoupbut").addEventListener("click", () => transpose(11, true));
document.getElementById("capodownbut").addEventListener("click", () => transpose(1, true));
document.getElementById("textmodebut").addEventListener("click", flip_textmode);
document.getElementById("fullscreenbut").addEventListener("click", fullscreen);
document.getElementById("cbcolbut").addEventListener("click", flip_darkmode);
document.getElementById("cbblue").addEventListener("click", () => set_palette('colors/palette-blue.css'));
document.getElementById("cbboard").addEventListener("click", () => set_palette('colors/palette-blackboard.css'));
scaleinput.addEventListener('input', zoom);
document.getElementById("cbscrbut").addEventListener('click', autoscroll);
scrollinput.addEventListener('input', update_VA_speed);
document.getElementById("editbut").addEventListener("click", open_editor);
document.getElementById("new_song_but").addEventListener("click", open_editor);

let ekey = document.getElementById("ekey");
ekey.addEventListener("input", () => setDefQuickChords(ekey.value));
//EXPANDABLE BUTTONS ON TOUCH
document.addEventListener("touchstart", (e) => {
    const el = e.target.closest(".extendable");

    // remove old touch hovers
    document.querySelectorAll(".touch-active")
        .forEach(x => x.classList.remove("touch-active"));

    if (!el) return;

    // activate hover on the touched element
    el.classList.add("touch-active");
});
editortextinputs.forEach(input => {
    addEventListener('input', () => dynamic_text(input));
});

//guesture control
scrollSect.addEventListener('wheel', function(event) {
    if (event.deltaX < 0) {
        event.preventDefault();
        if (event.deltaX < -50 && Date.now() - 1000 > GuestureThresholdStamp) {
            back_to_list();
        }
    }
});
editSect.addEventListener('wheel', function(event) {
    if (event.deltaX < 0) {
        event.preventDefault();
        if (event.deltaX < -50) {
            discard_song();
            GuestureThresholdStamp = Date.now()
        }
    }
});

//hotkeys
document.addEventListener("keydown", (e) => {
    if(current_window === "edit") {
        // New Chord
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
            e.preventDefault();
            setChordAtCursor();
            return;
        }
        for(let i = 0; i < 10; i++) {
            let istr = "" + i;
            if ((e.metaKey || e.ctrlKey) && e.key === istr) {
                e.preventDefault();
                let nchf = document.getElementById("hotchord"+istr)
                if(nchf.value) {
                    setChordAtCursor(nchf.value);
                } else {
                    setChordAtCursor(nchf.placeholder);
                }

                return;
            }
        }

    }
    // Shift + N
    if (e.shiftKey && e.key === "n") {
        e.preventDefault();
        console.log("New item shortcut triggered!");

        return;
    }
    // if
});


//Funcs
function setDefQuickChords(scale) {
    if(!(scale < 12 && scale >= 0)) {return;}
    //IDEE (A): [A, E, F#m, D, C#m, Bm, ., ., ., N.C.]
    let keys = keyDict[scale][1].slice(scale).concat(keyDict[scale][1].slice(0, scale));
    let back = [keys[0]];
    back[1] = keys[7];
    back[2] = keys[9]+"m";
    back[3] = keys[5];
    back[5] = keys[4]+"m";
    back[4] = keys[2]+"m";
    back[6] = "";
    back[7] = "";
    back[8] = "";
    back[9] = "N.C.";

    const quickchords = document.querySelectorAll("#equicknotes label input[type=text]");
    for (let i = 0; i < 10; i++) {
        quickchords[i].placeholder = back[i];
    }
}
async function setLoading(to = true) {
    LoadThresholdStamp = Date.now();
    if (to) {
        await sleep(150);
        if(Date.now() < LoadThresholdStamp + 140) {return;}
        loader.style.display = 'flex';
    } else {
        loader.style.display = 'none';
    }
}

async function removeUninteresting() {
    setLoading(true);
    let roledata = [0,0,0];
    fetch('API/sql.php?roles=true')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            let res;
            res = response.json();
            //console.log(res);
            return res;
        })
        .then(data => {
            roledata = data;
            //console.log(roledata);

            document.querySelectorAll(".editor").forEach(button => {
                if(parseInt(data[1]) < 1) {button.setAttribute("style", "display:none;");}
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
    setLoading(false);
}

function setChordAtCursor(chord="") {
    const sel = window.getSelection();

    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    range.deleteContents(); // remove selected text if any

    // Create a text node with your text
    const left = document.createTextNode("["+chord);
    const right = document.createTextNode("]");

    range.insertNode(left);
    range.setStartAfter(left);
    range.setEndAfter(left);
    range.insertNode(right);

    if(!chord) {
        range.setStartAfter(left);
        range.setEndBefore(right);
    }
    if(chord) {
        range.setStartAfter(right);
        range.setEndAfter(right);
    }

    // Apply the updated range to the selection
    sel.removeAllRanges();
    sel.addRange(range);
}

function setViewer() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ref=`);
    if (parts.length >= 2) {
        viewer = parts.pop().split(';').shift();
    }
}

function setWindow(windo) {
    current_window = windo;
    if(windo==="list") {screenbar.style.left = "0";}
    if(windo==="chords") {screenbar.style.left = "-100vw";}
    if(["add", "edit"].includes(windo)) {screenbar.style.left = "-200vw";}
}

function grab(song = '') {
    setLoading(true);
    // Define the API URL
    let apiUrl = 'API/sql.php';
    if(song !== '') {apiUrl += '/?song=' + song}

    // Make a GET request
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            let res;
            res = response.json();
            //console.log(res);
            return res;
        })
        .then(data => {
            if(song === '') {
                data.sort();
                songlist.innerHTML = "";
                data.forEach(function(song){
                    const el = create_songnode(song)
                    songlist.appendChild(el);
                    //console.log(song);
                    el.addEventListener("click", () => {
                        grab(song[0])
                    })
                });

            } else {
                //console.log(data.parts);
                currentData = data;
                currentData.parts = JSON.parse(currentData.parts);
                currentData.commentMatrix = JSON.parse(currentData.commentMatrix);
                open_song();
            }
            setLoading(false);
            //console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function create_songnode(song) {
    const songnode = document.createElement("div");
    songnode.className = "songnode";
    songnode.setAttribute("data-search", song[2]);
    const link = document.createElement("button");
    link.className = "listbutton"
    songnode.appendChild(link);
    const songtitle = document.createElement("h5");
    songtitle.className = "song-title";
    link.appendChild(songtitle);
    const title = document.createTextNode(song[0]);
    songtitle.appendChild(title);
    const songauthor = document.createElement("h6");
    songauthor.className = "song-author";
    link.appendChild(songauthor);
    const author = document.createTextNode(song[1]);
    songauthor.appendChild(author);


    return songnode;
}

function search() {
    dynamic_text(dynamicsearch);
    //implementing search behavior
    var current_text = document.getElementById('searchv').value.toLowerCase()
        .replaceAll('ü', 'u').replaceAll('ä', 'a').replaceAll('ö', 'o').replaceAll('ß', 's');
    songlist.childNodes.forEach(function(listNode){
        if(listNode.toString() !== '[object Text]') {
            if(listNode.getAttribute("data-search").includes(current_text)) {
                listNode.style.display = "block";
            } else {
                listNode.style.display = "none";
            }}
    });
}

function open_song() {
    displayedKey = currentData.key % 12;
    actualKey = currentData.key % 12;
    capopos = 0;

    //clear current body
    document.getElementById('sauth').innerHTML = '';
    document.getElementById('stitle').innerHTML = '';
    document.getElementById('saltt').innerHTML = '';
    document.getElementById('scapo').innerHTML = 'Capo:&nbsp;&nbsp;&nbsp;0'
    const body = document.getElementById('sbody');
    if(body !== null) {body.remove();}

    //console.log("Song: " + currentData.name + ", Key: " + currentData.key + ", KeyShift: " + currentData.KeyShift + ", Capo: " + currentData.Capo);
    document.getElementById('sauth').appendChild(document.createTextNode(currentData.author));
    document.getElementById('stitle').appendChild(document.createTextNode(currentData.name));
    document.getElementById('saltt').appendChild(document.createTextNode(currentData.subTitle));
    generate_body(currentData.parts, currentData.commentMatrix);
    transpose(currentData.KeyShift);
    if(currentData.Capo !== 0) {transpose(12-(currentData.Capo % 12), true);}
    zoom(0);
    scrollspeed = calc_AV_speed(document.getElementById('chordScreen'));

    setWindow("chords");
}

async function back_to_list() {
    autoscrollvar = false;
    setWindow("list");

    await sleep(1000);

    document.getElementById('sauth').innerHTML = '';
    document.getElementById('stitle').innerHTML = '';
    document.getElementById('saltt').innerHTML = '';
    const body = document.getElementById('sbody');
    if(body !== null) {body.remove();}
}

function open_editor() {
    var editor = document.getElementById('editScreen');
    editor.style.left = '0';

    if(current_window === "chords") {
        setWindow("edit");

        document.getElementById('eauth').value = currentData.author;
        document.getElementById('etitle').value = currentData.name;
        document.getElementById('ealtt').value = currentData.subTitle;
        document.getElementById('ecopyr').value = currentData.Copyright;
        document.getElementById('ekey').value = currentData.key;
        document.getElementById('ekeyshift').value = currentData.KeyShift;
        document.getElementById('ecapo').value = currentData.Capo;
        setDefQuickChords(currentData.key);
        generate_editor_body();
    } else if(current_window === "list") {
        setWindow("add");
        document.getElementById('eauth').value = '';
        document.getElementById('etitle').value = '';
        document.getElementById('ealtt').value = '';
        document.getElementById('ecopyr').value = '';
        document.getElementById('ekey').value = 0;
        document.getElementById('ekeyshift').value = 0;
        document.getElementById('ecapo').value = 0;
        setDefQuickChords(0);
        let ebody = document.getElementById('ebody');
        ebody.innerHTML = `<div class="epart" data-id="0">                   
                                <div class="hstack">
                                    <div class="vstack buttonvstack">
                                        <div class="chordbutton moveup" data-id="0">
                                            <div class="cbcon">^</div>
                                        </div>
                                        <div class="chordbutton movegone" data-id="0">
                                            <div class="cbcon">X</div>
                                        </div>
                                        <div class="chordbutton movedown" data-id="0">
                                            <div class="cbcon">v</div>
                                        </div>
                                    </div>
                                    <div class="vstack textvstack">                           
                                        <div class="ebptitle" contenteditable="true"></div>
                                        <div class="ebpcontent" contenteditable="true"></div>
                                    </div>                   
                                </div>
                            </div>`;
        let moveup = ebody.querySelector('.moveup');
        let movegone = ebody.querySelector('.movegone');
        let movedown = ebody.querySelector('.movedown');
        moveup.addEventListener('click', () => nodeswitch(parseInt(moveup.dataset.id)));
        movegone.addEventListener('click', () => rem_epart(parseInt(movegone.dataset.id)));
        movedown.addEventListener('click', () => nodeswitch(parseInt(movedown.dataset.id) + 1));
        editor_len = 1;
    }
    document.getElementById("savebut").addEventListener("click", save_song);
    document.getElementById("discardbut").addEventListener("click", discard_song);
    document.getElementById("extendbut").addEventListener("click", add_epart);
    document.getElementById("deletebut").addEventListener("click", remove_song);
    editortextinputs.forEach(inp => {
        dynamic_text(inp);
    })
}

function generate_editor_body() {
    let editor_stage = currentData.parts;
    editor_len = editor_stage.length;
    editor_comments = currentData.commentMatrix;

    let innerhtmlstring="";

    for(let i = 0; i < editor_stage.length; i++) {
        innerhtmlstring += `<div class="epart" data-id="${i}">                   
                                <div class="hstack">
                                    <div class="vstack buttonvstack">
                                        <div class="chordbutton moveup" data-id="${i}">
                                            <div class="cbcon">^</div>
                                        </div>
                                        <div class="chordbutton movegone" data-id="${i}">
                                            <div class="cbcon">X</div>
                                        </div>
                                        <div class="chordbutton movedown" data-id="${i}">
                                            <div class="cbcon">v</div>
                                        </div>
                                    </div>
                                    <div class="vstack textvstack">                           
                                        <div class="ebptitle" contenteditable="true">${editor_stage[i][0]}</div>
                                        <div class="ebpcontent" contenteditable="true">${prepare_textarea(editor_stage[i][1])}</div>
                                    </div>                   
                                </div>
                            </div>`;
    }

    document.getElementById('ebody').innerHTML = innerhtmlstring;

    document.querySelectorAll('.moveup').forEach(function(moveup) {
        moveup.addEventListener('click', () => nodeswitch(parseInt(moveup.dataset.id)));
    });
    document.querySelectorAll('.movegone').forEach(function(movegone) {
        movegone.addEventListener('click', () => rem_epart(parseInt(movegone.dataset.id)));
    });
    document.querySelectorAll('.movedown').forEach(function(movedown) {
        movedown.addEventListener('click', () => nodeswitch(parseInt(movedown.dataset.id) + 1));
    });
}

function nodeswitch(id) {
    /* id = id of the new first el: nodeswitch(1) switches the 0 and the 1 el */
    //filter invalid cases
    if(id===0) {console.log("cannot move first up"); return;}
    if(id===editor_len) {console.log("cannot move last down"); return;}

    const parent = document.getElementById('ebody');
    const oldfirst = parent.querySelector(`[data-id="${id-1}"]`);
    const newfirst = parent.querySelector(`[data-id="${id}"]`);

    //displayed values
    parent.insertBefore(newfirst, oldfirst);
    oldfirst.dataset.id = id;
    oldfirst.querySelector('.moveup').dataset.id = id;
    oldfirst.querySelector('.movedown').dataset.id = id;
    oldfirst.querySelector('.movegone').dataset.id = id;
    newfirst.dataset.id = id-1;
    newfirst.querySelector('.moveup').dataset.id = id-1;
    newfirst.querySelector('.movedown').dataset.id = id-1;
    newfirst.querySelector('.movegone').dataset.id = id-1;
}

function add_epart() {
    const new_epart = document.createElement('div');
    const new_id = document.querySelectorAll(".epart").length;
    new_epart.classList.add('epart');
    new_epart.setAttribute("data-id", String(new_id));
    new_epart.innerHTML = `<div class="hstack">
                                    <div class="vstack buttonvstack">
                                        <div class="chordbutton moveup" data-id="${new_id}">
                                            <div class="cbcon">^</div>
                                        </div>
                                        <div class="chordbutton movegone" data-id="${new_id}">
                                            <div class="cbcon">X</div>
                                        </div>
                                        <div class="chordbutton movedown" data-id="${new_id}">
                                            <div class="cbcon">v</div>
                                        </div>
                                    </div>
                                    <div class="vstack textvstack">                           
                                        <div class="ebptitle" contenteditable="true"></div>
                                        <div class="ebpcontent" contenteditable="true"></div>
                                    </div>                   
                                </div>`;
    document.getElementById('ebody').appendChild(new_epart);
    let moveup = new_epart.querySelector('.moveup');
    let movegone = new_epart.querySelector('.movegone');
    let movedown = new_epart.querySelector('.movedown');
    moveup.addEventListener('click', () => nodeswitch(parseInt(moveup.dataset.id)));
    movegone.addEventListener('click', () => rem_epart(parseInt(movegone.dataset.id)));
    movedown.addEventListener('click', () => nodeswitch(parseInt(movedown.dataset.id) + 1));
    editor_len++;
}

function rem_epart(id) {
    for (const epart of document.querySelectorAll('.epart')) {
        if (parseInt(epart.dataset.id) < id) {
        } else if(parseInt(epart.dataset.id) === id) {
            epart.remove();
            editor_len--;
        } else {
            let new_id = parseInt(epart.dataset.id)-1;
            epart.setAttribute("data-id", new_id);
            [epart.querySelector('.moveup'), epart.querySelector('.movedown'), epart.querySelector('.movegone')].forEach(fn => {
                fn.setAttribute("data-id", new_id);
            });
        }
    }
}

function prepare_textarea(text) {
    let returnsting = ""
    let lines = text.split('\n');
    for(let i = 0; i < lines.length; i++) {
        returnsting += "<div>" + lines[i] + "</div>";
    }
    return returnsting;
}

async function save_song() {
    setLoading(true);
    //setup vars for the api
    let apiUrl = 'API/sql.php';
    let data = {}
    let parts = []

    //build my songmatrix
    for (let i = 0; i < editor_len; i++) {
        let parttuple = [];
        let texts = document.querySelector(`.epart[data-id="${i}"] .hstack .textvstack`);

        const ptitle = texts.querySelector('.ebptitle').textContent;
        const pcontent2 = texts.querySelector('.ebpcontent');
        let pcontenta = recursive_line_breaker(pcontent2);
        let pcontents = "";
        pcontenta.forEach(line => {
            if(line==="") {line=" ";}
            pcontents = pcontents + "\n" + line;
        });
        pcontents = pcontents.replace("\n", "");
        pcontents = pcontents.replaceAll("&nbsp;\n", "\n");
        pcontents = pcontents.replaceAll("&nbsp;", " ");

        parttuple.push(ptitle);
        parttuple.push(pcontents);
        if(ptitle && pcontents) {
            parts.push(parttuple);
        }
    }

    //create deepsearch string
    const etitle = document.querySelector('#etitle').value;
    const ealtt = document.querySelector('#ealtt').value;
    const eauth = document.querySelector('#eauth').value;
    const ecopyr = document.querySelector('#ecopyr').value;
    const verselines = (parts.find(d => ["Verse", "Verse 1", "Strophe", "Strophe 1"].includes(d[0])) || ["", ""])[1].slice(0, 40);
    const choruslines = (parts.find(d => ["Chorus", "Refrain"].includes(d[0])) || ["", ""])[1].slice(0, 40);
    let deepsearch = etitle + "\n" + ealtt + "\n" + eauth + "\n" + verselines + "\n" + choruslines;
    deepsearch = deepsearch.toLowerCase()
        .replaceAll('ü', 'u').replaceAll('ä', 'a').replaceAll('ö', 'o').replaceAll('ß', 's')
        .replace(new RegExp("\\[.*?\\]", "g"), "");

    //file in the vars
    data.name = etitle;
    data.altt = ealtt;
    data.auth = eauth;
    data.copyr = ecopyr
    data.key = document.querySelector('#ekey').value;
    data.keyshift = document.querySelector('#ekeyshift').value;
    data.capo = document.querySelector('#ecapo').value;
    data.parts = JSON.stringify(parts);
    data.deepsearch = deepsearch;
    if(current_window === "edit") {
        data.action = "edit";
        data.id = currentData["Id"];
    } else if(current_window === "add") {
        data.action = "add";
    }

    //console.log(data);
    //console.log(currentData);

    //fetch
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",  // tell server it's JSON
            },
            body: JSON.stringify(data),            // convert JS object to JSON
        });

        /*if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }*/

        //console.log(await response.text());
    } catch (error) {
        console.error("POST request failed:", error);
    }

    if(current_window === "add") {grab();}
    else {grab(data.name);}
    setWindow("chords")
    setLoading(false);
}

function recursive_line_breaker(parent) {
    let nodelist = [];
    for (let i=0; i<parent.childNodes.length; i++) {
        let node = parent.childNodes[i];
        if(node.children && node.children.length > 0) {
            nodelist = [...nodelist, ...recursive_line_breaker(node)];
        } else {
            nodelist.push(node.textContent);
        }
    }
    return nodelist;
}

async function remove_song() {
    setLoading(true)
    let apiUrl = 'API/sql.php';
    let data = {}
    data.action = "delete";
    data.id = currentData["Id"];
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",  // tell server it's JSON
            },
            body: JSON.stringify(data),            // convert JS object to JSON
        });

        /*if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }*/

        //console.log(await response.text());
    } catch (error) {
        console.error("POST request failed:", error);
    }

    grab();
    document.getElementById('editScreen').style.left = '100vw';
    await back_to_list();
    setLoading(false);
}

function discard_song() {
    document.getElementById('editScreen').style.left = '100vw';
    if(current_window === "edit") {
        setWindow("chords")
    } else if(current_window === "add") {
        setWindow("list");
    }
}

function generate_body(parts, commentMatrix) {
    //console.log(content);
    const body = document.createElement('div');
    body.id = "sbody";

    //console.log(parts);

    for(let i = 0; i < parts.length; i++) {
        const ppart = document.createElement('div');
        ppart.className = 'ppart';
        const ptitle = document.createElement('h4');
        ptitle.className = 'ptitle';
        ptitle.appendChild(document.createTextNode(parts[i][0]));
        ppart.appendChild(ptitle);

        //console.log(parts[i]);

        let lines = parts[i][1].split('\n');

        if(commentMatrix && commentMatrix[viewer] && commentMatrix[viewer][String(i)]) {
            let comms = commentMatrix[viewer][String(i)];
            if(comms) {
                for(let ii = 0; ii < comms.length; ii++) {
                    lines.splice(comms[ii][0], 0, "(" + comms[ii][1] + ")");
                }
            }
        }

        //console.log(lines);

        let tmkillsinsts = false;
        if(textmode === 1) {
            for(let ii = 0; ii < lines.length; ii++) {
                if(lines[ii].charAt(0) === '(' && lines[ii].charAt(lines[ii].length - 1) === ')') {
                    lines[ii] = "";
                    continue;
                }
                let mini_array = partseperator(lines[ii], "[", "]");
                mini_array.shift();
                if(mini_array.length === 1 && mini_array[0] === '') {
                    continue;
                }
                let linestr = "";
                for(let iii = 0; iii < mini_array.length; iii+=2) {
                    linestr += mini_array[iii];
                }
                if(linestr !== '') {tmkillsinsts = true;}
                lines[ii] = linestr;
            }
        }

        //console.log(lines);

        var hasnochords = parts[i][1].replace('[', '') === parts[i][1];
        var hasnotabs = parts[i][1].replace('{sot}', '') === parts[i][1];
        var tablines = false;
        if(hasnochords && hasnotabs || textmode === 1) {
            for(let ii = 0; ii < lines.length; ii++) {
                if(lines[ii] === "{sot}") {tablines = true;}
                else if(lines[ii] === "{eot}") {tablines = false; continue;}
                const pline = document.createElement('div');
                pline.className = "pline";
                const plinet = document.createElement('p');
                plinet.className = 'microtext';
                plinet.textContent = lines[ii];
                pline.appendChild(plinet);
                if((tmkillsinsts || hasnochords) && !tablines && lines[ii]) {ppart.appendChild(pline);}
            }
            body.appendChild(ppart);
            continue;
        }

        lines.forEach(function (line) { //linebuilder
            if(!hasnotabs) {
                if (line === "{sot}") {
                    tablines = true;
                    const emline = document.createElement('div');
                    emline.className = "tline emline";
                    ppart.appendChild(emline);
                    return;
                } else if (line === "{eot}") {
                    const emline = document.createElement('div');
                    emline.className = "tline emline";
                    ppart.appendChild(emline);
                    tablines = false;
                    return;
                }
                if (tablines) {
                    const tline = document.createElement('div');
                    tline.className = "tline";
                    const tlinet = document.createElement('p');
                    tlinet.className = 'tab';
                    tlinet.textContent = line;
                    tline.appendChild(tlinet);
                    ppart.appendChild(tline);
                    return;
                }
            }

            //COMMENT LINE
            if(line.charAt(0) === '(' && line.charAt(line.length - 1) === ')') {
                const pline = document.createElement('div');
                pline.className = "pline";
                const plinet = document.createElement('p');
                plinet.className = 'microtext comment';
                plinet.innerHTML = line.substring(1, line.length - 1)
                    .replaceAll('[', '<span class="commentChord">')
                    .replaceAll(']', '</span>');
                pline.appendChild(plinet);
                ppart.appendChild(pline);
                return;
            }

            //TEXT LINE
            if(line.replace("[", "") === line) {
                const pline = document.createElement('div');
                pline.className = "pline textpline";
                const plinet = document.createElement('p');
                plinet.className = 'microtext textline';
                plinet.textContent = line;
                pline.appendChild(plinet);
                ppart.appendChild(pline);
                return;
            }

            //CHORDLINE
            if(line.replace(new RegExp("\\[.*?\\]", "g"), "") === "") {
                const pline = document.createElement('div');
                pline.className = "pline";
                let chordarr = Array.from(line.matchAll(/\[([^\]]+)\]/g), m => m[1]);
                for(let i=0; i<chordarr.length; i++) {
                    const chord = document.createElement('p');
                    chord.className = 'chord';
                    chord.textContent = chordarr[i];
                    pline.appendChild(chord);
                }
                ppart.appendChild(pline);
                return;
            }

            let struc_array = partseperator(line, "[", "]");
            struc_array.shift();
            if(struc_array.length === 1 && struc_array[0] === '') {
                return;
            }

            //console.log(struc_array);

            const p = document.createElement('div');
            p.className = 'pline';
            for(let ii = 0; ii < struc_array.length; ii+=2) {
                if(ii === 0 && struc_array[0] === '') {continue;}
                const block = document.createElement('div');
                if (struc_array[ii].charAt(struc_array[ii].length - 1) === ' ') {
                    block.className = "microblock spacebehind";
                } else {
                    block.className = "microblock";
                }
                const chord = document.createElement("p");
                chord.className = "chord";
                if(ii === 0) {chord.appendChild(document.createTextNode(''));}
                else {chord.appendChild(document.createTextNode(struc_array[ii-1]));}
                block.appendChild(chord);
                const text = document.createElement("p");
                if(struc_array[ii].charAt(0) === ' ') {
                    text.className = "microtext spacebefore";
                } else {
                    text.className = "microtext";
                }
                text.appendChild(document.createTextNode(struc_array[ii]));
                block.appendChild(text);
                p.appendChild(block);
            }
            ppart.appendChild(p);
        });

        if(!(ppart.childNodes.length === 1 && ppart.firstChild.textContent === "")) {
            body.appendChild(ppart);
        }
    }

    document.getElementById('scrollingchords').appendChild(body);
}

function partseperator(content, startv='{c: ', endv ='}') {
    /*content: the haystack | startv: opening Title Tag | endv: closing Title Tag //
    * returns an Array of all titles on even indices and content on odd ones //
    * example: partseperator("[A]Here [G]Goes", "[", "]") => ["A", "Here ", "G", "Goes"]*/
    let backarr = [];
    let f_ed_arr = content.split(startv);
    let hastitle = content.startsWith(startv);
    f_ed_arr.forEach(function(e) {
        let secttitle = "";
        if(hastitle) {
            secttitle = e.split(endv)[0];
        }
        let search = secttitle + endv;
        let seccon = e.replace(search, "");
        if(!hastitle) {
            backarr.push('');
            backarr.push(e);
        } else {
            backarr.push(secttitle);
            backarr.push(seccon);
        }
        hastitle = true;
    });
    return backarr;
}

async function zoom() {
    let scale = document.getElementById('ScaleIn').value;

    document.querySelectorAll('.pline').forEach(parag => {
        parag.style.fontSize = `${scale * 16}px`;
        parag.style.marginBottom = `${(1/(0.3*scale+0.7)) * 12.8}px`
    });
    document.querySelectorAll('h4').forEach(parag => {
        parag.style.fontSize = `${scale * 28.8}px`;
    });
    document.querySelectorAll('.microblock').forEach(parag => {
        parag.style.height = `${scale * 64}px`;
    });
    document.querySelectorAll('.spacebehind').forEach(parag => {
        parag.style.marginRight = `${scale * 7}px`;
    });
    document.querySelectorAll('.spacebefore').forEach(parag => {
        parag.style.paddingLeft = `${scale * 7}px`;
    });
    document.querySelectorAll('.tab').forEach(parag => {
        parag.style.fontSize = `${scale * 17.6}px`;
    });

    if(autoscrollvar) {
        await update_VA_speed()
    }
}

function transpose(keyShift, capotune = false) {
    let oldKeys = keyDict[displayedKey][1];
    displayedKey = (displayedKey + keyShift) % 12;
    if(!capotune) {actualKey = (actualKey + keyShift) % 12;}
    let newKeys = keyDict[displayedKey][1];

    document.getElementById('skey').textContent = 'Tonart: ' + keyDict[actualKey][0]/* + ` (${actualKey})`*/;
    if(capotune) {
        capopos = (capopos + (12 - keyShift)) % 12;
        if(capopos<=9) {
            document.getElementById('scapo').innerHTML = 'Capo:&nbsp;&nbsp;&nbsp;' + capopos;
        } else {
            document.getElementById('scapo').innerHTML = 'Capo:&nbsp;&nbsp;' + capopos;
        }

    }

    //console.log('OldKeys: ' + oldKeys + ", NewKeys: " + newKeys);

    if(keyShift === 0) {return;}

    document.querySelectorAll('.chord').forEach(e => {
        if(["N.C", "N.C."].includes(e.textContent)) {return;}
        let partial_e = e.textContent.split('/');
        let new_chord = "";
        if(oldKeys === Kreuzkey) {
            partial_e.forEach(c => {
                let i = 11;
                while (i >= 0) {
                    let new_exp = c.replaceAll(oldKeys[i], newKeys[(i + keyShift) % 12]);
                    if(new_exp !== c) {
                        new_chord += "/" + new_exp;
                        return;
                    }
                    i = i - 1;
                }
            });
        } else {
            partial_e.forEach(c => {
                let i = 1;
                while (i<=12) {
                    let new_exp = c.replaceAll(oldKeys[i%12], newKeys[(i + keyShift) % 12]);
                    if(new_exp !== c) {
                        new_chord += "/" + new_exp;
                        return;
                    }
                    i++;
                }
            });
        }
        new_chord = new_chord.replace("/", "");
        e.textContent = new_chord;
    });
}

async function flip_textmode() {
    document.getElementById('sauth').innerHTML = '';
    document.getElementById('stitle').innerHTML = '';
    document.getElementById('saltt').innerHTML = '';
    const body = document.getElementById('sbody');
    if(body !== null) {body.remove();}

    textmode *= -1;
    open_song();

    if(autoscrollvar) {await update_VA_speed();}
}

function flip_darkmode() {
    const palette = document.getElementById('palette');
        if(palette.href.replace("palette-light.css", "") !== palette.href) {
            palette.href = "colors/palette-dark.css";
        } else {
            palette.href = "colors/palette-light.css";
        }
}

function set_palette(value) {
    const palette = document.getElementById('palette');
    if(palette.href.replace(value, "") === palette.href) {
        palette.href = value;
    } else {
        palette.href = "colors/palette-light.css"
    }

}

async function fullscreen() {
    if (full) {
        closeFullscreen();
    } else {
        openFullscreen();
    }
}

function openFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

function closeFullscreen() {
    const elem = document/*.documentElement*/;
    if (elem.exitFullscreen) {
        elem.exitFullscreen();
    } else if (elem.webkitExitFullscreen) { /* Safari */
        elem.webkitExitFullscreen();
    } else if (elem.msExitFullscreen) { /* IE11 */
        elem.msExitFullscreen();
    }
}

function autoscroll() {
    if(autoscrollvar) {
        autoscrollvar = false;
    } else {
        autoscrollvar = true;
        init_autoscroll(document.getElementById('chordScreen'), 5);
    }
}

function init_autoscroll() {
    const autoScrollDiv = document.getElementById('chordScreen');
    //console.log('scrollspeedauto', scrollspeed);

    const interval = setInterval(() => {
        autoScrollDiv.scrollTo({top: autoScrollDiv.scrollTop+1, behavior: "instant"});

        // Stop scrolling if we reach the bottom
        if (autoScrollDiv.scrollTop >= autoScrollDiv.scrollHeight - autoScrollDiv.clientHeight) {
            clearInterval(interval);
        }
        if (!autoscrollvar) {
            clearInterval(interval);
        }
    }, scrollspeed);
}

function calc_AV_speed(autoScrollDiv = scrollSect) {
    let s = autoScrollDiv.scrollHeight - autoScrollDiv.clientHeight;
    let t = currentData.Duration;
    let setspeed = 1000/parseInt(scrollinput.value);
    if(setspeed !== defscrollspeed || t===0) {
        return setspeed;
    }
    return Math.round((t * 1000) / s);
}

async function update_VA_speed() {
    AVThresholdStamp = Date.now()
    autoscrollvar = false;
    await sleep(150);
    if(Date.now() - 140 < AVThresholdStamp) {return;}
    scrollspeed = calc_AV_speed();
    autoscrollvar = true;
    init_autoscroll();
}

/*
["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "msfullscreenchange"].forEach(
    eventType => document.addEventListener(eventType, async function () {
        if (full) {
            if (wakeLock != null) {wakeLock.release();}
            full = false;
            console.log("closed")
        } else {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log(wakeLock)
            } catch {
                console.log("no wakelock");
            }
            full = true;
            console.log("opened")
        }
    }, false)
);*/