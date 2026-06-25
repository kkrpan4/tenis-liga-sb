// Supabase konfiguracija — zajednička za sve stranice.
// anon ključ je namijenjen za frontend (siguran za ovdje).
const SUPABASE_URL = "https://haqzyhbfxjivdtetjede.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcXp5aGJmeGppdmR0ZXRqZWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzOTg0MDYsImV4cCI6MjA5Nzk3NDQwNn0.NCwtjTVqEBae42dseBdeTRjso2d4iod9rs7fw9_GRLI";

// Globalni Supabase klijent (lib se učitava preko CDN-a prije ove datoteke).
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Bodovna formula (nogometni sustav):
//   Pobjeda = 3 boda | Poraz = 0 boda (bez obzira na 2:0 ili 2:1)
// Kod izjednačenih bodova: razlika setova -> razlika gemova.
const POINTS = {
  win: 3,
  loss: 0,
};

// Sakrij natpis "📷 Slika: ..." čim se prava slika uspješno učita.
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".hero, .auth-visual").forEach((el) => {
    const hint = el.querySelector(".img-hint");
    if (!hint) return;
    const match = getComputedStyle(el).backgroundImage.match(
      /url\(["']?(.+?)["']?\)/
    );
    if (!match) return;
    const img = new Image();
    img.onload = () => hint.remove();
    img.src = match[1];
  });
});
