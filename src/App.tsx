import { Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResendVerificationPage from './pages/ResendVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const App: Component = () => {
  return (
    <Router>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
      <Route path="/resend-verification" component={ResendVerificationPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
    </Router>
  );
};

export default App;
