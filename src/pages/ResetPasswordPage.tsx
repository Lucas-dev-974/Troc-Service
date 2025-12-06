import { Component, createSignal, onMount, Show } from 'solid-js';
import { useNavigate, useSearchParams } from '@solidjs/router';
import Layout from '../components/Layout';
import { apiService } from '../services/api';

const ResetPasswordPage: Component = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [isVerifying, setIsVerifying] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal(false);
  const [tokenValid, setTokenValid] = createSignal(false);

  onMount(async () => {
    const token = searchParams.token;
    if (!token) {
      setError('Token de réinitialisation manquant');
      setIsVerifying(false);
      return;
    }

    await verifyToken(token);
  });

  const verifyToken = async (token: string) => {
    setIsVerifying(true);
    try {
      const result = await apiService.verifyPasswordResetToken(token);
      setTokenValid(result.valid);
      if (!result.valid) {
        setError('Le lien de réinitialisation est invalide ou a expiré');
      }
    } catch (err: any) {
      console.error('Error verifying token:', err);
      setError('Erreur lors de la vérification du token');
      setTokenValid(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const token = searchParams.token;
    if (!token) {
      setError('Token de réinitialisation manquant');
      return;
    }

    if (!password()) {
      setError('Veuillez entrer un nouveau mot de passe');
      return;
    }

    if (password().length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password() !== confirmPassword()) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.resetPassword(token, password());
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Error resetting password:', err);
      const errorMessage = err?.message || 'Erreur lors de la réinitialisation du mot de passe. Veuillez réessayer.';
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
              <h2 class="text-2xl font-bold text-gray-900">Réinitialiser le mot de passe</h2>
            </div>

            <Show when={isVerifying()}>
              <div class="mt-8 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p class="mt-4 text-gray-600">Vérification du lien...</p>
              </div>
            </Show>

            <Show when={!isVerifying() && !tokenValid()}>
              <div class="mt-8">
                <div class="rounded-md bg-red-50 p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm text-red-800">{error()}</p>
                    </div>
                  </div>
                </div>
                <div class="mt-4 text-center">
                  <button
                    onClick={() => navigate('/forgot-password')}
                    class="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Demander un nouveau lien
                  </button>
                </div>
              </div>
            </Show>

            <Show when={!isVerifying() && tokenValid()}>
              <form class="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label for="password" class="block text-sm font-medium text-gray-700">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password()}
                    onInput={(e) => setPassword(e.currentTarget.value)}
                    class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Minimum 6 caractères"
                    disabled={isLoading()}
                  />
                </div>

                <div>
                  <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword()}
                    onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                    class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Répétez le mot de passe"
                    disabled={isLoading()}
                  />
                </div>

                <Show when={error()}>
                  <div class="rounded-md bg-red-50 p-4">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </div>
                      <div class="ml-3">
                        <p class="text-sm text-red-800">{error()}</p>
                      </div>
                    </div>
                  </div>
                </Show>

                <Show when={success()}>
                  <div class="rounded-md bg-green-50 p-4">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </div>
                      <div class="ml-3">
                        <p class="text-sm text-green-800">
                          Votre mot de passe a été réinitialisé avec succès. Redirection vers la page de connexion...
                        </p>
                      </div>
                    </div>
                  </div>
                </Show>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading() || success()}
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading() ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                  </button>
                </div>
              </form>
            </Show>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;

