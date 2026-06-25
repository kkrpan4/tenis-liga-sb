// Prijava postojećeg korisnika.
redirectIfLoggedIn();

const form = document.getElementById("login-form");
const msg = document.getElementById("msg");
const submitBtn = document.getElementById("submit");

function showError(text) {
  msg.textContent = text;
  msg.className = "msg error show";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.className = "msg error";
  submitBtn.disabled = true;
  submitBtn.textContent = "Prijava...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { error } = await sb.auth.signInWithPassword({ email, password });

  if (error) {
    showError("Neispravan email ili lozinka.");
    submitBtn.disabled = false;
    submitBtn.textContent = "Prijava";
    return;
  }

  window.location.href = "tablica.html";
});
