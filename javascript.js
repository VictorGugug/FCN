<script>
    const audio = document.getElementById('audio');
    const playerThumbnail = document.getElementById('player-thumbnail');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const progress = document.getElementById('progress');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const player = document.getElementById('player');
    const playlistEl = document.getElementById('playlist');
    const lyricsContainer = document.getElementById('lyrics-container');
    
    // Lista de canciones
    const playlist = [
        {
            title: 'Falling with you',
            artist: 'AJ DiSpirito',
            src: 'mus/Falling with you.mp3',
            image: 'mus/Falling with you.jpeg'
        },
        {
            title: 'The HuMaN Gala',
            artist: 'AJ DiSpirito',
            src: 'mus/The HuMaN Gala.mp3',
            image: 'mus/The HuMaN Gala.jpeg',
            easterEgg: 'mus/The HuMaN Galap.jpeg'
        },
        {
            title: 'Waltz in E-Major, Op. 15 "Moon Waltz"',
            artist: 'AJ DiSpirito',
            src: 'mus/Waltz in E-Major, Op. 15 ＂Moon Waltz＂.mp3',
            image: 'mus/Waltz in E-Major, Op. 15 ＂Moon Waltz＂.jpeg'
        },
        {
            title: 'No Eyed Girl',
            artist: 'AJ DiSpirito',
            src: 'mus/No Eyed Girl.mp3',
            image: 'mus/SP.jpeg',
            easterEgg: 'mus/NC.jpeg'
        },
        {
            title: 'Ancient Aliens',
            artist: 'AJ DiSpirito',
            src: 'mus/Ancient Aliens.mp3',
            image: 'mus/SP.jpeg',
            easterEgg: 'mus/NC.jpeg'
        }
    ];

    let currentSongIndex = 0;
    let noEyedGirlEasterEggActive = false;
    let currentLyrics = [];

    async function loadSong(song) {
        audio.src = song.src;
        let imageSrc = song.image;

        if (song.easterEgg && (song.title === 'No Eyed Girl' || song.title === 'Ancient Aliens') && noEyedGirlEasterEggActive) {
            imageSrc = song.easterEgg;
        }

        playerThumbnail.src = imageSrc;
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
        audio.load();
        
        await fetchLyrics(song.title);
    }

    async function fetchLyrics(songTitle) {
        lyricsContainer.innerHTML = '';
        currentLyrics = [];
        
        const lyricsPath = `mus/${songTitle}.txt`;
        try {
            const response = await fetch(lyricsPath);
            if (!response.ok) {
                throw new Error('No se encontró el archivo de letra.');
            }
            const text = await response.text();
            
            const lines = text.split('\n');
            lines.forEach(line => {
                const match = line.match(/^\[(\d+):(\d+)\]\s*(.*)/);
                if (match) {
                    const minutes = parseInt(match[1]);
                    const seconds = parseInt(match[2]);
                    const time = minutes * 60 + seconds;
                    const text = match[3].trim();
                    currentLyrics.push({ time, text });
                }
            });

            if (currentLyrics.length > 0) {
                currentLyrics.forEach(lyric => {
                    const p = document.createElement('p');
                    p.textContent = lyric.text;
                    p.dataset.time = lyric.time;
                    lyricsContainer.appendChild(p);
                });
            } else {
                lyricsContainer.innerHTML = '<p>La letra no tiene el formato correcto o está vacía.</p>';
            }
        } catch (error) {
            lyricsContainer.innerHTML = '<p>No hay letra disponible para esta canción.</p>';
        }
    }

    function playAudio() {
        audio.play();
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'block';
    }

    function pauseAudio() {
        audio.pause();
        playBtn.style.display = 'block';
        pauseBtn.style.display = 'none';
    }
    
    function skipBack(seconds) {
        audio.currentTime = Math.max(0, audio.currentTime - seconds);
    }
    
    function skipForward(seconds) {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + seconds);
    }
    
    function createPlaylist() {
        playlistEl.innerHTML = '';
        noEyedGirlEasterEggActive = Math.floor(Math.random() * 10) === 0;

        playlist.forEach((song, index) => {
            const songItem = document.createElement('div');
            songItem.classList.add('song-item');
            songItem.dataset.index = index;

            let imageSrc = song.image;
            if (song.easterEgg && (song.title === 'No Eyed Girl' || song.title === 'Ancient Aliens') && noEyedGirlEasterEggActive) {
                imageSrc = song.easterEgg;
            } else if (song.title === 'The HuMaN Gala') {
                imageSrc = Math.floor(Math.random() * 10) === 0 ? song.easterEgg : song.image;
            }

            songItem.innerHTML = `
                <img class="song-item-thumbnail" src="${imageSrc}" alt="Portada">
                <div class="song-item-info">
                    <h4>${song.title}</h4>
                    <p>${song.artist}</p>
                </div>
            `;
            songItem.addEventListener('click', () => {
                currentSongIndex = index;
                loadSong(playlist[currentSongIndex]);
                playAudio();
            });
            playlistEl.appendChild(songItem);
        });

        const wipItem = document.createElement('div');
        wipItem.classList.add('wip-item');
        wipItem.innerHTML = 'Añadir música (WIP)';
        playlistEl.appendChild(wipItem);
    }

    playerThumbnail.addEventListener('click', () => {
        playlistEl.classList.toggle('expanded');
    });

    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = percent + '%';
        currentTimeEl.textContent = formatTime(audio.currentTime);

        const currentTimeInSeconds = audio.currentTime;
        const lyricsElements = lyricsContainer.querySelectorAll('p');
        
        lyricsElements.forEach((p, index) => {
            const lyricTime = parseFloat(p.dataset.time);
            let nextLyricTime = Infinity;
            if (index + 1 < currentLyrics.length) {
                nextLyricTime = currentLyrics[index + 1].time;
            }

            if (currentTimeInSeconds >= lyricTime && currentTimeInSeconds < nextLyricTime) {
                p.classList.add('active-lyric');
                p.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                p.classList.remove('active-lyric');
            }
        });
    });

    audio.addEventListener('ended', () => {
        playBtn.style.display = 'block';
        pauseBtn.style.display = 'none';
    });

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    loadSong(playlist[currentSongIndex]);
    createPlaylist();
</script>

</body>
</html>
