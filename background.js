document.addEventListener("DOMContentLoaded", () => {
  const starsContainer = document.getElementById("stars-container")
  const musicToggle = document.getElementById("music-toggle")
  const backgroundMusic = document.getElementById("background-music")

  // Create stars
  function createStars() {
    starsContainer.innerHTML = ""
    const numberOfStars = Math.floor((window.innerWidth * window.innerHeight) / 1000)

    for (let i = 0; i < numberOfStars; i++) {
      const star = document.createElement("div")
      star.classList.add("star")

      // Random position
      const left = Math.random() * 100
      const top = Math.random() * 100

      // Random size
      const size = Math.random() * 3 + 1

      // Random duration and delay
      const duration = Math.random() * 5 + 3
      const delay = Math.random() * 5

      // Random opacity
      const opacity = Math.random() * 0.5 + 0.3

      star.style.left = `${left}%`
      star.style.top = `${top}%`
      star.style.width = `${size}px`
      star.style.height = `${size}px`
      star.style.setProperty("--duration", `${duration}s`)
      star.style.setProperty("--opacity", opacity)
      star.style.animationDelay = `${delay}s`

      starsContainer.appendChild(star)
    }
  }

  // Change background color
  function changeBackgroundColor() {
    // More vibrant colors with better contrast
    const colors = [
      "rgba(12, 12, 42, 1)", // Deep blue
      "rgba(25, 10, 60, 1)", // Purple
      "rgba(10, 30, 60, 1)", // Navy blue
      "rgba(5, 20, 45, 1)", // Dark blue
      "rgba(30, 10, 40, 1)", // Plum
      "rgba(15, 25, 55, 1)", // Royal blue
      "rgba(20, 15, 50, 1)", // Indigo
      "rgba(10, 10, 35, 1)", // Midnight blue
    ]

    let currentIndex = 0

    // Change color every 5 seconds instead of 10
    setInterval(() => {
      currentIndex = (currentIndex + 1) % colors.length
      document.body.style.transition = "background-color 3s ease" // Smooth transition
      document.body.style.backgroundColor = colors[currentIndex]
    }, 5000)
  }

  // Toggle background music
  musicToggle.addEventListener("click", function () {
    if (backgroundMusic.paused) {
      backgroundMusic.volume = 0.7 // Set volume to 70%
      backgroundMusic.play().catch((error) => {
        console.error("Audio playback failed:", error)
        alert("Please interact with the page first to enable audio playback.")
      })
      this.innerHTML = '<i class="fas fa-volume-up"></i>'
      this.classList.add("playing")
    } else {
      backgroundMusic.pause()
      this.innerHTML = '<i class="fas fa-volume-mute"></i>'
      this.classList.remove("playing")
    }
  })

  // Initialize
  createStars()
  changeBackgroundColor()

  // Recreate stars on window resize
  window.addEventListener("resize", createStars)
})
