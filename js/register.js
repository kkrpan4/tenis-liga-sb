// Registracija novog igrača. Nadimak ide u metadata -> trigger kreira profil.
redirectIfLoggedIn();

const form = document.getElementById("register-form");
const msg = document.getElementById("msg");
const submitBtn = document.getElementById("submit");

function show(text, type) {
  msg.textContent = text;
  msg.className = `msg ${type} show`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.className = "msg";
  submitBtn.disabled = true;
  submitBtn.textContent = "Kreiram...";

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    let text = "Greška kod registracije.";
    if (error.message.includes("already registered"))
      text = "Taj email je već registriran.";
    else if (error.message.toLowerCase().includes("database"))
      text = "Taj nadimak je možda već zauzet. Probaj drugi.";
    show(text, "error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Registracija";
    return;
  }

  // Email potvrda je isključena -> sesija postoji odmah, idemo u app.
  window.location.href = "tablica.html";
});
