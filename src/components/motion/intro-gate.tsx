export const INTRO_SEEN_KEY = "rn-intro-seen";

// Runs while the HTML is parsed, before the intro overlay paints: marks <html>
// when the intro already played this session or motion is reduced, and a CSS
// rule in globals.css then hides the overlay so it never flashes.
const script = `try{if(sessionStorage.getItem("${INTRO_SEEN_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.introSeen=""}catch(e){document.documentElement.dataset.introSeen=""}`;

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
