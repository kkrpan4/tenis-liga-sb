// Zajedničke auth funkcije i zaštita stranica.

async function getCurrentUser() {
  const { data } = await sb.auth.getSession();
  return data.session ? data.session.user : null;
}

// Pozvati na zaštićenim stranicama. Ako nema prijave -> vrati na prijavu.
// Vraća { user, username } ili preusmjeri.
async function protectPage(activePage) {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return null;
  }

  // Dohvati nadimak iz profila.
  let username = user.email;
  const { data: profile } = await sb
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();
  if (profile) username = profile.username;

  // Popuni navigaciju.
  const meEl = document.getElementById("me");
  if (meEl) meEl.textContent = username;

  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await sb.auth.signOut();
      window.location.href = "index.html";
    });
  }

  // Označi aktivnu stavku izbornika.
  if (activePage) {
    const link = document.querySelector(`.nav a[data-page="${activePage}"]`);
    if (link) link.classList.add("active");
  }

  return { user, username };
}

// Ako je korisnik već prijavljen, preusmjeri ga s prijave/registracije u app.
async function redirectIfLoggedIn() {
  const user = await getCurrentUser();
  if (user) window.location.href = "tablica.html";
}
