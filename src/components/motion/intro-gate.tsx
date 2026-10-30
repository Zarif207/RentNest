export const INTRO_SEEN_KEY = "rn-intro-seen";

// Runs while the HTML is parsed, before the intro overlay paints: marks <html>
// when the intro already played this session, motion is reduced, or the
// screen is phone-sized (phones get the hero straight away: a full-screen
// intro there delays the first meaningful paint), and a CSS rule in
// globals.css then hides the overlay so it never flashes.
const script = `try{if(sessionStorage.getItem("${INTRO_SEEN_KEY}")||matchMedia("(prefers-reduced-motion: reduce), (max-width: 767px)").matches)document.documentElement.dataset.introSeen=""}catch(e){document.documentElement.dataset.introSeen=""}`;

/** Server-rendered companion to IntroPreloader; place it just before it. */
export function IntroGate() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <noscript>
        <style>
          {"[data-intro]{display:none}[data-split] [data-word]{transform:none!important}[data-enter]{opacity:1!important}"}
        </style>
      </noscript>
    </>
  );
}
