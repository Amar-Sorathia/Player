let currentsong = new Audio();
let songs;
let currfolder;
async function getSongs(folder) {
    folder = folder.replace(" ", "%20");
    currfolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement('div')
    div.innerHTML = response;
    // let tds = div.getElementsByTagName('td');
    let as = div.getElementsByTagName('a');
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3") || element.href.endsWith(".ogg"))
            songs.push(element.href.split(`/${folder}/`)[1])
    }

    // get the list of all songs
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = "";
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `
        <li>
            <div class="info-info">
                <img class="filter" src="img/music.svg" alt="music">
                <div class="info">
                    <div> ${song.replaceAll("%20", " ")} </div>
                    <div>Artist</div>
                </div>
            </div>    
            <div class="albumbtn">
                <svg xmlns="http://www.w3.org/2000/svg" data-encore-id="icon" role="img"
                    aria-hidden="true" viewBox="0 0 24 24" class="Svg-sc-ytk21e-0 iYxpxA">
                    <path
                        d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                    </path>
                </svg>
            </div>
        </li> `;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector('.songlist').getElementsByTagName("li")).forEach(element => {
        // console.log(element.querySelector(".info").firstElementChild.innerHTML);
        element.addEventListener("click", e => {
            console.log(element.querySelector(".info").firstElementChild.innerHTML);
            playMusic(element.querySelector(".info").firstElementChild.innerHTML.trim())
        });
    });

    return songs;

}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

const playMusic = (track, pause = false) => {
    // track = track.trim();
    // let audio = new Audio();
    currentsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg";
    }
    // audio.play();
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = `00:00 / 00:00`
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    // console.log(div);
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            console.log(e.href.split("/").slice(-2)[1]);
            let folder = e.href.split("/").slice(-2)[1];

            // get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `         
        <div class="card rounded" data-folder="${folder}">
        <div class="play">
        <svg xmlns="http://www.w3.org/2000/svg" data-encore-id="icon" role="img" aria-hidden="true"
                viewBox="0 0 24 24" class="Svg-sc-ytk21e-0 iYxpxA">
                <path
                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                </path>
                </svg>
                </div>
                <img src="/songs/${folder}/coverpage.jpg"
                alt="dinner with friends">
                <h4>${response.title}</h4>
                <p>${response.description}</p>
                </div>`;

        }
    }

    // load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        // console.log(e);
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
        })
    });
}

async function main() {

    await getSongs("songs/cs")
    playMusic(songs[0], true)
    // console.log(songs);
    currentsong.volume = 0.3;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 30;
    // display all the albums on the page   
    displayAlbums()
    // attach an event to play or pause each song
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    });

    // listen for timeupdate event
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration);

        // to get update the background of the seekbar songinfo and songtime.
        const progressPercentage = (currentsong.currentTime / currentsong.duration) * 100;
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (progressPercentage) + "%";
        const gradientColor = `linear-gradient(to right, #1db954 0%, #1db954 ${progressPercentage}%, transparent ${progressPercentage}%, transparent 100%)`;
        document.querySelector(".seekbar").style.background = gradientColor;
    });

    // Add an event listener for seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        // console.log(e.target.getBoundingClientRect().width, e.offsetX);
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = currentsong.duration * percent / 100;
        // console.log(currentsong.currentTime);
    });

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        document.querySelector(".left").style.width = "95%";
        document.querySelector(".playbar").style.position = "fixed";
        document.querySelector(".playbar").style.bottom = "0px";
        document.querySelector(".spotifyPlaylist").style.opacity = "0";
        document.querySelector(".library").style.height = "69vh";

    });
    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".playbar").style.position = "aboslute";
        document.querySelector(".spotifyPlaylist").style.opacity = "10";
        document.querySelector(".left").style.left = "-120%";
        document.querySelector(".playbar").style.bottom = "5px";
    });

    function myFunction2(x) {
        if (x.matches) {
            document.querySelector(".hamburger").addEventListener("click", () => {
                document.querySelector(".left").style.left = "0";
                document.querySelector(".left").style.width = "95%";
                document.querySelector(".playbar").style.position = "fixed";
                document.querySelector(".playbar").style.bottom = "0px";
                document.querySelector(".spotifyPlaylist").style.opacity = "10";
                document.querySelector(".library").style.height = "69vh";

            });
            // Add an event listener for close button
            document.querySelector(".close").addEventListener("click", () => {
                document.querySelector(".playbar").style.position = "aboslute";
                document.querySelector(".spotifyPlaylist").style.opacity = "10";
                document.querySelector(".left").style.left = "-120%";
                document.querySelector(".playbar").style.bottom = "5px";
            });
        }
    }
    var y = window.matchMedia("(min-width:700px)")
    myFunction2(y);
    y.addEventListener("change", function () {
        myFunction2(y);
    })


    function myFunction(x) {
        if (x.matches) { // If media query matches
            document.querySelector(".close").addEventListener("click", () => {
                document.querySelector(".playbar").style.position = "absolute";
                document.querySelector(".left").style.left = "-120%";
                document.querySelector(".playbar").style.bottom = "5px";
            });
        }
    }
    var x = window.matchMedia("(max-width: 600px)")
    myFunction(x);
    x.addEventListener("change", function () {
        myFunction(x);
    })

    // Add event listener for previous button
    previous.addEventListener("click", () => {
        // console.log("previous clicked");
        // console.log(currentsong);
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        // console.log(index);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    });

    // Add event listener for next button
    next.addEventListener("click", () => {
        // console.log("next clicked");
        // console.log(currentsong);
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    });


    // Add event listener for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e, e.target, e.target.value);
        currentsong.volume = parseInt(e.target.value) / 100;
        if (e.target.value == 0)
            document.getElementById("vol").src = "img/mute.svg"
        else
            document.getElementById("vol").src = "img/volume.svg"

    });

    // Add event listener for volume
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            currentsong.volume = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentsong.volume = 0.1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;

        }
    })



};

main();