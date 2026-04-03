import pool from "../config/db.js";

import { v4 as uuidv4 } from "uuid";

export const findScansByUser = async (user_id) => {
    const result = await pool.query(
        `
        SELECT 
            s.*,
            t.target_url,
            t.target_ip,
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', f.id,
                        'title', f.title,
                        'severity', f.raw_data->>'severity',
                        'description', f.raw_data->>'description'
                    )
                ) FILTER (WHERE f.id IS NOT NULL), 
                '[]'
            ) AS findings
        FROM scans s
        JOIN targets t ON s.target_id = t.id
        LEFT JOIN findings f ON f.scan_id = s.id
        WHERE t.user_id = $1
        GROUP BY s.id, t.target_url, t.target_ip
        ORDER BY s.started_at DESC
        `,
        [user_id]
    );

    return result.rows;
};

export const findScansByTarget = async (user_id, target_id) => {
    const result = await pool.query(
        `
        SELECT 
            s.*,
            t.target_url,
            t.target_ip,
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', f.id,
                        'title', f.title,
                        'severity', f.raw_data->>'severity',
                        'description', f.raw_data->>'description'
                    )
                ) FILTER (WHERE f.id IS NOT NULL), 
                '[]'
            ) AS findings
        FROM scans s
        JOIN targets t ON s.target_id = t.id
        LEFT JOIN findings f ON f.scan_id = s.id
        WHERE t.user_id = $1
          AND s.target_id = $2
        GROUP BY s.id, t.target_url, t.target_ip
        ORDER BY s.started_at DESC
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

export const findScanById = async (id) => {
    const result = await pool.query(
        `SELECT * FROM scans WHERE id = $1`,
        [id]
    );
    return result.rows[0];
};

export const findUserIdByScanId = async (id) => {
    const result = await pool.query(
        `SELECT t.user_id 
         FROM scans s 
         JOIN targets t ON s.target_id = t.id 
         WHERE s.id = $1`,
        [id]
    );
    return result.rows[0]?.user_id;
};
