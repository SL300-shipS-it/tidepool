// Stub / example minigame: tap N times before the timer runs out.
// params: { taps: 10, seconds: 5 }
export async function play(ctx) {
  const need = Math.max(1, Number(ctx.params.taps) || 10);
  const secs = Math.max(1, Number(ctx.params.seconds) || 5);
  let count = 0, started = 0, msg = "GET READY";

  // Draw over the scene background at the stage's logical (pixel-art) resolution.
  ctx.draw((g, t) => {
    const { W, H } = ctx.size();
    const left = started ? Math.max(0, secs - (performance.now() - started) / 1000) : secs;
    g.fillStyle = "#303838";
    g.font = "8px PressStart";
    g.textAlign = "center";
    g.fillText(msg, W / 2, 16);
    g.fillText(`${count}/${need}`, W / 2, H / 2);
    g.fillText(left.toFixed(1) + "s", W / 2, H / 2 + 14);
    const bw = W - 20;
    g.strokeStyle = "#303838"; g.strokeRect(10.5, H - 20.5, bw, 8);
    g.fillRect(12, H - 19, Math.round((bw - 3) * Math.min(1, count / need)), 5);
    g.textAlign = "start";
  });

  // A full-size transparent tap target over the stage.
  const pad = document.createElement("button");
  pad.setAttribute("aria-label", "Tap");
  Object.assign(pad.style, { position: "absolute", inset: "0", width: "100%", height: "100%", background: "transparent",
    border: "0", padding: "0", touchAction: "manipulation", cursor: "pointer" });
  ctx.container.appendChild(pad);

  for (const m of ["3", "2", "1"]) { msg = m; ctx.sfx("blip"); await ctx.sleep(600); }
  msg = "TAP TAP TAP!";
  started = performance.now();

  const won = await new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), secs * 1000);
    pad.onpointerdown = (e) => {
      e.preventDefault();
      count++;
      ctx.sfx("move");
      if (count >= need) { clearTimeout(timer); resolve(true); }
    };
  });
  pad.onpointerdown = null;
  msg = won ? "NICE!" : "TIME!";
  ctx.sfx(won ? "victory" : "fail");
  await ctx.sleep(900);
  return { won, score: count };
}
