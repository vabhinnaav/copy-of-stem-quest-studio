import React from "react";
import {
  OrbitCube,
  ReactiveLinesBackdrop,
  TypewriterWordmark,
} from "@/components/OrangeVisuals";
import { ScanGridButton } from "@/components/ScanGridButton";
import {
  dispatchJourneyEvent,
  normalizeJourneyName,
} from "@/lib/journeyContract";
import { ChevronRight, KeyRound, Mail, Search } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";

function Wordmark({ large = false }: { large?: boolean }) {
  return (
    <span
      className={`orange-wordmark ${large ? "text-4xl sm:text-6xl" : "text-xl"}`}
    >
      <span className="stem">STEM</span>
      <span className="quest">QUEST</span>
    </span>
  );
}

export function JourneyLanding({
  onEnter,
}: {
  onEnter: (name: string) => void;
}) {
  const setupRef = useRef<HTMLElement>(null);
  const [name, setName] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const learnerName = normalizeJourneyName(name);
    if (!learnerName) return toast.error("Enter a learner name to continue.");
    onEnter(learnerName);
  };

  return (
    <div className="orange-journey overflow-x-hidden">
      <section className="orange-grid relative min-h-screen overflow-hidden">
        <ReactiveLinesBackdrop className="opacity-80" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Wordmark />
          <nav className="hidden items-center gap-8 text-sm font-semibold text-orange-50/85 md:flex">
            <button
              onClick={() =>
                setupRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Start learning
            </button>
            <a href="#about">About us</a>
            <a href="mailto:hello@stemquest.study">Email</a>
          </nav>
          <div className="w-[142px] shrink-0">
            <ScanGridButton
              label="STEMARCADE"
              padding="9px 12px"
              rounded={0}
              onClick={() => {
                window.location.href = "https://stemquestg-queoopxf.manus.space";
              }}
            />
          </div>
        </header>
        <main className="relative z-10 mx-auto flex min-h-[calc(100vh-84px)] max-w-5xl flex-col items-center justify-center px-5 pb-36 text-center">
          <h1 className="mt-7 max-w-4xl font-serif text-5xl leading-[.92] tracking-[-.06em] text-orange-50 sm:text-7xl">
            Practice with curiosity.
            <br />
            <span className="text-orange-400">Build real understanding.</span>
          </h1>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <button
              onClick={() =>
                setupRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="orange-solid-button flex items-center gap-3 px-6 py-3.5 text-sm"
            >
              Start Learning <ChevronRight className="h-4 w-4" />
            </button>
            <a
              href="#about"
              className="orange-outline-button px-6 py-3.5 text-sm font-semibold"
            >
              About STEMQUEST
            </a>
          </div>
        </main>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#090604] to-transparent" />
      </section>
      <section
        id="about"
        className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[.85fr_1.15fr]"
      >
        <div>
          <h2 className="max-w-md font-serif text-4xl leading-[.95] tracking-[-.05em] text-orange-50">
            A quieter place to sharpen your thinking.
          </h2>
        </div>
        <div className="max-w-2xl space-y-5 text-base leading-7 text-orange-100/80">
          <p>
            Choose a subject, set the challenge, and get direct feedback. Your
            progress stays with this device; add an AI provider only when you
            want extra guidance.
          </p>
          <a
            className="inline-flex items-center gap-2 font-semibold text-orange-300 hover:text-orange-200"
            href="mailto:hello@stemquest.study"
          >
            <Mail className="h-4 w-4" />
            hello@stemquest.study
          </a>
        </div>
      </section>
      <section
        ref={setupRef}
        id="setup"
        className="orange-setup-grid relative min-h-screen overflow-hidden border-y border-orange-200/15 bg-[#100904] px-5 py-20 sm:px-8"
      >
        <div className="absolute right-5 top-5 text-right sm:right-8">
          <Wordmark />
        </div>
        <div className="absolute inset-0 opacity-55">
          <OrbitCube />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_440px] lg:items-center">
          <div>
            <div>
              <TypewriterWordmark />
            </div>
            <p className="mt-6 max-w-xl text-sm font-medium text-orange-100/85">
              Your learning stays on this device.
            </p>
            <button
              onClick={() => dispatchJourneyEvent("openMentorSettings")}
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-orange-200 hover:text-orange-100"
            >
              <KeyRound className="h-4 w-4" />
              Configure AI provider
            </button>
          </div>
          <form
            onSubmit={submit}
            className="border border-orange-200/25 bg-[#160c06]/90 p-6 shadow-[0_24px_90px_rgba(0,0,0,.45)] sm:p-8"
          >
            <h2 className="text-2xl font-bold text-orange-50">
              What should we call you?
            </h2>
            <p className="mt-2 text-sm font-medium text-orange-100/85">
              Use the same name to return to this profile.
            </p>
            <label
              className="mt-7 block text-xs font-bold uppercase tracking-[.12em] text-orange-100/70"
              htmlFor="quest-name"
            >
              Learner name
              <input
                id="quest-name"
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="e.g. Ada"
                className="mt-2 h-12 w-full border border-orange-100/20 bg-black/30 px-4 text-sm text-orange-50 outline-none placeholder:text-orange-100/35 focus:border-orange-400"
              />
            </label>
            <button
              type="submit"
              className="orange-solid-button mt-5 flex w-full items-center justify-center gap-3 px-4 py-3.5 text-sm"
            >
              <Search className="h-4 w-4" />
              Search & enter workspace
            </button>
            <p className="mt-5 border-t border-orange-100/10 pt-4 text-xs font-semibold tracking-[.08em] text-orange-100/70">
              SAVED ON THIS DEVICE
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
