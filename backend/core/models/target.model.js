import pool from "../config/db.js";

import { v4 as uuidv4 } from "uuid";

export async function findTargetsByUser(user_id) {
    const result = await pool.query(
        `SELECT * FROM targets WHERE user_id = $1 ORDER BY created_at DESC`,
        [user_id],
    );
    return result.rows;
}

export async function findTargetsByUserAndUrl(user_id, url) {
    const result = await pool.query(
        `
        SELECT * 
        FROM targets 
        WHERE user_id = $1 
          AND target_url = $2
        ORDER BY created_at DESC
        `,
        [user_id, url]
    );

    return result.rows;
}
export async function findTargetByUserAndId(user_id, id) {
    const result = await pool.query(
        `
        SELECT * 
        FROM targets 
        WHERE user_id = $1 
          AND id = $2
        ORDER BY created_at DESC
        `,
        [user_id, id]
    );

    return result.rows[0];
}


export async function createTarget(user_id, target_url, target_ip, label) {
    // console.log(//print all//)
    console.log("createTarget inputs:", {
        user_id,
        target_url,
        target_ip,
        label,
        types: {
            user_id: typeof user_id,
            target_url: typeof target_url,
            target_ip: typeof target_ip,
            label: typeof label,
        },
    });
    const id = uuidv4();

    const query = `
        INSERT INTO targets (id,user_id, target_url, target_ip, label)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

    const values = [id, user_id, target_url, target_ip, label];

    const result = await pool.query(query, values);

    return result.rows[0];
}


export async function updateTargetLabel(id, user_id, label) {
    const result = await pool.query(
        `UPDATE targets SET label = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
        [label, id, user_id]
    );
    return result.rows[0];
}