// VLC Core Web Engine Engine Setup
const video = document.getElementById('vlc-core-engine');
const canvas = document.getElementById('puzzle-canvas');
const ctx = canvas.getContext('2d');

// UI Controls
const playPauseBtn = document.getElementById('play-pause');
const stopBtn = document.getElementById('stop-btn');
const seekBar = document.getElementById('vlc-seek-bar');
const volumeBar = document.getElementById('vlc-volume');
const muteBtn = document.getElementById('mute-btn');
const fsBtn = document.getElementById('fs-btn');
const snapBtn = document.getElementById('snap-btn');
const puzzleBtn = document.getElementById('puzzle-trigger-btn');
const convertBtn = document.getElementById('convert-trigger');

let isPuzzleMode = false;
let rows = 2; // Scrambles video into a 2x2 interactive grid
let cols = 2;
let pieces = [];

// --- Basic VLC Core Playback Controls ---
playPauseBtn.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        playPauseBtn.textContent = 'Pause';
    } else {
        video.pause();
        playPauseBtn.textContent = 'Play';
    }
});

stopBtn.addEventListener('click', () => {
    video.pause();
    video.currentTime = 0;
    playPauseBtn.textContent = 'Play';
});

video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    seekBar.value = (video.currentTime / video.duration) * 100;
});

seekBar.addEventListener('input', () => {
    if (!video.duration) return;
    video.currentTime = (seekBar.value / 100) * video.duration;
});

volumeBar.addEventListener('input', () => {
    video.volume = volumeBar.value;
    video.muted = video.volume === 0;
    muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
});

muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
    volumeBar.value = video.muted ? 0 : video.volume;
});

fsBtn.addEventListener('click', () => {
    const container = document.getElementById('vlc-app-container');
    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => console.log(err));
    } else {
        document.exitFullscreen();
    }
});

// --- Advanced VLC Features ---

// 📸 Video Snapshot Feature
snapBtn.addEventListener('click', () => {
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = video.videoWidth || 640;
    snapCanvas.height = video.videoHeight || 360;
    const snapCtx = snapCanvas.getContext('2d');
    
    // Capture current living frame
    snapCtx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
    
    // Auto-download snapshot image
    const link = document.createElement('a');
    link.download = `vlc_snapshot_${Math.floor(Date.now() / 1000)}.png`;
    link.href = snapCanvas.toDataURL();
    link.click();
});

// 🔄 Mock Render Backend Conversion Warning
convertBtn.addEventListener('click', () => {
    const fileUrl = prompt("Enter heavy media URL (.mkv, .avi) to pipe to your Render processing stream:");
    if (fileUrl) {
        alert("Connecting to your Render Transcoding Microservice...\nStreaming fragmented MP4 output directly back to front-end core.");
        // When your Render backend is live, uncomment the line below:
        // video.src = `https://your-render-app.onrender.com/stream-media?fileUrl=${encodeURIComponent(fileUrl)}`;
    }
});

// --- 🧩 VLC Interactive Jigsaw Puzzle Filter Engine ---
function initPuzzle() {
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    pieces = [];

    const w = canvas.width / cols;
    const h = canvas.height / rows;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            pieces.push({
                sx: c * w, sy: r * h, // Source cutouts
                currentX: Math.random() * (canvas.width - w), // Scrambled coords
                currentY: Math.random() * (canvas.height - h),
                w: w, h: h
            });
        }
    }
}

function renderLoop() {
    if (!isPuzzleMode) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(piece => {
        // Paints current playing framework onto puzzle coordinates
        ctx.drawImage(
            video, 
            piece.sx, piece.sy, piece.w, piece.h,
            piece.currentX, piece.currentY, piece.w, piece.h
        );
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(piece.currentX, piece.currentY, piece.w, piece.h);
    });

    requestAnimationFrame(renderLoop);
}

// Simple drag-to-sort simulator for puzzle frame slices
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Scramble a piece randomly when you click it
    pieces.forEach(piece => {
        if (clickX > piece.currentX && clickX < piece.currentX + piece.w &&
            clickY > piece.currentY && clickY < piece.currentY + piece.h) {
            piece.currentX = Math.random() * (canvas.width - piece.w);
            piece.currentY = Math.random() * (canvas.height - piece.h);
        }
    });
});

puzzleBtn.addEventListener('click', () => {
    isPuzzleMode = !isPuzzleMode;
    if (isPuzzleMode) {
        video.classList.add('hidden');
        canvas.classList.remove('hidden');
        initPuzzle();
        renderLoop();
        puzzleBtn.style.background = '#ff8800';
    } else {
        canvas.classList.add('hidden');
        video.classList.remove('hidden');
        puzzleBtn.style.background = '#333';
    }
});
