const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsContainer = document.getElementById("results");
const savedTracksContainer = document.getElementById("savedTracks");
const audioPlayer = document.getElementById("audioPlayer");
const playPauseBtn = document.getElementById("playPauseBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");

let tracks = [];
let savedTracks = JSON.parse(localStorage.getItem("savedTracks")) || [];
let isShuffle = false;
let isRepeat = false;

function saveTrack(track) {
  if (!savedTracks.find((t) => t.videoId === track.videoId)) {
    savedTracks.push(track);
    localStorage.setItem("savedTracks", JSON.stringify(savedTracks));
    displaySavedTracks();
  }
}

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

// Shuffle and Repeat
shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.style.color = isShuffle ? "var(--highlight-color)" : "var(--text-muted)";
});

repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.style.color = isRepeat ? "var(--highlight-color)" : "var(--text-muted)";
});

displaySavedTracks();
