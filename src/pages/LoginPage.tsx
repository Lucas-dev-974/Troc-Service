import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import Layout from '../components/Layout';
import LoginForm from '../components/LoginForm';

const LoginPage: Component = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/');
  };

  return (
    <Layout showHeader={true} showFooter={false}>
      <div class="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-200px)]">
        <div class="w-full max-w-md">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
            <p class="text-gray-600">Connectez-vous à votre compte</p>
          </div>

          <LoginForm
            onSwitchToSignup={() => navigate('/signup')}
            onClose={handleLoginSuccess}
          />

          <div class="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              class="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;

