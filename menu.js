//Global Vars
const dynamicsearch = document.getElementById('searchv')
const songlist = document.getElementById('songlist');

//Initialize Site
grab();
dynamicsearch.addEventListener('input', search);
search();

//Funcs
function grab(song = '') {
    // Define the API URL
    let apiUrl = 'API/songbook.php';
    if(song !== '') {apiUrl += '/?song=' + song}

    // Make a GET request
    fetch(apiUrl)
        .then(response => {
            //console.log(response);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if(song === '') {
                data.sort();
                data.forEach(function(song){
                    songlist.appendChild(create_songnode(song));
                });
            } else {
                //console.log('wow, just wow ' + data.author);
                open_song(data);
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

function open_song(data) {
    //console.log(data);
    document.getElementById('sauth').appendChild(document.createTextNode(data.author));
    document.getElementById('stitle').appendChild(document.createTextNode(data.name));
    generate_body(data.content);

    document.getElementById('listScreen').style.left = '-100vw';
    document.getElementById('chordScreen').style.left = '0';
}

async function back_to_list() {
    document.getElementById('listScreen').style.left = '0';
    document.getElementById('chordScreen').style.left = '100vw';

    await sleep(1000);

    document.getElementById('sauth').innerHTML = '';
    document.getElementById('stitle').innerHTML = '';
    const body = document.getElementById('sbody');
    if(body !== null) {body.remove();}
}

function generate_body(content) {
    //console.log(typeof content);
    const body = document.createElement('div');
    body.id = "sbody";
    const see_data = document.createTextNode(content);

    let parts = partseperator(content);

    console.log(parts);

    for(let i = 0; i < parts.length; i+=2) {
        const ppart = document.createElement('div');
        ppart.className = 'ppart';
        const ptitle = document.createElement('h4');
        ptitle.className = 'ptitle';
        ptitle.appendChild(document.createTextNode(parts[i]));
        ppart.appendChild(ptitle);

        let lines = parts[i+1].split('\n');
        lines.forEach(function (line) { //linebuilder
            struc_array = partseperator(line, "[", "]");
            struc_array.shift();
            if(struc_array.length === 1) {
                return;
            }

            console.log(struc_array);

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

        body.appendChild(ppart);
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
