import { Component, createSignal, Show, onMount } from 'solid-js';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
        appinstalled: Event;
    }
}

const InstallPWA: Component = () => {
    const [deferredPrompt, setDeferredPrompt] = createSignal<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = createSignal(false);
    const [showInstallButton, setShowInstallButton] = createSignal(false);

    onMount(() => {
        console.log('[PWA] InstallPWA component mounted');

        // Vérifier si l'app est déjà installée
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        console.log('[PWA] Is standalone:', isStandalone);

        if (isStandalone) {
            setIsInstalled(true);
            console.log('[PWA] App is already installed');
            return;
        }

        // Vérifier le service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then((registration) => {
                console.log('[PWA] Service Worker registration:', registration ? 'Found' : 'Not found');
                if (registration) {
                    console.log('[PWA] Service Worker state:', registration.active?.state);
                }
            });
        }

        // Écouter l'événement beforeinstallprompt
        const handleBeforeInstallPrompt = (e: Event) => {
            console.log('[PWA] beforeinstallprompt event fired');
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowInstallButton(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Vérifier si l'app a été installée après le prompt
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed event fired');
            setIsInstalled(true);
            setShowInstallButton(false);
            setDeferredPrompt(null);
        });

        // Log après un délai pour voir si l'événement arrive
        setTimeout(() => {
            console.log('[PWA] Deferred prompt after 3s:', deferredPrompt() ? 'Available' : 'Not available');
            console.log('[PWA] Show install button:', showInstallButton());
            console.log('[PWA] Is installed:', isInstalled());
        }, 3000);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    });

    const handleInstallClick = async () => {
        const prompt = deferredPrompt();
        if (!prompt) {
            return;
        }

        // Afficher le prompt d'installation
        await prompt.prompt();

        // Attendre la réponse de l'utilisateur
        const { outcome } = await prompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
            setShowInstallButton(false);
        }

        // Réinitialiser le prompt
        setDeferredPrompt(null);
    };

    return (
        <Show when={showInstallButton() && !isInstalled()}>
            <div class="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
                <div class="flex items-center gap-2">
                    <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                    </svg>
                    <span class="text-sm font-medium">Installer l'application</span>
                </div>
                <button
                    onClick={handleInstallClick}
                    class="bg-white text-blue-600 px-4 py-1.5 rounded font-medium hover:bg-blue-50 transition text-sm"
                    aria-label="Installer l'application Troc & Services"
                >
                    Installer
                </button>
                <button
                    onClick={() => setShowInstallButton(false)}
                    class="text-white hover:text-blue-200 transition"
                    aria-label="Fermer"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </Show>
    );
};

export default InstallPWA;

