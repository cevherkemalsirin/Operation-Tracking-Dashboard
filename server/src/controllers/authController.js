import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function buildSessionResponse(user) {
  const token = signToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

function getSignupRole(normalizedEmail) {
  return normalizedEmail.endsWith('@nokia.com') ? 'operator' : 'viewer';
}

export async function signup(req, res) {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
    return res.status(400).json({ message: 'Name, email, and a password with at least 6 characters are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (existingUser.rowCount > 0) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const role = getSignupRole(normalizedEmail);

  // Security note:
  // this is okay for a learning/demo app, but in a real app
  // domain-based role assignment should be backed by proper company identity checks.
  const result = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role`,
    [name.trim(), normalizedEmail, passwordHash, role]
  );

  return res.status(201).json(buildSessionResponse(result.rows[0]));
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const result = await query(
    `SELECT id, name, email, password_hash, role
     FROM users
     WHERE email = $1`,
    [normalizedEmail]
  );

  if (result.rowCount === 0) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const user = result.rows[0];
  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.json(buildSessionResponse(user));
}

export async function getCurrentUser(req, res) {
  const result = await query(
    `SELECT id, name, email, role
     FROM users
     WHERE id = $1`,
    [req.user.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({ user: result.rows[0] });
}
