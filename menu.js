//imports
import {dynamic_text, sleep} from "./inc/utils.js";

//Global Vars
const dynamicsearch = document.getElementById('searchv');
const scrollinput = document.getElementById('AVSpeedSlide');
const scrollSect = document.getElementById('chordScreen')
const editSect = document.getElementById('editScreen')
const scaleinput = document.getElementById('ScaleIn');
const songlist = document.getElementById('songlist');
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
var viewer = "";
var displayedKey = null;
var actualKey = null;
var capopos = 0;
var textmode = -1;
var currentData;
var full = false;
var autoscrollvar = false;
var AVThresholdStamp = 0;
var GuestureThresholdStamp = 0;
var scrollspeed = 0;
var current_window = "list"; // "chords", "edit", "add"

//INITIALIZE SITE
//Start-functions
setViewer();
grab();
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

//Funcs
function setViewer() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ref=`);
    if (parts.length >= 2) {
        viewer = parts.pop().split(';').shift();
    }
}
function grab(song = '') {
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
                data.forEach(function(song){
                    const el = create_songnode(song)
                    songlist.appendChild(el);
                    el.addEventListener("click", () => {
                        grab(song[0])
                    })
                });
            } else {
                console.log(data.parts);
                currentData = data;
                currentData.parts = JSON.parse(currentData.parts);
                currentData.commentMatrix = JSON.parse(currentData.commentMatrix);
                open_song();
            }
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
    console.log("Song: " + currentData.name + ", Key: " + currentData.key + ", KeyShift: " + currentData.KeyShift + ", Capo: " + currentData.Capo);
    document.getElementById('sauth').appendChild(document.createTextNode(currentData.author));
    document.getElementById('stitle').appendChild(document.createTextNode(currentData.name));
    document.getElementById('saltt').appendChild(document.createTextNode(currentData.subTitle));
    generate_body(currentData.parts, currentData.commentMatrix);
    transpose(currentData.KeyShift);
    if(currentData.Capo !== 0) {transpose(12-(currentData.Capo % 12), true);}
    zoom(0);
    scrollspeed = calc_AV_speed(document.getElementById('chordScreen'));

    document.getElementById('listScreen').style.left = '-100vw';
    document.getElementById('chordScreen').style.left = '0';
    current_window = "chords"
}

async function back_to_list() {
    autoscrollvar = false;
    document.getElementById('listScreen').style.left = '0';
    document.getElementById('chordScreen').style.left = '100vw';
    current_window = "list"

    await sleep(1000);

    document.getElementById('sauth').innerHTML = '';
    document.getElementById('stitle').innerHTML = '';
    document.getElementById('saltt').innerHTML = '';
    const body = document.getElementById('sbody');
    if(body !== null) {body.remove();}
}

function open_editor() {
    var editor = document.getElementById('editScreen');
    /*editor.style.display = 'block';*/
    editor.style.left = '0';

    if(current_window === "chords") {
        document.getElementById('chordScreen').style.left = '-100vw';
        current_window = "edit";

        document.getElementById('eauth').value = currentData.author;
        document.getElementById('etitle').value = currentData.name;
        document.getElementById('ealtt').value = currentData.subTitle;
        document.getElementById('ekey').value = currentData.key;
        document.getElementById('ekeyshift').value = currentData.KeyShift;
        document.getElementById('ecapo').value = currentData.Capo;
    } else if(current_window === "list") {
        document.getElementById('listScreen').style.left = '-100vw';
        current_window = "add";
        document.getElementById('eauth').value = '';
        document.getElementById('etitle').value = '';
        document.getElementById('ealtt').value = '';
        document.getElementById('ekey').value = 0;
        document.getElementById('ekeyshift').value = 0;
        document.getElementById('ecapo').value = 0;
    }
    document.getElementById("savebut").addEventListener("click", save_song);
    document.getElementById("discardbut").addEventListener("click", discard_song);
}
function save_song() {}
function discard_song() {
    document.getElementById('editScreen').style.left = '100vw';
    if(current_window === "edit") {
        document.getElementById('chordScreen').style.left = '0';
        current_window = "chords";
    } else if(current_window === "add") {
        document.getElementById('listScreen').style.left = '0';
        current_window = "list";
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

        let comms = commentMatrix[viewer][String(i)];
        if(comms) {
            for(let ii = 0; ii < comms.length; ii++) {
                lines.splice(comms[ii][0], 0, "(" + comms[ii][1] + ")");
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
                    tlinet.textContent = line/*.substring(1, line.length - 1)*/;
                    tline.appendChild(tlinet);
                    ppart.appendChild(tline);
                    return;
                }
            }

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
                /*TODO: Check for space at the end of even el*/
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
    let backarr = [];
    let f_ed_arr = content.split(startv);
    /*if(f_ed_arr[0] === content) {
        backarr.push('');
        backarr.push(f_ed_arr[0]);
        return backarr;
    }*/
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
        parag.style.marginBottom = `${(1/(0.5*scale+0.5)) * 12.8}px`
    });
    document.querySelectorAll('h4').forEach(parag => {
        parag.style.fontSize = `${scale * 28.8}px`;
    });
    document.querySelectorAll('.microblock').forEach(parag => {
        parag.style.height = `${(1.2 * scale - 0.2) * 64}px`;
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
        document.getElementById('scapo').innerHTML = 'Capo:&nbsp;&nbsp;&nbsp;' + capopos;
    }

    //console.log('OldKeys: ' + oldKeys + ", NewKeys: " + newKeys);

    if(keyShift === 0) {return;}

    document.querySelectorAll('.chord').forEach(e => {
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
    console.log('before fullscreen(): ', full);
    if (full) {
        closeFullscreen();
    } else {
        openFullscreen();
    }
    console.log('after fullscreen(): ', full);
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
    console.log('here1');
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

//TODO:
function startAutoScroll(element, pixelsPerSecond) {
    let lastTimestamp = 0; // Keep track of the last timestamp for smooth animation
    let accumulatedDistance = 0; // Accumulates fractional scroll distances

    function smoothScroll(timestamp) {
        if (lastTimestamp) {
            // Calculate time elapsed between frames in seconds
            const elapsed = (timestamp - lastTimestamp) / 1000;

            // Calculate how many pixels to scroll this frame
            accumulatedDistance += pixelsPerSecond * elapsed;

            // Scroll only full pixels and accumulate fractional scroll values
            const scrollAmount = Math.floor(accumulatedDistance);
            if (scrollAmount > 0) {
                element.scrollTop += scrollAmount;
                accumulatedDistance -= scrollAmount; // Subtract scrolled distance from accumulator
            }
        }

        lastTimestamp = timestamp;

        let stopper = false;
        // Abbruchbedingungen
        if (element.scrollTop >= element.scrollHeight - element.clientHeight) {
            stopper = true;
        }
        if (!autoscrollvar) {
            stopper = true;
        }

        if (!stopper) {
            requestAnimationFrame(smoothScroll);
        } // Continue scrolling
    }

    // Start the scrolling animation
    requestAnimationFrame(smoothScroll);
}

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
);