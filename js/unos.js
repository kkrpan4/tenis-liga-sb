// Unos rezultata meča.
(async function () {
  const me = await protectPage("unos");
  if (!me) return;

  const msg = document.getElementById("msg");
  const form = document.getElementById("match-form");
  const submitBtn = document.getElementById("submit");
  const sel1 = document.getElementById("player1");
  const sel2 = document.getElementById("player2");

  function show(text, type) {
    msg.textContent = text;
    msg.className = `msg ${type} show`;
    if (type === "error") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Učitaj igrače.
  const { data: profiles, error } = await sb
    .from("profiles")
    .select("id, username")
    .order("username");

  if (error || !profiles || profiles.length < 2) {
    show(
      "Potrebna su barem 2 registrirana igrača da bi se unio meč.",
      "error"
    );
    submitBtn.disabled = true;
    return;
  }

  const optionsHtml = profiles
    .map((p) => `<option value="${p.id}">${escapeHtml(p.username)}</option>`)
    .join("");
  sel1.innerHTML = `<option value="">— odaberi —</option>${optionsHtml}`;
  sel2.innerHTML = `<option value="">— odaberi —</option>${optionsHtml}`;

  function num(id) {
    const v = document.getElementById(id).value.trim();
    return v === "" ? null : parseInt(v, 10);
  }

  // Validira setove i vraća { setsWon1, setsWon2 } ili baca tekst greške.
  function evaluateSets(sets) {
    let won1 = 0;
    let won2 = 0;
    let playedSets = 0;
    let finished = false;

    for (let i = 0; i < sets.length; i++) {
      const [a, b] = sets[i];
      const bothEmpty = a === null && b === null;
      const oneEmpty = (a === null) !== (b === null);

      if (oneEmpty) throw `Set ${i + 1}: upiši rezultat za oba igrača.`;
      if (bothEmpty) continue;
      if (a < 0 || b < 0) throw `Set ${i + 1}: rezultat ne može biti negativan.`;
      if (a === b) throw `Set ${i + 1}: set ne može završiti neriješeno.`;
      if (finished)
        throw "Upisao si previše setova — meč je već gotov nakon 2 dobivena.";

      playedSets++;
      if (a > b) won1++;
      else won2++;

      if (won1 === 2 || won2 === 2) finished = true;
    }

    if (playedSets < 2) throw "Upiši barem 2 seta.";
    if (won1 !== 2 && won2 !== 2)
      throw "Meč mora imati pobjednika s 2 dobivena seta.";

    return { won1, won2 };
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.className = "msg";

    const player1 = sel1.value;
    const player2 = sel2.value;

    if (!player1 || !player2) return show("Odaberi oba igrača.", "error");
    if (player1 === player2)
      return show("Igrač ne može igrati protiv sebe.", "error");

    const sets = [
      [num("p1s1"), num("p2s1")],
      [num("p1s2"), num("p2s2")],
      [num("p1s3"), num("p2s3")],
    ];

    let result;
    try {
      result = evaluateSets(sets);
    } catch (errText) {
      return show(errText, "error");
    }

    const winner = result.won1 === 2 ? player1 : player2;

    submitBtn.disabled = true;
    submitBtn.textContent = "Spremam...";

    const { error: insErr } = await sb.from("matches").insert({
      player1,
      player2,
      p1_set1: sets[0][0],
      p2_set1: sets[0][1],
      p1_set2: sets[1][0],
      p2_set2: sets[1][1],
      p1_set3: sets[2][0],
      p2_set3: sets[2][1],
      sets_won_1: result.won1,
      sets_won_2: result.won2,
      winner,
      recorded_by: me.user.id,
    });

    if (insErr) {
      show("Greška kod spremanja meča. Pokušaj ponovno.", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Spremi meč";
      return;
    }

    show("Meč spremljen! Tablica je ažurirana.", "success");
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = "Spremi meč";
  });
})();

function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c])
  );
}
