import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import Layout from '../components/Layout';
import { apiService } from '../services/api';
import { isValidEmail } from '../utils/validation';

const ForgotPasswordPage: Component = () => {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email()) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    if (!isValidEmail(email())) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.forgotPassword(email());
      setSuccess(true);
    } catch (err: any) {
      console.error('Error requesting password reset:', err);
      const errorMessage = err?.message || 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.';
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
              <h2 class="text-2xl font-bold text-gray-900">Mot de passe oublié ?</h2>
              <p class="mt-2 text-sm text-gray-600">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            <form class="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="votre@email.com"
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
                        Si cette adresse email existe dans notre système, un email de réinitialisation a été envoyé à {email()}. Vérifiez votre boîte de réception.
                      </p>
                    </div>
                  </div>
                </div>
              </Show>

              <div>
                <button
                  type="submit"
                  disabled={isLoading()}
                  class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading() ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                </button>
              </div>

              <div class="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  class="text-sm text-blue-600 hover:text-blue-500"
                >
                  Retour à la connexion
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;

