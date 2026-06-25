// Popis svih odigranih mečeva.
(async function () {
  const me = await protectPage("mecevi");
  if (!me) return;

  const list = document.getElementById("list");

  const [{ data: profiles }, { data: matches }] = await Promise.all([
    sb.from("profiles").select("id, username"),
    sb.from("matches").select("*").order("played_at", { ascending: false }),
  ]);

  const nameById = {};
  for (const p of profiles || []) nameById[p.id] = p.username;

  if (!matches || matches.length === 0) {
    list.innerHTML =
      '<div class="empty">Još nema odigranih mečeva. Unesi prvi! </div>';
    return;
  }

  list.innerHTML = matches
    .map((m) => {
      const n1 = escapeHtml(nameById[m.player1] || "Nepoznat");
      const n2 = escapeHtml(nameById[m.player2] || "Nepoznat");
      const p1Won = m.winner === m.player1;

      // Niz setova kao "6:4 3:6 7:5".
      const setStr = [
        fmtSet(m.p1_set1, m.p2_set1),
        fmtSet(m.p1_set2, m.p2_set2),
        fmtSet(m.p1_set3, m.p2_set3),
      ]
        .filter(Boolean)
        .join("  ");

      const left = p1Won ? `<span class="winner">${n1}</span>` : n1;
      const right = p1Won ? n2 : `<span class="winner">${n2}</span>`;

      return `
      <div class="match">
        <div class="who">
          ${left} <span class="muted">vs</span> ${right}
          <span class="badge">${m.sets_won_1}:${m.sets_won_2}</span>
        </div>
        <div class="score">${setStr}</div>
        <div class="date">${fmtDate(m.played_at)}</div>
        <button class="match-del" data-id="${m.id}" title="Obriši meč" aria-label="Obriši meč">✕</button>
      </div>`;
    })
    .join("");

  // Brisanje meča (event delegacija na cijelom popisu).
  list.addEventListener("click", async (e) => {
    const btn = e.target.closest(".match-del");
    if (!btn) return;
    if (!confirm("Obrisati ovaj meč? Ova radnja je trajna.")) return;
    btn.disabled = true;
    const { error } = await sb.from("matches").delete().eq("id", btn.dataset.id);
    if (error) {
      alert("Greška kod brisanja meča. Pokušaj ponovno.");
      btn.disabled = false;
      return;
    }
    btn.closest(".match").remove();
  });
})();

function fmtSet(a, b) {
  if (a === null || b === null || a === undefined || b === undefined) return "";
  return `${a}:${b}`;
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

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
