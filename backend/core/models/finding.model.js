import pool from "../config/db.js";

export async function findFindingsByUser(user_id) { //heavy
    const query = `
        SELECT f.*
        FROM findings f
        JOIN scans s ON f.scan_id = s.id
        JOIN targets t ON s.target_id = t.id
        WHERE t.user_id = $1
        ORDER BY f.created_at DESC
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows;
}

export async function listFindingsByScan(scan_id) {
    const query = `
        SELECT *
        FROM findings
        WHERE scan_id = $1
        ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [scan_id]);
    return rows;
}

export async function findFindingById(id) {
    const query = `
        SELECT *
        FROM findings
        WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
}

// export async function createFinding(data) {
//     const { scan_id, title, severity, description } = data;

//     const query = `
//         INSERT INTO findings (scan_id, title, severity, description)
//         VALUES ($1, $2, $3, $4)
//         RETURNING *
//     `;

//     const { rows } = await pool.query(query, [
//         scan_id,
//         title,
//         severity,
//         description,
//     ]);

//     return rows[0];
// }



export async function listFindingsByTarget(target_id) {
    const query = `
        SELECT f.*
        FROM findings f
        JOIN scans s ON f.scan_id = s.id
        WHERE s.target_id = $1
        ORDER BY f.created_at DESC
    `;

    const { rows } = await pool.query(query, [target_id]);
    return rows;
}