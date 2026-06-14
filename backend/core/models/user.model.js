import pool from "../config/db.js";

import { v4 as uuidv4 } from 'uuid';


export async function createUser(full_name, last_name, phoneno, email, password, status) {
  
  const id = uuidv4();

  const query = `
      INSERT INTO users (id, full_name, last_name, phoneno, email, password, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, full_name, last_name, phoneno, email, status, created_at
  `;

    const values = [id, full_name, last_name, phoneno, email, password, status];

    const result = await pool.query(query, values);
    return result.rows[0];
}

export async function findUserByEmail(email) {
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




export async function createEmailOtp(userId, otpHash, expiresAt) {
    const result = await pool.query(
        `
        INSERT INTO email_otps (user_id, otp_hash, expires_at)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [userId, otpHash, expiresAt]
    );

    return result.rows[0];
}

export async function findLatestOtpByUserId(userId) {
    const result = await pool.query(
        `
        SELECT *
        FROM email_otps
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [userId]
    );

    return result.rows[0];
}

export async function deleteOtpsByUserId(userId) {
    await pool.query(
        `
        DELETE FROM email_otps
        WHERE user_id = $1
        `,
        [userId]
    );
}

export async function updateUserStatus(userId, status) {
    const result = await pool.query(
        `
        UPDATE users
        SET status = $1
        WHERE id = $2
        RETURNING *
        `,
        [status, userId]
    );

    return result.rows[0];
}