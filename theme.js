document.addEventListener("DOMContentLoaded", () => {
  const themeSwitch = document.getElementById("theme-switch")
  const body = document.body

  // Check for saved theme preference or use default
  const currentTheme = localStorage.getItem("theme")
  if (currentTheme) {
    body.classList.add(currentTheme)
    if (currentTheme === "dark-theme") {
      themeSwitch.checked = true
    }
  }

  // Toggle theme when switch is clicked
  themeSwitch.addEventListener("change", function () {
    if (this.checked) {
      body.classList.add("dark-theme")
      localStorage.setItem("theme", "dark-theme")
    } else {
      body.classList.remove("dark-theme")
      localStorage.setItem("theme", "")
    }
  })
})
