import { MOCK_USERS } from './mockUsers';
import { clearStoredSession, loadStoredSession, saveStoredSession } from './sessionStorage';

function mapToSessionUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

// This service boundary is intentionally small so it can be swapped for API calls later.
export const authService = {
  async login({ email, password, rememberMe }) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = MOCK_USERS.find(
      (candidate) =>
        candidate.email.toLowerCase() === normalizedEmail &&
        candidate.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const session = {
      user: mapToSessionUser(user),
      rememberMe: Boolean(rememberMe),
      createdAt: Date.now(),
    };

    saveStoredSession(session);
    return session;
  },

  async logout() {
    clearStoredSession();
  },

  async getSession() {
    return loadStoredSession();
  },
};
