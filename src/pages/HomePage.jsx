import { Link } from 'react-router-dom';
import { useAuth } from '../auth';

export default function HomePage() {
  const { isAuthenticated, user, role, logout } = useAuth();

  return (
    <div className="home-page">
      <div className="home-card">
        <p className="home-kicker">Operation Tracking Dashboard</p>
        <h1>React version of your group project</h1>
        <p>
          This app combines the login, welcome, dashboard, and ticket management pages into one shared React project.
        </p>
        {isAuthenticated ? (
          <p>
            Signed in as <strong>{user?.name}</strong> ({role}).
          </p>
        ) : (
          <p>Sign in with a demo account to unlock protected pages.</p>
        )}
        <div className="home-links">
          {!isAuthenticated && <Link to="/login" className="home-link">Login</Link>}
          {isAuthenticated && (
            <>
              <Link to="/welcome" className="home-link">Welcome</Link>
              <Link to="/dashboard" className="home-link">Dashboard</Link>
              <Link to="/tickets" className="home-link">Ticket Management</Link>
              <button type="button" className="home-link" onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
