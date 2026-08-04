"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

const DISMISS_STORAGE_KEY = "tomeet-install-prompt-dismissed-at";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

type InstallEnvironment = "ios" | "android" | "edge-android";

function wasRecentlyDismissed() {
  try {
    const dismissedAt = Number(window.localStorage.getItem(DISMISS_STORAGE_KEY));
    return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
  } catch {
    // The prompt still works when storage is unavailable (for example, private mode).
  }
}

function isRunningStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    Boolean((window.navigator as NavigatorWithStandalone).standalone) ||
    document.referrer.startsWith("android-app://")
  );
}

function getInstallEnvironment(userAgent: string): InstallEnvironment | null {
  const isiOSDevice =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (userAgent.includes("Macintosh") && window.navigator.maxTouchPoints > 1);

  if (isiOSDevice) return "ios";
  if (!/Android/i.test(userAgent)) return null;
  if (/EdgA\//i.test(userAgent)) return "edge-android";
  return "android";
}

export default function InstallAppPrompt() {
  const copy = useTranslations("installApp");
  const [isVisible, setIsVisible] = useState(false);
  const [environment, setEnvironment] = useState<InstallEnvironment | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const detectedEnvironment = getInstallEnvironment(userAgent);
    const standalone = isRunningStandalone();

    if ("serviceWorker" in window.navigator) {
      void window.navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
        .catch(() => undefined);
    }

    document.documentElement.classList.toggle("pwa-standalone", standalone);
    const canShow = detectedEnvironment && !standalone && !wasRecentlyDismissed();
    const revealTimer = canShow
      ? window.setTimeout(() => {
          setEnvironment(detectedEnvironment);
          setIsVisible(true);
        }, 1200)
      : undefined;

    const handleBeforeInstallPrompt = (event: Event) => {
      if (!detectedEnvironment) return;

      event.preventDefault();

      if (detectedEnvironment !== "edge-android") {
        setInstallPrompt(event as BeforeInstallPromptEvent);
      }

      if (!isRunningStandalone() && !wasRecentlyDismissed()) {
        setEnvironment(detectedEnvironment);
        setIsVisible(true);
      }
    };

    const handleInstalled = () => {
      setIsVisible(false);
      setInstallPrompt(null);
      document.documentElement.classList.add("pwa-standalone");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      if (revealTimer !== undefined) window.clearTimeout(revealTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const dismiss = () => {
    rememberDismissal();
    setIsVisible(false);
  };

  const install = async () => {
    if (environment === "edge-android") {
      setShowInstructions(true);
      return;
    }

    if (!installPrompt) {
      setShowInstructions(true);
      return;
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setIsVisible(false);
      }
    } catch {
      setShowInstructions(true);
    }

    setInstallPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <aside className="install-app-prompt" aria-labelledby="install-app-title">
      {showInstructions ? (
        <p id="install-app-title" className="install-app-instruction">
          {environment === "ios"
            ? copy("iosInstruction")
            : environment === "edge-android"
              ? copy("edgeInstruction")
              : copy("androidInstruction")}
        </p>
      ) : (
        <p id="install-app-title" className="install-app-copy">
          <strong>{copy("title")}</strong>
          <span>{copy("description")}</span>
        </p>
      )}

      {!showInstructions ? (
        <button type="button" className="install-app-action" onClick={install}>
          {installPrompt && environment !== "edge-android"
            ? copy("install")
            : copy("showSteps")}
        </button>
      ) : null}

      <button
        type="button"
        className="install-app-dismiss"
        onClick={dismiss}
        aria-label={copy("dismiss")}
      >
        <X size={17} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </aside>
  );
}
