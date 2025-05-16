// assets/login.js
document.addEventListener("DOMContentLoaded", () => {
  const loginLink = document.querySelector(".login-li");
  const logoutLink = document.querySelector(".logout-li");

  // Si un token existe déjà, on bascule l'affichage login/logout
  if (localStorage.getItem("token")) {
    logoutLink.classList.remove("display-none");
    loginLink.classList.add("display-none");
  }

  // Récupération du formulaire
  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Valeurs saisies
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Identifiants incorrects");

      const data = await res.json();
      // Stocke le token et redirige
      localStorage.setItem("token", data.token);
      window.location.href = "admin.html";
    } catch (err) {
      console.error(err);
      // Affichage du message d'erreur
      let existing = document.querySelector(".error-msg");
      if (existing) existing.remove();

      const msg = document.createElement("p");
      msg.classList.add("error-msg");
      msg.style.color = "red";
      msg.innerText = "Erreur dans l’identifiant ou le mot de passe";
      loginForm.appendChild(msg);
    }
  });

  // Gestion du clic sur logout (si besoin)
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    logoutLink.classList.add("display-none");
    loginLink.classList.remove("display-none");
  });
});
