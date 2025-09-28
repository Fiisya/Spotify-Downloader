document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.querySelector('.spotbtn');
    const spotifyInput = document.getElementById('spotifyDownloader');
    const resultBox = document.getElementById('result');
    const trackInfo = document.getElementById('track-info');
    const pasteBtn = document.querySelector('.paste-btn');
    const clearBtn = document.querySelector('.clear-btn');

    pasteBtn.addEventListener('click', async function() {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                spotifyInput.value = text;
                spotifyInput.dispatchEvent(new Event('input'));
                if (isValidSpotifyUrl(text)) {
                    spotifyInput.focus();
                }
            }
        } catch (err) {
            showResult('Gagal membaca clipboard', 'error');
            console.error('Failed to read clipboard:', err);
        }
    });

    clearBtn.addEventListener('click', function() {
        spotifyInput.value = '';
        spotifyInput.focus();
        spotifyInput.dispatchEvent(new Event('input'));
    });

    downloadBtn.addEventListener('click', async function() {
        const url = spotifyInput.value.trim();
        
        if (!url) {
            showResult('Silakan masukkan URL Spotify terlebih dahulu', 'error');
            return;
        }

        if (!isValidSpotifyUrl(url)) {
            showResult('URL Spotify tidak valid. Contoh: https://open.spotify.com/track/...', 'error');
            return;
        }

        try {
            showResult('Sedang memproses...', 'loading');
            trackInfo.style.display = 'none';
            
            const response = await fetch(`https://izumiiiiiiii.dpdns.org/downloader/spotify?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data.status && data.result) {
                showTrackInfo(data.result);
            } else {
                showResult('Gagal memproses: Data tidak ditemukan', 'error');
            }
        } catch (error) {
            showResult('Koneksi error: ' + error.message, 'error');
            console.error('Error:', error);
        }
    });

    function isValidSpotifyUrl(url) {
        const pattern = /^(https?:\/\/)?(www\.)?open\.spotify\.com\/(track|album|playlist)\/[a-zA-Z0-9]+(\?.*)?$/;
        return pattern.test(url);
    }

    function showTrackInfo(trackData) {
        resultBox.style.display = 'none';
        trackInfo.style.display = 'flex';

        document.getElementById('track-title').textContent = trackData.title || 'Tidak tersedia';
        document.getElementById('track-artist').textContent = trackData.artists || 'Tidak tersedia';
        document.getElementById('track-album').textContent = trackData.album || 'Tidak tersedia';
        document.getElementById('track-cover').src = trackData.image || 'default-image.png';

        // fallback download → preview_url kalau tidak ada
        const downloadUrl = trackData.download || trackData.preview_url || '#';
        const downloadLink = document.getElementById('download-link');
        downloadLink.href = downloadUrl;
        downloadLink.textContent = trackData.download ? "Download" : "Preview";
    }

    function showResult(message, type) {
        resultBox.style.display = 'flex';
        trackInfo.style.display = 'none';

        const iconClass = {
            'error': 'fa-times-circle',
            'loading': 'fa-spinner fa-spin',
            'success': 'fa-check-circle'
        };

        resultBox.innerHTML = `
            <i class="fas ${iconClass[type] || 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        resultBox.className = `result-box ${type === 'loading' ? 'loading' : ''}`;

        const icon = resultBox.querySelector('i');
        if (type === 'error') {
            icon.style.color = '#ff4444';
        } else if (type === 'success') {
            icon.style.color = '#1DB954';
        }
    }
});
