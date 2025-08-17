document.addEventListener("DOMContentLoaded", () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const downloadLink = document.getElementById("download-link");

  if (downloadLink && isMobile) {
    downloadLink.addEventListener("click", async (e) => {
      e.preventDefault();
      const url = downloadLink.getAttribute("href");
      const fileName = downloadLink.getAttribute("download");
      
      if (!url || url === "#") return;
      
      try {
        // Show loading state
        downloadLink.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
        
        // Fetch the file
        const response = await fetch(url);
        if (!response.ok) throw new Error('Download failed');
        
        // Create downloadable blob
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        // Trigger download
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
          downloadLink.innerHTML = '<i class="fas fa-download"></i> Download Now';
        }, 100);
        
      } catch (error) {
        console.error("Download failed:", error);
        downloadLink.innerHTML = '<i class="fas fa-download"></i> Try Again';
        alert("Download failed. Please try again or use a different browser.");
      }
    });
  }
});