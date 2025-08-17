document.addEventListener("DOMContentLoaded", () => {
  // Toggle password visibility
  const togglePasswordButtons = document.querySelectorAll(".toggle-password")

  togglePasswordButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const passwordInput = this.previousElementSibling
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
      passwordInput.setAttribute("type", type)

      // Toggle icon
      const icon = this.querySelector("i")
      if (type === "text") {
        icon.classList.remove("fa-eye")
        icon.classList.add("fa-eye-slash")
      } else {
        icon.classList.remove("fa-eye-slash")
        icon.classList.add("fa-eye")
      }
    })
  })

  // Form validation
  const loginForm = document.getElementById("login-form")
  const signupForm = document.getElementById("signup-form")

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const email = document.getElementById("email").value
      const password = document.getElementById("password").value

      // Simple validation
      if (!email || !password) {
        alert("Please fill in all fields")
        return
      }

      // Simulate login (in a real app, this would be an API call)
      alert("Login successful! Redirecting to dashboard...")
      setTimeout(() => {
        window.location.href = "index.html"
      }, 1500)
    })
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const fullname = document.getElementById("fullname").value
      const email = document.getElementById("email").value
      const phone = document.getElementById("phone").value
      const password = document.getElementById("password").value
      const confirmPassword = document.getElementById("confirm-password").value
      const terms = document.getElementById("terms").checked

      // Simple validation
      if (!fullname || !email || !phone || !password || !confirmPassword) {
        alert("Please fill in all fields")
        return
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match")
        return
      }

      if (!terms) {
        alert("Please agree to the Terms of Service and Privacy Policy")
        return
      }

      // Simulate signup (in a real app, this would be an API call)
      alert("Account created successfully! Redirecting to login...")
      setTimeout(() => {
        window.location.href = "login.html"
      }, 1500)
    })
  }
})
