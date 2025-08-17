document.addEventListener("DOMContentLoaded", () => {
  // ===== Background Music Player =====
  const musicToggle = document.querySelector('.music-toggle');
  const volumeSlider = document.querySelector('.volume-slider');
  const backgroundMusic = new Audio('your-background-music.mp3'); // Add your music file path
  
  // Set music to loop
  backgroundMusic.loop = true;
  
  // Music toggle functionality
  musicToggle.addEventListener('click', function() {
    if (backgroundMusic.paused) {
      backgroundMusic.play()
        .then(() => {
          musicToggle.classList.add('playing');
        })
        .catch(error => {
          console.error("Audio playback failed:", error);
        });
    } else {
      backgroundMusic.pause();
      musicToggle.classList.remove('playing');
    }
  });
  
  // Volume control
  volumeSlider.addEventListener('input', function() {
    backgroundMusic.volume = this.value;
  });
  
  // Set initial volume (50%)
  backgroundMusic.volume = 0.5;
  volumeSlider.value = 0.5;

  // ===== Your Existing Downloader Code =====
  const platformTabs = document.querySelectorAll(".platform-tab");
  const urlInput = document.getElementById("url-input");
  const downloadBtn = document.getElementById("download-btn");
  const resultContainer = document.getElementById("result-container");
  const loader = document.getElementById("loader");
  const errorContainer = document.getElementById("error-container");
  const errorMessage = document.getElementById("error-message");
  const mediaThumbnail = document.getElementById("media-thumbnail");
  const mediaTitle = document.getElementById("media-title");
  const mediaDuration = document.getElementById("media-duration").querySelector("span");
  const downloadLink = document.getElementById("download-link");
  const copyLinkBtn = document.getElementById("copy-link");
  const formatOptions = document.querySelectorAll('input[name="format"]');
  const downloadProgress = document.querySelector(".download-progress");
  const progressFill = document.querySelector(".progress-fill");
  const progressText = document.querySelector(".progress-text span");

  // Current platform and format
  let currentPlatform = "youtube";
  let currentFormat = "video-hd";

  // Platform tab click event
  platformTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      platformTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentPlatform = tab.getAttribute("data-platform");
      updatePlaceholder();
      clearResults();
    });
  });

  // Format option change event
  formatOptions.forEach((option) => {
    option.addEventListener("change", () => {
      currentFormat = option.value;
    });
  });

  // Update placeholder based on selected platform
  function updatePlaceholder() {
    const placeholders = {
      youtube: "Paste YouTube video URL here...",
      tiktok: "Paste TikTok video URL here...",
      facebook: "Paste Facebook video URL here...",
      instagram: "Paste Instagram video/reel URL here...",
      spotify: "Paste Spotify track URL here...",
      audiomark: "Paste Audiomark track URL here...",
    };
    urlInput.placeholder = placeholders[currentPlatform] || "Paste your link here...";
  }

  // Clear results and errors
  function clearResults() {
    resultContainer.classList.add("hidden");
    errorContainer.classList.add("hidden");
    urlInput.value = "";
  }

  // Initialize placeholder
  updatePlaceholder();

  // Download button click event
  downloadBtn.addEventListener("click", async () => {
    const url = urlInput.value.trim();

    if (!url) {
      showError("Please enter a valid URL");
      return;
    }

    if (!isValidUrl(url)) {
      showError("Invalid URL format. Please enter a valid URL");
      return;
    }

    if (!matchesPlatform(url, currentPlatform)) {
      showError(`This doesn't look like a ${currentPlatform} URL. Please check and try again.`);
      return;
    }

    clearResults();
    loader.classList.remove("hidden");
    downloadBtn.disabled = true;

    try {
      // Pause music while processing download (optional)
      backgroundMusic.pause();
      musicToggle.classList.remove('playing');
      
      const result = await processDownload(url, currentPlatform, currentFormat);
      displayResult(result);
    } catch (error) {
      console.error("Download error:", error);
      showError(error.message || "Failed to process download. Please try again.");
    } finally {
      loader.classList.add("hidden");
      downloadBtn.disabled = false;
    }
  });

  // Copy link button click event
  copyLinkBtn.addEventListener("click", () => {
    const link = downloadLink.getAttribute("href");

    if (link && link !== "#") {
      navigator.clipboard.writeText(link)
        .then(() => {
          const originalText = copyLinkBtn.innerHTML;
          copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
          setTimeout(() => {
            copyLinkBtn.innerHTML = originalText;
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy link: ", err);
          showError("Failed to copy link to clipboard");
        });
    }
  });

  // Validate URL format
  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Check if URL matches the selected platform
  function matchesPlatform(url, platform) {
    const patterns = {
      youtube: /youtube\.com|youtu\.be/i,
      tiktok: /tiktok\.com/i,
      facebook: /facebook\.com|fb\.com|fb\.watch/i,
      instagram: /instagram\.com/i,
      spotify: /spotify\.com/i,
      audiomark: /audiomark\.com/i,
    };
    return patterns[platform] ? patterns[platform].test(url) : true;
  }

  // Show error message
  function showError(message) {
    errorMessage.textContent = message;
    errorContainer.classList.remove("hidden");
  }

  // Process download through your proxy server
  async function processDownload(url, platform, format) {
    try {
      const response = await axios.get('/api/download', {
        params: {
          url: encodeURIComponent(url),
          platform: platform,
          quality: format.includes('hd') ? 'high' : (format === 'audio' ? 'audio' : 'low')
        },
        timeout: 30000 // 30 seconds timeout
      });

      if (!response.data || !response.data.downloadUrl) {
        throw new Error('No download link found in response');
      }
      
      return {
        title: response.data.title || `${platform} Media`,
        thumbnail: response.data.thumbnail || '',
        duration: response.data.duration || '0:00',
        downloadUrl: response.data.downloadUrl,
        type: format === 'audio' ? 'audio' : 'video'
      };
    } catch (error) {
      console.error('Download error:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Download service unavailable');
      } else if (error.request) {
        throw new Error('No response from server. Please try again later.');
      } else {
        throw new Error('Failed to process download. Please try again.');
      }
    }
  }

  // Display the result
  function displayResult(data) {
    if (!data || !data.downloadUrl) {
      throw new Error('Invalid response data');
    }

    mediaTitle.textContent = data.title || "Untitled Media";
    mediaDuration.textContent = data.duration || '0:00';
    
    mediaThumbnail.innerHTML = data.thumbnail ? 
      `<img src="${data.thumbnail}" alt="${data.title}" onerror="this.parentElement.innerHTML='<div class=\"no-thumbnail\">No thumbnail available</div>'">` : 
      `<div class="no-thumbnail">No thumbnail available</div>`;
    
    downloadLink.setAttribute("href", data.downloadUrl);
    downloadLink.setAttribute("download", 
      `${(data.title || 'download').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${data.type === 'audio' ? 'mp3' : 'mp4'}`);
    
    resultContainer.classList.remove("hidden");
  }

  // Simulate download progress (for demo purposes)
  downloadLink.addEventListener("click", (e) => {
    if (downloadLink.getAttribute("href") === "#") {
      e.preventDefault();
      return;
    }
    
    downloadProgress.classList.remove("hidden");
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          downloadProgress.classList.add("hidden");
          progressFill.style.width = "0%";
          progressText.textContent = "0%";
        }, 500);
      }
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${Math.round(progress)}%`;
    }, 200);
  });
});