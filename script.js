document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
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
      resultContainer.classList.add("hidden");
      errorContainer.classList.add("hidden");
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

    resultContainer.classList.add("hidden");
    errorContainer.classList.add("hidden");
    loader.classList.remove("hidden");

    try {
      const result = await processDownload(url, currentPlatform, currentFormat);
      displayResult(result);
    } catch (error) {
      showError(error.message);
    } finally {
      loader.classList.add("hidden");
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

  // Process download with All-in-One API
  async function processDownload(url, platform, format) {
    const apiUrl = "https://all-media-downloader.p.rapidapi.com/download";
    const options = {
      method: 'GET',
      url: apiUrl,
      params: {
        url: url,
        platform: platform,
        quality: format.includes('hd') ? 'high' : (format === 'audio' ? 'audio' : 'low')
      },
      headers: {
        'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY', // Replace with your actual key
        'X-RapidAPI-Host': 'all-media-downloader.p.rapidapi.com'
      }
    };

    try {
      const response = await axios.request(options);
      if (!response.data.downloadUrl) {
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
      console.error('API Error:', error);
      throw new Error(`Failed to download: ${error.response?.data?.message || error.message}`);
    }
  }

  // Display the result
  function displayResult(data) {
    mediaTitle.textContent = data.title;
    mediaDuration.textContent = data.duration;
    
    mediaThumbnail.innerHTML = data.thumbnail ? 
      `<img src="${data.thumbnail}" alt="${data.title}">` : 
      `<div class="no-thumbnail">No thumbnail available</div>`;
    
    downloadLink.setAttribute("href", data.downloadUrl);
    downloadLink.setAttribute("download", 
      `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${data.type === 'audio' ? 'mp3' : 'mp4'}`);
    
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