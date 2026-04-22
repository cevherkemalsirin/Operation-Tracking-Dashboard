import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import '../styles/login.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!email.trim() || password.trim().length < 4) {
      setError('Please enter a valid email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password, rememberMe });
      const redirectTarget = location.state?.from?.pathname || '/welcome';
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="page">
        <img src="/assets/login-welcome/Images/nokia.svg" className="logo" alt="nokia" />
        <div className="login-card">
          <div className="tabs">
            <button className="tab active" type="button">Sign In</button>
            <button className="tab" type="button">Sign Up</button>
            <div className="indicator"></div>
          </div>

          <h2>Welcome Back</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
            />

            <div className="options">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />{' '}
                Remember me
              </label>
              <a href="#">Forgot password?</a>
            </div>
            <button type="submit" className="login-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
            {error && <p className="error-text" role="alert">{error}</p>}
          </form>
          <p className="divider">OR</p>

          <button className="social apple" type="button" disabled={isSubmitting}><img src="/assets/login-welcome/Images/apple.svg" alt="apple" /></button>
          <button className="social google" type="button" disabled={isSubmitting}><img src="/assets/login-welcome/Images/search.png" alt="google" /></button>
        </div>
      </div>
    </div>
  );
}
