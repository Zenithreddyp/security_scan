import pool from "../config/db.js";
import crypto from "crypto";

import { v4 as uuidv4 } from 'uuid';

const DEFAULT_ROLE_NAME = "user";

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

async function ensureDefaultRole() {
  const existingRole = await pool.query(
    "SELECT id FROM roles WHERE name = $1",
    [DEFAULT_ROLE_NAME]
  );

  if (existingRole.rows[0]) {
    return existingRole.rows[0].id;
  }

  const id = uuidv4();
  const result = await pool.query(
    `
    INSERT INTO roles (id, name, description)
    VALUES ($1, $2, $3)
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
    `,
    [id, DEFAULT_ROLE_NAME, "Default registered user"]
  );

  return result.rows[0].id;
}

export async function createUser(full_name, last_name, phoneno, email, password) {
  const id = uuidv4();
  const roleId = await ensureDefaultRole();

  const query = `
    INSERT INTO users (id, full_name, last_name, phoneno, email, password_hash, role_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, full_name, last_name, phoneno, email, created_at
  `;

  const values = [id, full_name, last_name, phoneno, email, password, roleId];


  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function findUserByEmail(email) {
  const result = await pool.query(
    "SELECT * FROM users WHERE lower(email) = lower($1)",
    [email]
  );

  return result.rows[0];
}

export async function findUserById(id) {
  const result = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
}


export async function getUserById(id) {
  const result = await pool.query(
    `
    SELECT *
    FROM users u
    JOIN roles r
      ON u.role_id = r.id
    WHERE u.id = $1
    `,
    [id]
  );

  return result.rows[0];
}


export async function updateUserPassword(userId, newHashedPassword) {
  const query = "UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2";
  await pool.query(query, [newHashedPassword, userId]);
}

export async function saveRefreshToken(userId, token, userAgent, ipAddress, expiresAt) {
  const query = `
    INSERT INTO refresh_sessions (id, user_id, token_hash, user_agent, ip_address, expires_at)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  await pool.query(query, [
    uuidv4(),
    userId,
    sha256(token),
    userAgent || null,
    ipAddress || null,
    expiresAt,
  ]);
}

export async function removeRefreshToken(userId) {
  const query = "UPDATE refresh_sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL";
  await pool.query(query, [userId]);
}

export async function findActiveRefreshSession(token) {
  const query = `
    SELECT rs.*, u.id AS user_id, u.full_name, u.email
    FROM refresh_sessions rs
    JOIN users u ON u.id = rs.user_id
    WHERE rs.token_hash = $1
      AND rs.revoked_at IS NULL
      AND rs.expires_at > now()
    LIMIT 1
  `;
  const result = await pool.query(query, [sha256(token)]);
  return result.rows[0];
}

export async function touchRefreshSession(sessionId) {
  await pool.query(
    "UPDATE refresh_sessions SET last_used_at = now() WHERE id = $1",
    [sessionId]
  );
}

export async function createPasswordResetToken(userId, expiresAt) {
  const token = crypto.randomBytes(32).toString("hex");
  const query = `
    INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
    VALUES ($1, $2, $3, $4)
  `;

  await pool.query(query, [uuidv4(), userId, sha256(token), expiresAt]);
  return token;
}

export async function findValidPasswordResetToken(token) {
  const query = `
    SELECT prt.*, u.email
    FROM password_reset_tokens prt
    JOIN users u ON u.id = prt.user_id
    WHERE prt.token_hash = $1
      AND prt.used_at IS NULL
      AND prt.expires_at > now()
    LIMIT 1
  `;
  const result = await pool.query(query, [sha256(token)]);
  return result.rows[0];
}

export async function markPasswordResetTokenUsed(tokenId) {
  await pool.query(
    "UPDATE password_reset_tokens SET used_at = now() WHERE id = $1",
    [tokenId]
  );
}



export async function userHasPermission(userId, permissionKey) {
    const result = await pool.query(
        `
        SELECT 1
        FROM users u
        JOIN role_permissions rp ON rp.role_id = u.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE u.id = $1
        AND p.key = $2
        LIMIT 1
        `,
        [userId, permissionKey]
    );

    return result.rowCount > 0;
}
