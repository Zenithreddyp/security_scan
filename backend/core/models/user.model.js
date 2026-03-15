import pool from "../config/db.js";

export async function createUser(full_name, last_name, phoneno, email, password) {
  const query = `
    INSERT INTO users (full_name, last_name, phoneno, email, password)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, full_name, last_name, phoneno, email, created_at
  `;

  const values = [full_name, last_name, phoneno, email, password];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function findUserbyEmail(email) {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
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



export async function updateUserPassword(userId, newHashedPassword) {
  const query = "UPDATE users SET password = $1 WHERE id = $2";
  await pool.query(query, [newHashedPassword, userId]);
}

export async function saveRefreshToken(userId, token) {
  const query = "UPDATE users SET refresh_token = $1 WHERE id = $2";
  await pool.query(query, [token, userId]);
}

export async function removeRefreshToken(userId) {
  const query = "UPDATE users SET refresh_token = NULL WHERE id = $1";
  await pool.query(query, [userId]);
}