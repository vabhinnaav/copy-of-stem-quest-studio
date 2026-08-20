import React from "react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  clearAIConnection,
  defaultAIConnection,
  loadAIConnection,
  saveAIConnection,
  type SessionAIConnection,
} from "@/lib/aiConnection";
import { loadLocalLearner } from "@/lib/localProgress";
import { buildMentorPerformanceContext } from "@/lib/mentorContext";
import { JOURNEY_EVENTS } from "@/lib/journeyContract";
import { trpc } from "@/lib/trpc";
import { Bot, KeyRound, Settings2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function DeviceAIMentor() {
  const [open, setOpen] = useState(() =>
    new URLSearchParams(window.location.search).has("mentorPreview")
  );
  const [settingsOpen, setSettingsOpen] = useState(() =>
    new URLSearchParams(window.location.search).has("mentorSettings")
  );
  const [connection, setConnection] = useState<SessionAIConnection>(() =>
    loadAIConnection()
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Connect an AI provider in Settings, then ask a question.",
    },
  ]);
  const chatMutation = trpc.mentor.chat.useMutation({
    onSuccess: result =>
      setMessages(previous => [
        ...previous,
        { role: "assistant", content: result.reply },
      ]),
    onError: error => toast.error(error.message),
  });
  const connected = connection.apiKey.trim().length >= 10;
  const context = useMemo(
    () => buildMentorPerformanceContext(loadLocalLearner()),
    [open]
  );
  useEffect(() => {
    const openMentor = () => setOpen(true);
    window.addEventListener(JOURNEY_EVENTS.openMentor, openMentor);
    return () =>
      window.removeEventListener(JOURNEY_EVENTS.openMentor, openMentor);
  }, []);
  useEffect(() => {
    const openSettings = () => setSettingsOpen(true);
    window.addEventListener(JOURNEY_EVENTS.openMentorSettings, openSettings);
    return () =>
      window.removeEventListener(
        JOURNEY_EVENTS.openMentorSettings,
        openSettings
      );
  }, []);
  const saveSettings = () => {
    if (!connected)
      return toast.error("Enter an API key before connecting your provider.");
    if (!connection.model.trim())
      return toast.error("Enter the provider model name.");
    if (connection.endpoint && !connection.endpoint.startsWith("https://"))
      return toast.error("Use an HTTPS endpoint for a custom provider URL.");
    saveAIConnection({
      ...connection,
      apiKey: connection.apiKey.trim(),
      model: connection.model.trim(),
      endpoint: connection.endpoint?.trim() || undefined,
    });
    setSettingsOpen(false);
    toast.success("AI connection saved for this browser session only.");
  };
  const sendMessage = (content: string) => {
    if (!connected) {
      setSettingsOpen(true);
      return toast.error("Connect your own provider key before chatting.");
    }
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    chatMutation.mutate({
      connection: {
        ...connection,
        apiKey: connection.apiKey.trim(),
        model: connection.model.trim(),
        endpoint: connection.endpoint?.trim() || undefined,
      },
      performanceContext: context,
      messages: next.slice(-12),
    });
  };
  const providerLabel =
    connection.provider === "gemini"
      ? "GEMINI"
      : connection.provider === "anthropic"
        ? "ANTHROPIC"
        : "OPENAI-COMPATIBLE";
  return (
    <>
      {open && (
        <div className="mentor-layer fixed inset-0 z-50 bg-[#120a04]/80 p-3 backdrop-blur-sm sm:p-6">
          <section className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden border border-orange-100/20 bg-[#160c06] shadow-2xl">
            <header className="flex items-center justify-between border-b border-orange-100/12 p-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center bg-orange-300/12">
                  <Bot className="h-5 w-5 text-orange-200" />
                </div>
                <div>
                  <h2 className="font-bold text-orange-50">
                    Performance-aware AI mentor
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-orange-200">
                    {connected ? providerLabel : "Not connected"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSettingsOpen(value => !value)}
                  className="border-orange-100/15 bg-orange-100/[.04] text-orange-50 hover:bg-orange-100/10 hover:text-white"
                >
                  <Settings2 className="mr-2 h-4 w-4" /> Settings
                </Button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-orange-100/55 hover:bg-orange-100/8 hover:text-white"
                  aria-label="Close AI mentor"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>
            <div className="grid min-h-0 flex-1 lg:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="border-b border-orange-100/12 bg-black/15 p-5 lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-orange-300" />
                  <h3 className="text-sm font-bold text-orange-50">
                    Your AI connection
                  </h3>
                </div>
                <p className="mt-2 text-xs font-medium text-orange-100/80">
                  Session only — never saved to your profile.
                </p>
                <div className="mt-4 border border-orange-100/12 bg-orange-100/[.025] p-3">
                  <p className="text-xs font-semibold text-orange-100/75">
                    Your progress
                  </p>
                  <p className="mt-2 text-sm leading-5 text-orange-100/90">
                    {context}
                  </p>
                </div>
                <Button
                  onClick={() => setSettingsOpen(true)}
                  variant="outline"
                  className="mt-4 w-full border-orange-300/30 bg-orange-300/[.08] text-orange-100 hover:bg-orange-300/[.14] hover:text-white"
                >
                  {connected ? "Edit connection" : "Connect AI provider"}
                </Button>
              </aside>
              <div className="min-h-0 p-3 sm:p-5">
                <AIChatBox
                  messages={messages}
                  onSendMessage={sendMessage}
                  isLoading={chatMutation.isPending}
                  height="100%"
                  placeholder={
                    connected
                      ? "Ask a question…"
                      : "Connect a provider to chat…"
                  }
                  className="h-full border-orange-100/15 bg-black/20"
                />
              </div>
            </div>
          </section>
        </div>
      )}
      {settingsOpen && (
        <div className="mentor-settings fixed inset-0 z-[60] grid place-items-center bg-[#120a04]/80 p-4 backdrop-blur-sm">
          <section className="orange-dialog w-full max-w-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  Bring your own AI provider
                </h2>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                aria-label="Close provider settings"
                className="rounded-lg p-2 text-orange-100/55 hover:bg-orange-100/8"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm font-medium text-orange-100/80">
              Gemini, Claude, or an OpenAI-compatible endpoint.
            </p>
            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="text-xs font-semibold tracking-[.08em] text-orange-100/85">
                  PROVIDER
                </span>
                <select
                  value={connection.provider}
                  onChange={event =>
                    setConnection(current => ({
                      ...current,
                      provider: event.target
                        .value as SessionAIConnection["provider"],
                      model:
                        event.target.value === "gemini"
                          ? "gemini-3.6-flash"
                          : event.target.value === "anthropic"
                            ? "claude-3-5-haiku-latest"
                            : current.model,
                      endpoint:
                        event.target.value === "openai_compatible"
                          ? current.endpoint
                          : undefined,
                    }))
                  }
                  className="mt-1.5 h-11 w-full border border-orange-100/20 bg-black/25 px-3 text-sm text-orange-50"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="openai_compatible">
                    OpenAI-compatible provider
                  </option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold tracking-[.08em] text-orange-100/85">
                  API KEY
                </span>
                <Input
                  type="password"
                  value={connection.apiKey}
                  onChange={event =>
                    setConnection(current => ({
                      ...current,
                      apiKey: event.target.value,
                    }))
                  }
                  placeholder="Paste your provider key"
                  className="mt-1.5 h-11 border-orange-100/20 bg-black/25 text-orange-50 placeholder:text-orange-100/35"
                  autoComplete="off"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold tracking-[.08em] text-orange-100/85">
                  MODEL
                </span>
                <Input
                  value={connection.model}
                  onChange={event =>
                    setConnection(current => ({
                      ...current,
                      model: event.target.value,
                    }))
                  }
                  placeholder={
                    connection.provider === "gemini"
                      ? "gemini-3.6-flash"
                      : "provider model name"
                  }
                  className="mt-1.5 h-11 border-orange-100/20 bg-black/25 text-orange-50 placeholder:text-orange-100/35"
                />
              </label>
              {connection.provider !== "gemini" && (
                <label className="block">
                  <span className="text-xs font-semibold tracking-[.08em] text-orange-100/85">
                    OPTIONAL HTTPS API ENDPOINT
                  </span>
                  <Input
                    value={connection.endpoint ?? ""}
                    onChange={event =>
                      setConnection(current => ({
                        ...current,
                        endpoint: event.target.value,
                      }))
                    }
                    placeholder={
                      connection.provider === "anthropic"
                        ? "https://api.anthropic.com/v1/messages"
                        : "https://provider.example/v1/chat/completions"
                    }
                    className="mt-1.5 h-11 border-orange-100/20 bg-black/25 text-orange-50 placeholder:text-orange-100/35"
                  />
                </label>
              )}
            </div>
            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  clearAIConnection();
                  setConnection(defaultAIConnection);
                  toast.success("Session AI connection removed.");
                }}
                className="text-orange-100/55 hover:bg-orange-100/8 hover:text-white"
              >
                Clear session key
              </Button>
              <button
                onClick={saveSettings}
                className="orange-solid-button px-4 py-2.5 text-sm"
              >
                Save session connection
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
