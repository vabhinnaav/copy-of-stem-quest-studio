import React, { useState } from "react";
import GalleryTunnel from "@/components/GalleryTunnel";
import StemConceptDeck from "@/components/StemConceptDeck";
import { useLocation } from "wouter";

const SUBJECT_GAMES = {
  physics: {
    title: "Physics · Trajectory Lab",
    source: "/manus-storage/physics-trajectory-lab_a746b643.html",
  },
  chemistry: {
    title: "Chemistry · Balance Lab",
    source: "/manus-storage/chemistry-equation-balancer_13d4587e.html",
  },
  math: {
    title: "Math · Graph Detective",
    source: "/manus-storage/math-graph-detective_bcc6c109.html",
  },
  coding: {
    title: "Coding · Challenge Arena",
    source: "/manus-storage/coding-challenge-arena_fc7cdf74.html",
  },
} as const;

const subjectToSlug: Record<string, keyof typeof SUBJECT_GAMES> = {
  Physics: "physics",
  Chemistry: "chemistry",
  Math: "math",
  Coding: "coding",
};

export default function Stemarcade() {
  const [location, setLocation] = useLocation();
  const [returning, setReturning] = useState(false);
  const [enteringGame, setEnteringGame] = useState(false);
  const [deckOpen, setDeckOpen] = useState(() =>
    new URLSearchParams(window.location.search).has("deckPreview")
  );
  const routeShowsDeck = new URLSearchParams(window.location.search).has(
    "deckPreview"
  );
  const revealedDeck = deckOpen || routeShowsDeck;
  const renderTunnel = !routeShowsDeck;
  const gameSlug = window.location.pathname.split(
    "/"
  )[2] as keyof typeof SUBJECT_GAMES;
  const game = SUBJECT_GAMES[gameSlug];

  const returnToWorkspace = () => {
    if (returning) return;
    setReturning(true);
    const returnPath =
      window.sessionStorage.getItem("stemarcade-return-path") || "/";
    window.setTimeout(() => setLocation(returnPath), 260);
  };

  const openSubjectGame = (subject: string) => {
    const slug = subjectToSlug[subject];
    if (!slug || enteringGame) return;
    setEnteringGame(true);
    window.setTimeout(() => setLocation(`/stemarcade/${slug}`), 340);
  };

  const returnToDeck = () => {
    setDeckOpen(true);
    setLocation("/stemarcade?deckPreview=1");
  };

  if (game) {
    return (
      <main className="stemarcade-game-page" aria-label={game.title}>
        {returning && (
          <div className="stemarcade-return-transition" aria-hidden="true" />
        )}
        <nav className="stemarcade-game-nav" aria-label="Game navigation">
          <button
            className="stemarcade-game-control stemarcade-game-control-primary"
            type="button"
            onClick={returnToDeck}
          >
            <span aria-hidden="true">←</span>
            <span>Back to arcade</span>
          </button>
          <button
            className="stemarcade-game-control"
            type="button"
            onClick={returnToWorkspace}
          >
            <span aria-hidden="true">⌂</span>
            <span>Learning workspace</span>
          </button>
        </nav>
        <iframe
          className="stemarcade-game-frame"
          src={game.source}
          title={game.title}
        />
      </main>
    );
  }

  return (
    <main className="stemarcade-page" aria-label="STEMARCADE">
      {returning && (
        <div className="stemarcade-return-transition" aria-hidden="true" />
      )}
      {enteringGame && (
        <div className="stemarcade-game-transition" aria-hidden="true" />
      )}
      <button
        className="stemarcade-return"
        type="button"
        onClick={returnToWorkspace}
      >
        <span aria-hidden="true">←</span>
        Back to workspace
      </button>
      {renderTunnel && (
        <div
          className={`stemarcade-tunnel-layer ${revealedDeck ? "is-revealed" : ""}`}
        >
          <GalleryTunnel onHoldComplete={() => setDeckOpen(true)} />
        </div>
      )}
      <div
        className={`stemarcade-deck-layer ${revealedDeck ? "is-revealed" : ""}`}
      >
        <StemConceptDeck onSelect={openSubjectGame} />
      </div>
    </main>
  );
}
