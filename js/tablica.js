// Izračun i prikaz ligaške tablice.
(async function () {
  const me = await protectPage("tablica");
  if (!me) return;

  const body = document.getElementById("standings-body");

  const [{ data: profiles }, { data: matches }] = await Promise.all([
    sb.from("profiles").select("id, username"),
    sb.from("matches").select("*"),
  ]);

  if (!profiles || profiles.length === 0) {
    body.innerHTML =
      '<tr><td colspan="8" class="empty">Još nema igrača.</td></tr>';
    return;
  }

  // Inicijaliziraj statistiku za svakog igrača.
  const stats = {};
  for (const p of profiles) {
    stats[p.id] = {
      username: p.username,
      played: 0,
      wins: 0,
      losses: 0,
      setsWon: 0,
      setsLost: 0,
      gamesWon: 0,
      gamesLost: 0,
      points: 0,
    };
  }

  for (const m of matches || []) {
    const a = stats[m.player1];
    const b = stats[m.player2];
    if (!a || !b) continue; // profil obrisan

    a.played++;
    b.played++;

    a.setsWon += m.sets_won_1;
    a.setsLost += m.sets_won_2;
    b.setsWon += m.sets_won_2;
    b.setsLost += m.sets_won_1;

    // Gemovi po setovima.
    const g1 =
      (m.p1_set1 || 0) + (m.p1_set2 || 0) + (m.p1_set3 || 0);
    const g2 =
      (m.p2_set1 || 0) + (m.p2_set2 || 0) + (m.p2_set3 || 0);
    a.gamesWon += g1;
    a.gamesLost += g2;
    b.gamesWon += g2;
    b.gamesLost += g1;

    // Bodovi prema formuli: pobjeda 3, poraz 0.
    const p1Won = m.winner === m.player1;
    if (p1Won) {
      a.wins++;
      b.losses++;
      a.points += POINTS.win;
      b.points += POINTS.loss;
    } else {
      b.wins++;
      a.losses++;
      b.points += POINTS.win;
      a.points += POINTS.loss;
    }
  }

  const rows = Object.values(stats).sort((x, y) => {
    // 1) bodovi, 2) razlika setova, 3) razlika gemova.
    if (y.points !== x.points) return y.points - x.points;
    const sdX = x.setsWon - x.setsLost;
    const sdY = y.setsWon - y.setsLost;
    if (sdY !== sdX) return sdY - sdX;
    const gdX = x.gamesWon - x.gamesLost;
    const gdY = y.gamesWon - y.gamesLost;
    if (gdY !== gdX) return gdY - gdX;
    return x.username.localeCompare(y.username);
  });

  // Hero statistike (popuni samo ako kartice postoje na stranici).
  const leaderEl = document.getElementById("stat-leader");
  const matchesEl = document.getElementById("stat-matches");
  const playersEl = document.getElementById("stat-players");
  const setsEl = document.getElementById("stat-sets");
  if (leaderEl) leaderEl.textContent = rows[0] ? rows[0].username : "–";
  if (matchesEl) matchesEl.textContent = (matches || []).length;
  if (playersEl) playersEl.textContent = profiles.length;
  if (setsEl) {
    let totalSets = 0;
    for (const m of matches || [])
      totalSets += (m.sets_won_1 || 0) + (m.sets_won_2 || 0);
    setsEl.textContent = totalSets;
  }

  body.innerHTML = rows
    .map((s, i) => {
      const rank = i + 1;
      const rankClass =
        rank <= 3 ? `rank top${rank}` : "rank";
      const medal = rank === 1 ? "" : "";
      return `
      <tr>
        <td class="${rankClass}">${rank}</td>
        <td class="player">${escapeHtml(s.username)}${medal}</td>
        <td>${s.played}</td>
        <td>${s.wins}</td>
        <td>${s.losses}</td>
        <td>${s.setsWon}:${s.setsLost}</td>
        <td>${s.gamesWon}:${s.gamesLost}</td>
        <td class="pts">${s.points}</td>
      </tr>`;
    })
    .join("");
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
