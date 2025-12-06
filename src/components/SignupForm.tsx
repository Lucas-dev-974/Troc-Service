import { Component, createSignal, Show } from 'solid-js';
import { useAuth } from '../contexts/AuthContext';
import LocationFields from './LocationFields';
import type { LocationData } from '../services/geolocation';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onClose?: () => void;
}

const SignupForm: Component<SignupFormProps> = (props) => {
  const auth = useAuth();
  const [email, setEmail] = createSignal('');
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [locationData, setLocationData] = createSignal<LocationData>({});

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password() !== confirmPassword()) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password().length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      await auth.signup(email(), username(), password(), locationData());
      if (props.onClose) {
        props.onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Inscription</h2>

      <Show when={error()}>
        <div class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p class="text-sm">{error()}</p>
        </div>
      </Show>

      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label for="signup-email" class="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="signup-email"
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
          <label for="signup-username" class="block text-sm font-medium text-gray-700 mb-2">
            Nom d'utilisateur
          </label>
          <input
            id="signup-username"
            type="text"
            value={username()}
            onInput={(e) => setUsername(e.currentTarget.value)}
            placeholder="Votre nom d'utilisateur"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            required
            disabled={isLoading()}
          />
        </div>

        <div>
          <label for="signup-password" class="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <input
            id="signup-password"
            type="password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            placeholder="••••••••"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            required
            disabled={isLoading()}
          />
        </div>

        <div>
          <label for="signup-confirm-password" class="block text-sm font-medium text-gray-700 mb-2">
            Confirmer le mot de passe
          </label>
          <input
            id="signup-confirm-password"
            type="password"
            value={confirmPassword()}
            onInput={(e) => setConfirmPassword(e.currentTarget.value)}
            placeholder="••••••••"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            required
            disabled={isLoading()}
          />
        </div>

        <LocationFields
          onLocationChange={setLocationData}
          disabled={isLoading()}
        />

        <button
          type="submit"
          disabled={isLoading()}
          class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading() ? 'Inscription...' : "S'inscrire"}
        </button>
      </form>

      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">
          Déjà un compte ?{' '}
          <button
            type="button"
            onClick={props.onSwitchToLogin}
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;

