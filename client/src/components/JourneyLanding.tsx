import React from "react";
import { OrbitCube, ReactiveLinesBackdrop, TypewriterWordmark } from "@/components/OrangeVisuals";
import { dispatchJourneyEvent, normalizeJourneyName } from "@/lib/journeyContract";
import { ChevronRight, KeyRound, Mail, Search } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";

function Wordmark({ large = false }: { large?: boolean }) {
  return <span className={`orange-wordmark ${large ? "text-4xl sm:text-6xl" : "text-xl"}`}><span className="stem">STEM</span><span className="quest">QUEST</span></span>;
}

export function JourneyLanding({ onEnter }: { onEnter: (name: string) => void }) {
  const setupRef = useRef<HTMLElement>(null);
  const [name, setName] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const learnerName = normalizeJourneyName(name);
    if (!learnerName) return toast.error("Enter a learner name to continue.");
    onEnter(learnerName);
  };

  return <div className="orange-journey overflow-x-hidden">
    <section className="orange-grid relative min-h-screen overflow-hidden">
      <ReactiveLinesBackdrop className="opacity-80" />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Wordmark />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-orange-50/85 md:flex"><button onClick={() => setupRef.current?.scrollIntoView({ behavior: "smooth" })}>Start learning</button><a href="#about">About us</a><a href="mailto:hello@stemquest.study">Email</a></nav>
        <button onClick={() => setupRef.current?.scrollIntoView({ behavior: "smooth" })} className="orange-outline-button px-4 py-2 text-sm font-semibold">Begin</button>
      </header>
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-84px)] max-w-5xl flex-col items-center justify-center px-5 pb-36 text-center">
        <p className="rounded-full border border-orange-200/30 bg-orange-100/5 px-3 py-1 font-mono-quest text-[10px] tracking-[.16em] text-orange-100">PERSONAL STEM LEARNING</p>
        <h1 className="mt-7 max-w-4xl font-serif text-5xl leading-[.92] tracking-[-.06em] text-orange-50 sm:text-7xl">Practice with curiosity.<br /><span className="text-orange-400">Build real understanding.</span></h1>
        <p className="mt-7 max-w-2xl text-base leading-7 text-orange-100/72 sm:text-lg">A focused, device-local STEM studio that generates fresh challenges, explains your answers, and keeps your learning momentum visible.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3"><button onClick={() => setupRef.current?.scrollIntoView({ behavior: "smooth" })} className="orange-solid-button flex items-center gap-3 px-6 py-3.5 text-sm">Start Learning <ChevronRight className="h-4 w-4" /></button><a href="#about" className="orange-outline-button px-6 py-3.5 text-sm font-semibold">About STEMQUEST</a></div>
      </main>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#090604] to-transparent" />
    </section>
    <section id="about" className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[.85fr_1.15fr]"><div><p className="font-mono-quest text-[10px] tracking-[.18em] text-orange-300">ABOUT US</p><h2 className="mt-4 max-w-md font-serif text-4xl leading-[.95] tracking-[-.05em] text-orange-50">A quieter place to sharpen your thinking.</h2></div><div className="max-w-2xl space-y-5 text-base leading-7 text-orange-100/65"><p>STEMQUEST turns deliberate practice into a personal learning routine. Pick the area you want to explore, set the right level of difficulty, and receive direct feedback designed to make the concept stick.</p><p>Your progress stays with the learner profile on this device. Connect an AI provider only when you want the extra guidance of a tutor or follow-up explanation.</p><a className="inline-flex items-center gap-2 font-semibold text-orange-300 hover:text-orange-200" href="mailto:hello@stemquest.study"><Mail className="h-4 w-4" />hello@stemquest.study</a></div></section>
    <section ref={setupRef} id="setup" className="orange-setup-grid relative min-h-screen overflow-hidden border-y border-orange-200/15 bg-[#100904] px-5 py-20 sm:px-8"><div className="absolute right-5 top-5 text-right sm:right-8"><Wordmark /></div><div className="absolute inset-0 opacity-55"><OrbitCube /></div><div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_440px] lg:items-center"><div><p className="font-mono-quest text-[10px] tracking-[.18em] text-orange-300">YOUR LEARNING CONSOLE</p><div className="mt-6"><TypewriterWordmark /></div><p className="mt-7 max-w-xl text-base leading-7 text-orange-100/65">Set up a name that restores this learner’s device-local history. You can optionally attach your own AI provider key for chat, evaluation, and deeper explanations.</p><button onClick={() => dispatchJourneyEvent("openMentorSettings")} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-orange-200 hover:text-orange-100"><KeyRound className="h-4 w-4" />Configure AI provider</button></div><form onSubmit={submit} className="border border-orange-200/25 bg-[#160c06]/90 p-6 shadow-[0_24px_90px_rgba(0,0,0,.45)] sm:p-8"><p className="font-mono-quest text-[10px] tracking-[.16em] text-orange-300">ENTER LEARNING SPACE</p><h2 className="mt-3 text-2xl font-bold text-orange-50">What should we call you?</h2><p className="mt-2 text-sm leading-6 text-orange-100/60">Use the same name later to restore this learner’s progress in this browser.</p><label className="mt-7 block text-xs font-bold uppercase tracking-[.12em] text-orange-100/70" htmlFor="quest-name">Learner name<input id="quest-name" value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Ada" className="mt-2 h-12 w-full border border-orange-100/20 bg-black/30 px-4 text-sm text-orange-50 outline-none placeholder:text-orange-100/35 focus:border-orange-400" /></label><button type="submit" className="orange-solid-button mt-5 flex w-full items-center justify-center gap-3 px-4 py-3.5 text-sm"><Search className="h-4 w-4" />Search & enter workspace</button><p className="mt-5 border-t border-orange-100/10 pt-4 text-xs leading-5 text-orange-100/45">No login. No cloud database. This browser keeps each learner profile separately.</p></form></div></section>
  </div>;
}
