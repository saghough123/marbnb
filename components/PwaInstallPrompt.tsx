"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(ios);

    if (isStandalone()) return;

    const dismissed = localStorage.getItem("mbnb_pwa_dismissed") === "true";
    if (!dismissed) setVisible(true);

    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  }

  function close() {
    localStorage.setItem("mbnb_pwa_dismissed", "true");
    setVisible(false);
  }

  if (!visible || isStandalone()) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-xl rounded-[1.5rem] bg-[#fff8ec] p-4 shadow-2xl ring-1 ring-[#e5d3b3] md:left-auto md:right-5 md:w-[420px]">
      <div className="flex gap-3">
        <img src="/mbnb-logo.png" alt="Logo Mbnb" className="h-12 w-12 rounded-xl object-contain" />
        <div className="flex-1">
          <p className="font-black text-[#0f2f22]">Installer l’application Mbnb</p>
          {isIos ? (
            <p className="mt-1 text-sm text-[#7a6446]">Sur iPhone : touchez Partager puis “Ajouter à l’écran d’accueil”.</p>
          ) : (
            <p className="mt-1 text-sm text-[#7a6446]">Ajoutez Mbnb sur votre écran d’accueil comme une application.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {!isIos && deferredPrompt && <button onClick={install} className="rounded-full bg-[#0f2f22] px-4 py-2 text-sm font-black text-white">Installer</button>}
            <a href="/installation" className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#7a3d14] ring-1 ring-[#e5d3b3]">Guide</a>
            <button onClick={close} className="rounded-full px-4 py-2 text-sm font-black text-[#7a6446]">Plus tard</button>
          </div>
        </div>
      </div>
    </div>
  );
}
