import { Component, createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onClose?: () => void;
}

const LoginForm: Component<LoginFormProps> = (props) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await auth.login(email(), password());
      if (props.onClose) {
        props.onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Connexion</h2>

      <Show when={error()}>
        <div class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p class="text-sm">{error()}</p>
        </div>
      </Show>

      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label for="login-email" class="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            placeholder="votre@email.com"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            required
            disabled={isLoading()}
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label for="login-password" class="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mot de passe oublié ?
            </button>
          </div>
          <input
            id="login-password"
            type="password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            placeholder="••••••••"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            required
            disabled={isLoading()}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading()}
          class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading() ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <button
            type="button"
            onClick={props.onSwitchToSignup}
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            S'inscrire
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;

