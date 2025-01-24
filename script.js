const youtubeApiKey = "AIzaSyA6UP-7PEXXrQaWf84WuG_RxHS5jBcQEqc";
const rapidApiHost = "youtube-mp36.p.rapidapi.com";
const rapidApiKey = "f707dd8d67mshaf3d42fbdfe97c8p1d93d4jsnd8b8ceb0121e";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsContainer = document.getElementById("results");
const savedTracksContainer = document.getElementById("savedTracks");
const audioPlayer = document.getElementById("audioPlayer");
const playPauseBtn = document.getElementById("playPauseBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const thumbnail = document.getElementById("thumbnail");
const titleElement = document.getElementById("title");
const audioSeekbar = document.getElementById("audioSeekbar");
const currentTimeDisplay = document.getElementById("currentTime");
const durationDisplay = document.getElementById("duration");

let audio = new Audio();
let tracks = [];
let currentTrackIndex = 0;
let savedTracks = JSON.parse(localStorage.getItem("savedTracks")) || [];
let isShuffle = false;
let isRepeat = false;

// Format time
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Save track to local storage
function saveTrack(track) {
  if (!savedTracks.find((t) => t.videoId === track.videoId)) {
    savedTracks.push(track);
    localStorage.setItem("savedTracks", JSON.stringify(savedTracks));
    displaySavedTracks();
  }
}

// Display saved tracks
function displaySavedTracks() {
  savedTracksContainer.innerHTML = "";
  savedTracks.forEach((track) => {
    const trackElement = document.createElement("div");
    trackElement.classList.add("result-item");
    trackElement.innerHTML = `
      <img src="${track.thumbnail}" alt="${track.title}">
      <h3>${track.title}</h3>
      <button class="remove-track">Remove</button>
    `;
    trackElement.querySelector(".remove-track").addEventListener("click", () => {
      savedTracks = savedTracks.filter((t) => t.videoId !== track.videoId);
      localStorage.setItem("savedTracks", JSON.stringify(savedTracks));
      displaySavedTracks();
    });
    trackElement.addEventListener("click", () => playTrack(track));
    savedTracksContainer.appendChild(trackElement);
  });
}

// Search YouTube videos
searchBtn.addEventListener("click", () => searchYouTubeVideos(searchInput.value));
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchYouTubeVideos(searchInput.value);
});

function searchYouTubeVideos(query) {
  if (!query.trim()) {
    alert("Please enter a search term");
    return;
  }

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&q=${encodeURIComponent(query)}&key=${youtubeApiKey}`;

  fetch(searchUrl)
    .then((response) => response.json())
    .then((data) => displaySearchResults(data.items))
    .catch((error) => console.error("Error fetching YouTube data:", error));
}

// Display search results
function displaySearchResults(videos) {
  resultsContainer.innerHTML = "";
  tracks = []; // Reset tracks

  videos.forEach((video, index) => {
    const videoId = video.id.videoId;
    const title = video.snippet.title;
    const thumbnailUrl = video.snippet.thumbnails.medium.url;

    const resultItem = document.createElement("div");
    resultItem.classList.add("result-item");
    resultItem.innerHTML = `
      <img src="${thumbnailUrl}" alt="${title}" />
      <h3>${title}</h3>
    `;

    resultItem.addEventListener("click", () => fetchAudio(videoId, title, thumbnailUrl));
    resultsContainer.appendChild(resultItem);
  });
}

// Fetch audio
function fetchAudio(videoId, title, thumbnailUrl) {
  const apiUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;

  fetch(apiUrl, {
    method: "GET",
    headers: {
      "x-rapidapi-host": rapidApiHost,
      "x-rapidapi-key": rapidApiKey,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data && data.link) {
        const track = {
          videoId,
          title,
          thumbnail: thumbnailUrl,
          url: data.link,
        };
        tracks.push(track);
        saveTrack(track); // Save to saved tracks
        playTrack(track);
      } else {
        alert("Failed to fetch audio link");
      }
    })
    .catch((error) => console.error("Error fetching audio link:", error));
}

// Play track
function playTrack(track) {
  audio.src = track.url;
  thumbnail.src = track.thumbnail;
  titleElement.textContent = track.title;
  audioPlayer.style.display = "flex";

  audio.play();
  playPauseBtn.textContent = "Pause";

  audio.addEventListener("loadedmetadata", () => {
    audioSeekbar.max = audio.duration;
    durationDisplay.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", updateSeekbar);
}

// Update seekbar
function updateSeekbar() {
  audioSeekbar.value = audio.currentTime;
  currentTimeDisplay.textContent = formatTime(audio.currentTime);
}

audioSeekbar.addEventListener("input", () => {
  audio.currentTime = audioSeekbar.value;
});

// Play/Pause button
playPauseBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = "Pause";
  } else {
    audio.pause();
    playPauseBtn.textContent = "Play";
  }
});

// Shuffle and Repeat functionality
shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.style.color = isShuffle ? "blue" : "black";
});

repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.style.color = isRepeat ? "blue" : "black";
});

// Play next track
audio.addEventListener("ended", () => {
  if (isRepeat) {
    playTrack(tracks[currentTrackIndex]);
  } else if (isShuffle) {
    currentTrackIndex = Math.floor(Math.random() * tracks.length);
    playTrack(tracks[currentTrackIndex]);
  } else {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    playTrack(tracks[currentTrackIndex]);
  }
});

// Display saved tracks on load
displaySavedTracks();
