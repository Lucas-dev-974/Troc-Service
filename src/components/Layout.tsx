import { Component, ParentComponent, Show } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { useAuth } from '../contexts/AuthContext';
import InstallPWA from './InstallPWA';

interface LayoutProps {
  children: any;
  showHeader?: boolean;
  showFooter?: boolean;
}

const Layout: ParentComponent<LayoutProps> = (props) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const showHeader = () => props.showHeader !== false;
  const showFooter = () => props.showFooter !== false;

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <Show when={showHeader()}>
        <header class="bg-white border-b border-gray-200 shadow-sm">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex items-center justify-between">
              <A href="/" class="block hover:opacity-80 transition">
                <h1 class="text-3xl font-bold text-gray-900">Troc & Services</h1>
                <p class="text-gray-600 mt-2">Proposez et découvrez des services, objets et nourriture entre particuliers</p>
              </A>
              <div class="flex items-center gap-4">
                <Show when={auth.isAuthenticated()}>
                  <div class="flex items-center gap-3">
                    <A
                      href="/profile"
                      class="text-sm text-gray-700 hover:text-gray-900 transition"
                      aria-label="Voir mon profil"
                    >
                      Bonjour, <span class="font-medium">{auth.user()?.username}</span>
                    </A>
                    <button
                      onClick={() => auth.logout()}
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                      aria-label="Se déconnecter"
                    >
                      Déconnexion
                    </button>
                  </div>
                </Show>
                <Show when={!auth.isAuthenticated()}>
                  <div class="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/login')}
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                      Se connecter
                    </button>
                    <button
                      onClick={() => navigate('/signup')}
                      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                    >
                      S'inscrire
                    </button>
                  </div>
                </Show>
              </div>
            </div>
          </div>
        </header>
      </Show>

      <main class="flex-1">
        {props.children}
      </main>

      <Show when={showFooter()}>
        <footer class="bg-white border-t border-gray-200 mt-16">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p class="text-center text-gray-500 text-sm">
              © 2024 Troc & Services - Plateforme d'échange entre particuliers
            </p>
          </div>
        </footer>
      </Show>

      <InstallPWA />
    </div>
  );
};

export default Layout;

