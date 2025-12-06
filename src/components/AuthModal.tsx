import { Component, createSignal, Show } from 'solid-js';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: Component<AuthModalProps> = (props) => {
  const [isLogin, setIsLogin] = createSignal(true);

  if (!props.isOpen) return null;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="relative">
        <button
          onClick={props.onClose}
          class="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
          aria-label="Fermer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <Show when={isLogin()} fallback={<SignupForm onSwitchToLogin={() => setIsLogin(true)} onClose={props.onClose} />}>
          <LoginForm onSwitchToSignup={() => setIsLogin(false)} onClose={props.onClose} />
        </Show>
      </div>
    </div>
  );
};

export default AuthModal;

