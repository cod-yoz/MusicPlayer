/**
 * 🎵 MUSIQALAR BAZASI
 */
const songs = [
    {
        title: "Ey sevgilim",
        artist: "Murodbek Qilichev",
        cover: "photo1.jpg",
        src: "Murodbek-Qilichev-Ey-sevgilim.mp3",
        lyrics: "Mavzu: Sevgi va sog'inch.\n\n\"Ey sevgilim ishqing bilan Til yuragimni til yuragimni Men bir yengil tortay axir Sezib senga men keragimni\""
    },
    {
        title: "Samiya",
        artist: "Sardor Mirzaliyev",
        cover: "./SardorMirzaliyev.jpg",
        src: "./SardorMirzaliyev-Samiya.mp3", 
        lyrics: "Swinging in the backyard..."
    },
    {
        title: "Galmin during",
        artist: "Akbar Sapayev",
        cover: "./AkbarSapayev.jpg",
        src: "GalminDuring-AkbarSapayev.m4a",
        lyrics: "Mavzu: Go'zallik va o'ziga ishonch.\n\n\"Shine bright like a diamond...\""
    }
];

let currentIndex = 1; 
let isPlaying = false;

const carousel = document.getElementById('carousel');
const audio = document.getElementById('main-audio');
const playPauseBtn = document.getElementById('play-pause-btn');
const volumeBtn = document.getElementById('volume-btn');
const visualizer = document.getElementById('visualizer');
const progressBar = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');

function initApp() {
    carousel.innerHTML = ''; 
    const playlistUl = document.getElementById('playlist-list');
    playlistUl.innerHTML = '';

    songs.forEach((song, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        
        card.addEventListener('click', () => {
            if (currentIndex === index) {
                togglePlay();
            } else {
                goToSong(index);
                if (!isPlaying) togglePlay(); 
            }
        }); 

        card.innerHTML = `
            <img src="${song.cover}" alt="cover">
            <div class="card-info">
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
        `;
        carousel.appendChild(card);

        const li = document.createElement('li');
        li.innerText = `${index + 1}. ${song.artist} - ${song.title}`;
        li.onclick = () => {
            goToSong(index);
            togglePlaylist(); 
            if(!isPlaying) togglePlay();
        };
        playlistUl.appendChild(li);
    });
    
    updatePlayer();
}

function updatePlayer() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        let offset = index - currentIndex; 
        let translateX = offset * 130; 
        let scale = 1 - Math.abs(offset) * 0.15; 
        let zIndex = 10 - Math.abs(offset); 
        let opacity = Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.2; 

        card.style.transform = `translateX(${translateX}px) scale(${scale})`;
        card.style.zIndex = zIndex;
        card.style.opacity = opacity;
    });

    const activeSong = songs[currentIndex];
    document.getElementById('np-title').innerText = activeSong.title;
    document.getElementById('np-artist').innerText = activeSong.artist;
    document.getElementById('np-img').src = activeSong.cover;
    document.getElementById('lyrics-text').innerText = activeSong.lyrics || "Matn kiritilmagan.";
    
    audio.src = activeSong.src;
    progressBar.style.width = `0%`; 
    
    if (isPlaying) {
        audio.play().catch(()=> { isPlaying = false; });
    }
}

function togglePlay() {
    if (isPlaying) {
        audio.pause();
        playPauseBtn.classList.replace('fa-pause', 'fa-play');
        visualizer.classList.remove('active');
    } else {
        audio.play();
        playPauseBtn.classList.replace('fa-play', 'fa-pause');
        visualizer.classList.add('active');
    }
    isPlaying = !isPlaying;
}

function nextSong() { currentIndex = (currentIndex + 1) % songs.length; updatePlayer(); }
function prevSong() { currentIndex = (currentIndex - 1 + songs.length) % songs.length; updatePlayer(); }
function goToSong(index) { currentIndex = index; updatePlayer(); }
function skipForward() { if (audio.currentTime + 5 < audio.duration) audio.currentTime += 5; else nextSong(); }
function skipBackward() { audio.currentTime = Math.max(0, audio.currentTime - 5); }

function toggleMute() {
    audio.muted = !audio.muted;
    if (audio.muted) {
        volumeBtn.classList.replace('fa-volume-high', 'fa-volume-xmark');
        volumeBtn.style.color = "red";
    } else {
        volumeBtn.classList.replace('fa-volume-xmark', 'fa-volume-high');
        volumeBtn.style.color = ""; 
    }
}

function toggleLyrics() { document.getElementById('lyrics-modal').classList.toggle('hidden'); }
function togglePlaylist() { document.getElementById('playlist-modal').classList.toggle('hidden'); }

// YANGI FUNKSIYA: Ro'yxat oynasi ichidan Matnni ochish
function openLyricsFromPlaylist() {
    togglePlaylist(); // Ro'yxatni yopamiz
    toggleLyrics();   // Matnni ochamiz
}

audio.addEventListener('ended', nextSong);
document.addEventListener('DOMContentLoaded', initApp);

/* ==========================================
 *  ⏱️ VAQT VA PROGRESS BAR
 * ========================================== */
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

audio.addEventListener('loadedmetadata', () => { totalTimeEl.innerText = formatTime(audio.duration); });
audio.addEventListener('timeupdate', () => {
    currentTimeEl.innerText = formatTime(audio.currentTime);
    if (audio.duration) progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
});

progressContainer.addEventListener('click', (e) => {
    audio.currentTime = (e.offsetX / progressContainer.clientWidth) * audio.duration;
});

/* ==========================================
 *  📱 MOBIL SWIPE & 💻 KLAVIATURA
 * ========================================== */
let touchStartX = 0, touchEndX = 0;
carousel.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
carousel.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) nextSong(); 
    else if (touchEndX - touchStartX > 50) prevSong(); 
});

document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') nextSong(); 
    else if (e.key === 'ArrowLeft') prevSong(); 
    else if (e.key === ' ' || e.code === 'Space' || e.key === 'Enter' || e.key === '2') {
        e.preventDefault(); togglePlay();
    } 
    else if (e.key === '1') skipBackward();
    else if (e.key === '3') skipForward();
});
