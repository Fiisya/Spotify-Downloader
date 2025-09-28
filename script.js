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

  // =========================================================
  // BAGIAN UTAMA YANG DIUBAH ADA DI SINI
  // =========================================================
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

      // 1. URL API diganti
      const apiUrl = `http://googleusercontent.com/spotify.com/api?url=${encodeURIComponent(url)}`; // Asumsi endpoint API
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      // 2. Pengecekan data disesuaikan dengan struktur baru (data.result)
      if (data.status && data.result) {
        showTrackInfo(data.result); // Kirim data.result ke fungsi
      } else {
        showResult('Gagal memproses: Data lagu tidak ditemukan', 'error');
      }
    } catch (error) {
      showResult('Koneksi error: ' + error.message, 'error');
      console.error('Error:', error);
    }
  });

  // Fungsi ini tidak diubah, karena URL input dari user tetap URL Spotify standar
  function isValidSpotifyUrl(url) {
    const pattern = /^(https?:\/\/)?(www\.)?open\.spotify\.com\/(track|album|playlist)\/[a-zA-Z0-9]+(\?.*)?$/;
    return pattern.test(url);
  }
  
  // =========================================================
  // FUNGSI INI JUGA DIUBAH UNTUK MENYESUAIKAN KEY DAN FALLBACK
  // =========================================================
  function showTrackInfo(trackData) {
    resultBox.style.display = 'none';
    trackInfo.style.display = 'flex';

    // 3. Sesuaikan nama key sesuai output API baru
    document.getElementById('track-title').textContent = trackData.title || 'Tidak tersedia';
    document.getElementById('track-artist').textContent = trackData.artists || 'Tidak tersedia'; // 'artis' -> 'artists'
    document.getElementById('track-album').textContent = trackData.album || 'Tidak tersedia'; // 'type' -> 'album'
    document.getElementById('track-cover').src = trackData.image || 'default-image.png';

    // 4. Implementasi logika fallback untuk link download
    const downloadUrl = trackData.download || trackData.preview_url || '#';
    const downloadLink = document.getElementById('download-link');
    downloadLink.href = downloadUrl;
    
    // Bonus: Tambahkan nama file saat di-download jika memungkinkan
    if (trackData.title && trackData.artists) {
        downloadLink.download = `${trackData.artists} - ${trackData.title}.mp3`;
    }
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
