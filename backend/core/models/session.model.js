import pool from "../config/db.js";

export async function createRefreshSession({
    id,
    userId,
    tokenHash,
    familyId,
    userAgent,
    ipAddress,
    expiresAt,
}) {
    const result = await pool.query(
        `
        INSERT INTO refresh_sessions (
            id,
            user_id,
            token_hash,
            family_id,
            user_agent,
            ip_address,
            expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [id, userId, tokenHash, familyId, userAgent, ipAddress, expiresAt]
    );

    return result.rows[0];
}

export async function findRefreshSessionByTokenHash(tokenHash) {
    const result = await pool.query(
        `
        SELECT *
        FROM refresh_sessions
        WHERE token_hash = $1
        LIMIT 1
        `,
        [tokenHash]
    );

    return result.rows[0];
}

export async function revokeRefreshSession(sessionId, reason = "revoked") {
    const result = await pool.query(
        `
        UPDATE refresh_sessions
        SET revoked_at = CURRENT_TIMESTAMP,
            revoked_reason = $2,
            last_used_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
        `,
        [sessionId, reason]
    );

    return result.rows[0];
}

/*
Chrome laptop login → family_id = AAA
Mobile login        → family_id = BBB
College PC login    → family_id = CCC*/
export async function revokeRefreshSessionFamily(familyId, reason = "family_revoked") {   // 
    await pool.query(
        `
        UPDATE refresh_sessions
        SET revoked_at = CURRENT_TIMESTAMP,
            revoked_reason = $2
        WHERE family_id = $1
        AND revoked_at IS NULL
        `,
        [familyId, reason]
    );
}

//logout from all devices
export async function revokeAllRefreshSessionsForUser(userId, reason = "logout_all") {
    await pool.query(
        `
        UPDATE refresh_sessions
        SET revoked_at = CURRENT_TIMESTAMP,
            revoked_reason = $2
        WHERE user_id = $1
        AND revoked_at IS NULL
        `,
        [userId, reason]
    );
}

export async function isRefreshSessionFamilyActive(userId, familyId) {
    const result = await pool.query(
        `
        SELECT 1
        FROM refresh_sessions
        WHERE user_id = $1
        AND family_id = $2
        AND revoked_at IS NULL
        AND expires_at > CURRENT_TIMESTAMP
        LIMIT 1
        `,
        [userId, familyId]
    );

    return result.rowCount > 0;
}