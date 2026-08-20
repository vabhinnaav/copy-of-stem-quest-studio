import React from "react";
import LightBloom from "@/components/LightBloom";
import RotatingText from "@/components/RotatingText";
import ZoomTextTunnel from "@/components/ZoomTextTunnel";

const PLAY_URL = "https://stemquestg-queoopxf.manus.space";
const EMAIL = "atharvadeshpande2502@gmail.com";

export default function StemarcadePromo() {
  return (
    <main className="stemarcade-promo" aria-label="STEMARCADE">
      <div className="stemarcade-promo-bloom" aria-hidden="true">
        <LightBloom background="#000000" baseColor="#2DB100" accentColor="#EFE6FF" />
      </div>
      <header className="stemarcade-promo-nav">
        <a className="stemarcade-promo-wordmark" href="/">
          <span>STEM</span><strong>QUEST</strong>
        </a>
        <nav aria-label="STEMARCADE promotion navigation">
          <a href={PLAY_URL}>Start Playing</a>
          <a href="#about">About us</a>
          <a href={`mailto:${EMAIL}`}>Email</a>
        </nav>
      </header>
      <section className="stemarcade-promo-hero">
        <div className="stemarcade-promo-title">
          <RotatingText prefix="STEM" texts={["ARCADE"]} auto={false} color="#111111" prefixColor="#ffffff" badgeBackground="#ff7a18" badgeRadius={999} badgePaddingX={18} badgePaddingY={6} gap={10} font={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: "clamp(3.3rem, 11vw, 9rem)", fontWeight: 800, letterSpacing: "-0.07em", lineHeight: ".9em", textAlign: "center" }} />
        </div>
        <a className="stemarcade-promo-email" href={`mailto:${EMAIL}`}>{EMAIL}</a>
        <div className="stemarcade-promo-text-tunnel">
          <ZoomTextTunnel />
        </div>
      </section>
      <section id="about" className="stemarcade-promo-about">
        <p className="stemarcade-promo-kicker">A different way to practice</p>
        <h1>Tired of all the quizzes on STEMQUEST? <span>We bring to you STEMARCADE.</span></h1>
        <div className="stemarcade-promo-copy">
          <p>Step away from the usual question cards and enter a playable space for physics, chemistry, math, and coding. Think through the challenge, solve it in motion, and play your way toward a stronger STEM instinct.</p>
          <p>The arcade is designed as a focused detour—not a replacement for your learning workspace—so you can return to practice whenever you are ready.</p>
        </div>
        <a className="stemarcade-promo-cta" href={PLAY_URL}>Take me there <span aria-hidden="true">↗</span></a>
      </section>
    </main>
  );
}
