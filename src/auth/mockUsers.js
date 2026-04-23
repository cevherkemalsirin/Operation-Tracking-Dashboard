import { AUTH_ROLES } from './constants';

// Demo users for frontend-only auth until API integration.
export const MOCK_USERS = [
  {
    id: 'u-admin-001',
    email: 'admin@nokia.com',
    password: 'admin1234',
    name: 'Admin User',
    role: AUTH_ROLES.ADMIN,
  },
  {
    id: 'u-operator-001',
    email: 'operator@nokia.com',
    password: 'operator1234',
    name: 'Operator',
    role: AUTH_ROLES.OPERATOR,
  },
  {
    id: 'u-viewer-001',
    email: 'viewer@nokia.com',
    password: 'viewer1234',
    name: 'Viewer User',
    role: AUTH_ROLES.VIEWER,
  },
];
