from psycopg2 import pool
import uuid
from datetime import datetime
import json
import os
from dotenv import load_dotenv

load_dotenv()


connection_pool = pool.SimpleConnectionPool(
    1,
    10,
    host=os.getenv("DB_HOST"),
    database=os.getenv("DB_DATABASE"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    port=os.getenv("DB_PORT"),
)


def add_finding(scan_id, title, raw_data):
    insert_query = """
    INSERT INTO findings (id,scan_id,title,raw_data)
    VALUES (%s,%s,%s,%s)
    """

    conn = connection_pool.getconn()

    try:
        cursor = conn.cursor()
        finding_id = str(uuid.uuid4())
        cursor.execute(insert_query, (finding_id, scan_id, title, json.dumps(raw_data)))
        conn.commit()
        cursor.close()
        return finding_id
    finally:
        connection_pool.putconn(conn)


def update_scan_status(scan_id, status):
    update_scan_status_query = """
    UPDATE scans
    SET status = %s
    WHERE id = %s
    """
    conn = connection_pool.getconn()
    try:
        cursor = conn.cursor()
        cursor.execute(update_scan_status_query, (status, scan_id))
        conn.commit()
        cursor.close()
    finally:
        connection_pool.putconn(conn)
