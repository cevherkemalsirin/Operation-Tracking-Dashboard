import { Link } from 'react-router-dom';
import { useAuth } from '../auth';

export default function HomePage() {
  const { isAuthenticated, user, role, logout } = useAuth();

  return (
    <div className="home-page">

      {/* animated background */}
      <div className="chart-background">
        <div className="analytics-bg">

          <svg viewBox="0 0 1440 600" preserveAspectRatio="none">

            <line className="axis" x1="0" y1="520" x2="1440" y2="520" />

            <rect className="bar" x="100" y="420" width="16" height="100" rx="8" />
            <rect className="bar" x="220" y="390" width="16" height="130" rx="8" />
            <rect className="bar" x="340" y="350" width="16" height="170" rx="8" />
            <rect className="bar" x="460" y="310" width="16" height="210" rx="8" />
            <rect className="bar" x="580" y="270" width="16" height="250" rx="8" />
            <rect className="bar" x="700" y="230" width="16" height="290" rx="8" />
            <rect className="bar" x="820" y="190" width="16" height="330" rx="8" />
            <rect className="bar" x="940" y="150" width="16" height="370" rx="8" />
            <rect className="bar" x="1060" y="110" width="16" height="410" rx="8" />
            <rect className="bar" x="1180" y="70" width="16" height="450" rx="8" />

            <path
              className="growth-line"
              pathLength="1"
              d="
                M80 400
                C180 375, 260 345, 340 320
                S520 255, 620 220
                S760 175, 860 140
                S1020 85, 1120 57
                S1260 41, 1320 33
              "
            />

            <path className="moving-arrow" d="M0,-18 L40,0 L0,18 Z">
              <animateMotion
                dur="5s"
                repeatCount="indefinite"
                rotate="auto"
                calcMode="linear"
                keyTimes="0;0.45;0.7;1"
                keyPoints="0;1;1;1"
                path="
                  M90 397
                  C180 375, 260 345, 340 320
                  S520 255, 620 220
                  S760 175, 860 140
                  S1020 85, 1120 57
                  S1260 41, 1320 33
                "
              />
              <animate
                attributeName="opacity"
                dur="5s"
                repeatCount="indefinite"
                values="0;1;1;0;0"
                keyTimes="0;0.08;0.7;0.74;1"
              />
            </path>

          </svg>

        </div>
      </div>

      {/* logo */}
      <img
        src="/assets/login-welcome/Images/nokia.svg"
        className="logo"
        alt="nokia"
      />

      {/* card */}
      <div className="home-card">

        <p className="home-kicker">OPERATIONS DASHBOARD</p>

        <h1>Enter To Dashboard</h1>

        <p>
          Open the Nokia workspace to monitor live queues,
          move through the dashboard, and manage owned or assigned tickets.
        </p>

        {isAuthenticated ? (
          <p>
            Signed in as <strong>{user?.name}</strong> with{' '}
            <strong>{role}</strong> access.
          </p>
        ) : (
          <p>
            Sign in or create an account to unlock the protected workspace.
          </p>
        )}

        <div className="home-links">

          {!isAuthenticated && (
            <Link to="/login" className="home-link">
              Open Workspace
            </Link>
          )}

          {isAuthenticated && (
            <>
              <Link to="/welcome" className="home-link">
                Welcome
              </Link>

              <Link to="/dashboard" className="home-link">
                Dashboard
              </Link>

              <Link to="/tickets" className="home-link">
                Ticket Management
              </Link>

              <button
                type="button"
                className="home-link"
                onClick={logout}
              >
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
