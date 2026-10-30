export const INTRO_SEEN_KEY = "rn-intro-seen";

// Loaded by the root layout with next/script (beforeInteractive), so it runs
// before the intro overlay paints and React never renders a <script> tag.
// Marks <html>
// when the intro already played this session, motion is reduced, or the
// screen is phone-sized (phones get the hero straight away: a full-screen
// intro there delays the first meaningful paint), and a CSS rule in
// globals.css then hides the overlay so it never flashes.
export const INTRO_GATE_SCRIPT = `try{if(sessionStorage.getItem("${INTRO_SEEN_KEY}")||matchMedia("(prefers-reduced-motion: reduce), (max-width: 767px)").matches)document.documentElement.dataset.introSeen=""}catch(e){document.documentElement.dataset.introSeen=""}`;

/** No-JavaScript fallback for IntroPreloader: hide the overlay, show the hero text. */
export function IntroGate() {
  return (
    <noscript>
      <style>
        {"[data-intro]{display:none}[data-split] [data-word]{transform:none!important}[data-enter]{opacity:1!important}"}
      </style>
    </noscript>
  );
}
