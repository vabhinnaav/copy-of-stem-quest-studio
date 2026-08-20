import React from "react";
import {
  clearLocalLearner,
  createLocalLearner,
  loadLocalLearner,
  signOutLocalLearner,
  type LocalLearner,
} from "@/lib/localProgress";
import { JOURNEY_EVENTS } from "@/lib/journeyContract";
import { LogOut, Trash2, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";

export function DeviceProfileManager() {
  const previewMode = new URLSearchParams(window.location.search).has(
    "profilePreview"
  );
  const [open, setOpen] = useState(() => previewMode);
  const [learner, setLearner] = useState<LocalLearner>(() => {
    const stored = loadLocalLearner();
    return stored.name || !previewMode
      ? stored
      : createLocalLearner("Profile preview");
  });

  useEffect(() => {
    const sync = () => setLearner(loadLocalLearner());
    window.addEventListener("stem-profile-updated", sync);
    return () => window.removeEventListener("stem-profile-updated", sync);
  }, []);

  useEffect(() => {
    const openManager = () => {
      const current = loadLocalLearner();
      setLearner(current);
      if (current.name) setOpen(true);
    };
    window.addEventListener(JOURNEY_EVENTS.openProfile, openManager);
    return () =>
      window.removeEventListener(JOURNEY_EVENTS.openProfile, openManager);
  }, []);

  if (!learner.name) return null;

  const switchLearner = () => {
    signOutLocalLearner();
    window.location.reload();
  };

  const deleteLearner = () => {
    if (
      !window.confirm(
        `Delete ${learner.name}'s local STEM progress from this device? This cannot be undone.`
      )
    )
      return;
    clearLocalLearner();
    window.location.reload();
  };

  return open ? (
    <div className="profile-manager fixed inset-0 z-[70] grid place-items-center bg-[#120a04]/80 p-5 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Manage learner profile"
        className="orange-dialog w-full max-w-sm p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono-quest text-[10px] tracking-[.14em] text-orange-300">
              DEVICE-LOCAL PROFILE
            </p>
            <h2 className="mt-2 text-xl font-extrabold text-white">
              {learner.name}
            </h2>
            <p className="mt-1 text-sm text-orange-100/60">
              {learner.totalXp} XP · {learner.streak} day streak
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close profile"
            className="rounded-lg p-2 text-orange-100/55 hover:bg-orange-200/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-6 text-sm font-medium leading-6 text-orange-100/85">
          Switch learners without losing progress. Deleting removes this
          profile.
        </p>
        <div className="mt-6 grid gap-3">
          <button
            onClick={switchLearner}
            className="orange-solid-button flex items-center justify-center gap-2 px-4 py-3 text-sm"
          >
            <LogOut className="h-4 w-4" />
            Switch learner
          </button>
          <button
            onClick={deleteLearner}
            className="flex items-center justify-center gap-2 border border-orange-200/30 bg-orange-100/5 px-4 py-3 text-sm font-bold text-orange-100 hover:bg-orange-100/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete this learner profile
          </button>
        </div>
      </section>
    </div>
  ) : null;
}
