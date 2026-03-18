import pool from "../config/db.js";

import { v4 as uuidv4 } from "uuid";

export async function findtargetsbyuser(user_id) {
    const result = await pool.query(
        `SELECT * FROM targets WHERE user_id = $1 ORDER BY created_at DESC`,
        [user_id],
    );
    return result.rows;
}

export async function addTarget_(user_id, target_url, target_ip, label) {
    // console.log(//print all//)
    console.log("addTarget_ inputs:", {
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
