import React, { useState } from "react";
import GalleryTunnel from "@/components/GalleryTunnel";
import { useLocation } from "wouter";

export default function Stemarcade() {
  const [, setLocation] = useLocation();
  const [returning, setReturning] = useState(false);

  const returnToWorkspace = () => {
    if (returning) return;
    setReturning(true);
    const returnPath =
      window.sessionStorage.getItem("stemarcade-return-path") || "/";
    window.setTimeout(() => setLocation(returnPath), 260);
  };

  return (
    <main className="stemarcade-page" aria-label="STEMARCADE">
      {returning && (
        <div className="stemarcade-return-transition" aria-hidden="true" />
      )}
      <button
        className="stemarcade-return"
        type="button"
        onClick={returnToWorkspace}
      >
        <span aria-hidden="true">←</span>
        Back to workspace
      </button>
      <GalleryTunnel />
    </main>
  );
}
