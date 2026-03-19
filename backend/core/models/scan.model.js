import pool from "../config/db.js";

import { v4 as uuidv4 } from "uuid";

export const findScansByUser = async (user_id) => {
    const result = await pool.query(
        `
        SELECT *
        FROM scans
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [user_id]
    );

    return result.rows;
};
export const findScansByTarget = async (user_id, target_id) => {
    const result = await pool.query(
        `
        SELECT s.*
        FROM scans s
        JOIN targets t ON s.target_id = t.id
        WHERE t.user_id = $1
          AND s.target_id = $2
        ORDER BY s.created_at DESC
        `,
        [user_id, target_id]
    );

    return result.rows;
};

export const createScan = async (target_id, scan_type) => {
    const id = uuidv4();

    const query = `
        INSERT INTO scans (
            id,
            target_id,
            status,
            scan_type,
            started_at
        )
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING *;
    `;

    const values = [id, target_id, "pending", scan_type];

    const result = await pool.query(query, values);

    return result.rows[0];
};

export const updateScanStatus = async (id, status) => {
    const query = `
        UPDATE scans
        SET status = $1
        WHERE id = $2
        RETURNING *;
    `;
    const result = await pool.query(query, [status, id]);

    return result.rows[0];
};
