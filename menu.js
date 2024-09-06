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
    let apiUrl = 'API/index.php/sb';
    if(song !== '') {apiUrl += '/?song=' + song}

    // Make a GET request
    fetch(apiUrl)
        .then(response => {
            console.log(response);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data.sort();
            console.log(data[0]); // Log the data to the console
            // Display the data on a web page
            data.forEach(function(song){
                songlist.appendChild(create_songnode(song));
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function create_songnode(song) {
    const songnode = document.createElement("div");
    songnode.className = "songnode";
    songnode.setAttribute("data-search", song[2]);
    const link = document.createElement("a");
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
    console.log(songlist.childNodes);
    songlist.childNodes.forEach(function(listNode){
        if(listNode.toString() !== '[object Text]') {
            if(listNode.getAttribute("data-search").includes(current_text)) {
                listNode.style.display = "block";
            } else {
                listNode.style.display = "none";
            }}
    });
}