import { Component, createSignal, onMount, Show } from 'solid-js';
import { useNavigate, useSearchParams } from '@solidjs/router';
import Layout from '../components/Layout';
import { apiService } from '../services/api';

const VerifyEmailPage: Component = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal(false);

  onMount(async () => {
    const token = searchParams.token;
    if (!token) {
      setError('Token de vérification manquant');
      return;
    }

    await verifyEmail(token);
  });

  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.verifyEmail(token);
      setSuccess(true);
    } catch (err: any) {
      console.error('Error verifying email:', err);
      const errorMessage = err?.message || 'Erreur lors de la vérification de l\'email. Veuillez réessayer.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div class="text-center">
              <Show when={isLoading()}>
                <div class="mb-4">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Vérification en cours...</h2>
                <p class="mt-2 text-gray-600">Veuillez patienter pendant que nous vérifions votre email.</p>
              </Show>

              <Show when={!isLoading() && success()}>
                <div class="mb-4">
                  <svg
                    class="mx-auto h-12 w-12 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Email vérifié avec succès !</h2>
                <p class="mt-2 text-gray-600">Votre adresse email a été vérifiée. Vous pouvez maintenant utiliser toutes les fonctionnalités de la plateforme.</p>
                <button
                  onClick={() => navigate('/')}
                  class="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Aller à l'accueil
                </button>
              </Show>

              <Show when={!isLoading() && !success() && error()}>
                <div class="mb-4">
                  <svg
                    class="mx-auto h-12 w-12 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-900">Erreur de vérification</h2>
                <p class="mt-2 text-gray-600">{error()}</p>
                <div class="mt-6 space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Aller à la connexion
                  </button>
                  <p class="text-sm text-gray-600 text-center">
                    Le lien a expiré ?{' '}
                    <button
                      onClick={() => navigate('/resend-verification')}
                      class="text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Renvoyer l'email de vérification
                    </button>
                  </p>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmailPage;

