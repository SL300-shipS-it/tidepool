// Settings Leon edits. Nothing here is secret: anyone can read it in the page source.
export const CONFIG = {
  // Full public URL of the game, with trailing slash. Used for share/restore links and QR codes.
  // Leave "" to use whatever address the page was opened from.
  BASE_URL: "https://sl300-ships-it.github.io/tq/",
  // Game title (CR-018). tools/build_meta.py copies these into index.html (tab title, link preview
  // tags, title screen) and manifest.webmanifest. Rerun it after changing them.
  GAME_TITLE: "TRAINER QUEST: AN ANNIVERSARY ADVENTURE",
  SHORT_TITLE: "TRAINER QUEST",   // Home Screen label (must be short)
  SUBTITLE: "AN ANNIVERSARY ADVENTURE",
  ADMIN_PIN: "9713",
  ADMIN_TAPS: 7,           // taps on the title text to open the PIN prompt
  PARTNER: "GIDGET",
  TEXT_SPEED_MS: 28,       // typewriter delay per character
  SAVE_KEY: "tp_save_v1",
  VERSION: "0.1.3",
  // CR-028: a message from Leon, played once (before the menu/chapter) on the first open on or after
  // `from` (device-local date, YYYY-MM-DD), once the prologue is done. Never during a replay or ?fast=1.
  // The admin panel can preview it without marking it seen.
  LEON_MESSAGE: { scene: "leon_message", from: "2026-10-06" },
  // Deploy-time story switches. Story conditions read them as { "cfg.<name>": true/false }.
  // Change here (not in the admin panel), then validate + deploy. Missing toggles count as false.
  TOGGLES: {
    // false: the prologue lodging pick is real (inn or hideout, shown on the Trainer Card).
    // true: after either pick, GIDGET knocks the other brochure off the table; lodging ends as the inn.
    fakeLodging: false,
    // Offer the coastside dinner as a choice. false = skip straight to the city restaurant list.
    coastsideFeast: true,
  },
};
