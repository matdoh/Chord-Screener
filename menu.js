//Global Vars
const dynamicsearch = document.getElementById('searchv');
const scrollinput = document.getElementById('AVSpeedIn');
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
const defscrolltime = 180;
var scale = 1.0;
var displayedKey = null;
var actualKey = null;
var capopos = 0;
var textmode = -1;
var currentData;
var full = false;
var autoscrollvar = false;
var scrollspeed = 0;

//Initialize Site
grab();
dynamicsearch.addEventListener('input', search);
scrollinput.addEventListener('input', update_VA_speed);
scaleinput.addEventListener('input', zoom)
search();

//Funcs
function grab(song = '') {
    // Define the API URL
    let apiUrl = 'API/songbook.php';
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
                    songlist.appendChild(create_songnode(song));
                });
            } else {
                console.log(data);
                currentData = data;
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
    link.setAttribute('onclick', `grab(\'${song[0]}\')`);
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
    // Temporarily create a span element to measure text width
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'pre';
    tempSpan.textContent = dynamicsearch.value || dynamicsearch.placeholder;

    // Copy font properties from input to span to ensure consistent measurement
    const inputStyles = window.getComputedStyle(dynamicsearch);
    tempSpan.style.font = inputStyles.font;

    document.body.appendChild(tempSpan);

    // Adjust the input width based on the span's width
    dynamicsearch.style.width = (tempSpan.offsetWidth + 10) + 'px';

    document.body.removeChild(tempSpan);

    //implementing search behavior
    var current_text = document.getElementById('searchv').value.toLowerCase()
        .replaceAll('ü', 'u').replaceAll('ä', 'a').replaceAll('ö', 'o').replaceAll('ß', 's');
    //console.log(songlist.childNodes);
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
    //console.log("Song: " + data.name + ", Key: " + data.key + ", Capo: " + data.Capo);
    document.getElementById('sauth').appendChild(document.createTextNode(currentData.author));
    document.getElementById('stitle').appendChild(document.createTextNode(currentData.name));
    document.getElementById('saltt').appendChild(document.createTextNode(currentData.subTitle));
    generate_body(currentData.content);
    transpose(currentData.KeyShift);
    if(currentData.Capo !== 0) {transpose(12-(currentData.Capo % 12), true);}
    zoom(0);
    scrollspeed = calc_AV_speed(document.getElementById('chordScreen'));

    document.getElementById('listScreen').style.left = '-100vw';
    document.getElementById('chordScreen').style.left = '0';
}

async function back_to_list() {
    autoscrollvar = false;
    document.getElementById('listScreen').style.left = '0';
    document.getElementById('chordScreen').style.left = '100vw';

    await sleep(1000);

    document.getElementById('sauth').innerHTML = '';
    document.getElementById('stitle').innerHTML = '';
    document.getElementById('saltt').innerHTML = '';
    const body = document.getElementById('sbody');
    if(body !== null) {body.remove();}
}

function generate_body(content) {
    //console.log(content);
    const body = document.createElement('div');
    body.id = "sbody";

    let parts = partseperator(content);

    //console.log(parts);

    for(let i = 0; i < parts.length; i+=2) {
        const ppart = document.createElement('div');
        ppart.className = 'ppart';
        const ptitle = document.createElement('h4');
        ptitle.className = 'ptitle';
        ptitle.appendChild(document.createTextNode(parts[i]));
        ppart.appendChild(ptitle);

        let lines = parts[i+1].split('\n');

        //console.log('here');

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

        var hasnochords = parts[i+1].replace('[', '') === parts[i+1];
        var hasnotabs = parts[i+1].replace('{sot}', '') === parts[i+1];
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
                if(tmkillsinsts && !tablines && lines[ii]) {ppart.appendChild(pline);}
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
                plinet.textContent = line.substring(1, line.length - 1);
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
    backarr = [];
    f_ed_arr = content.split(startv);
    /*if(f_ed_arr[0] === content) {
        backarr.push('');
        backarr.push(f_ed_arr[0]);
        return backarr;
    }*/
    f_ed_arr.forEach(function(e) {
        let secttitle = e.split(endv)[0];
        let search = secttitle + endv;
        let seccon = e.replace(search, "");
        if(secttitle === seccon) {
            backarr.push('');
        } else {
            backarr.push(secttitle);
        }
        backarr.push(seccon);
    });
    return backarr;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function zoom() {
    let scale = document.getElementById('ScaleIn').value;

    document.querySelectorAll('.pline').forEach(parag => {
        parag.style.fontSize = `${scale * 16}px`;
        parag.style.marginBottom = `${(1/scale) * 12.8}px`
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
            palette.href = "palette-dark.css";
        } else {
            palette.href = "palette-light.css";
        }
}

function set_palette(value) {
    const palette = document.getElementById('palette');
    if(palette.href.replace(value, "") === palette.href) {
        palette.href = value;
    } else {
        palette.href = "palette-light.css"
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

function calc_AV_speed(autoScrollDiv) {
    let s = autoScrollDiv.scrollHeight - autoScrollDiv.clientHeight;
    let t = currentData.Duration;
    let settime = parseInt(scrollinput.value);
    if(t===0) {t=defscrolltime;}
    if(settime !== defscrolltime) {
        t = settime;
    }
    return Math.round((t * 1000) / s);
}

async function update_VA_speed() {
    scrollspeed = calc_AV_speed(document.getElementById('chordScreen'));
    autoscrollvar = false;
    await sleep(150);
    autoscrollvar = true;
    init_autoscroll();
}

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