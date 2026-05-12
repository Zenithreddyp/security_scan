import amqp from "amqplib";
import { updateScanStatus, findUserIdByScanId, findScanById } from "../models/scan.model.js";
import { listFindingsByScan } from "../models/finding.model.js";
import { getIo, userSockets } from "../config/socket.js";

export async function AddScantoQueue(payload) {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = "scans";

        await channel.assertQueue(queue, { durable: true });

        channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
            persistent: true,
        });

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error("RabbitMQ Error (Publish):", error);
        throw error;
    }
}

export async function ConsumeScanResults() {
    const RETRY_DELAY_MS = 5000;

    const connect = async () => {
        try {
            const connection = await amqp.connect(process.env.RABBITMQ_URL);
            const channel = await connection.createChannel();
            const queue = "scan_results";

            await channel.assertQueue(queue, { durable: true });
            channel.prefetch(1);

            console.log("[RabbitMQ] Listening for scan results on 'scan_results' queue...");

            channel.consume(
                queue,
                async (msg) => {
                    if (msg === null) return;

                    try {
                        const payload = JSON.parse(msg.content.toString());
                        console.log("[RabbitMQ] Received scan result:", payload);

                        const status = payload.error ? "failed" : (payload.status || "completed");

                        // Update scan status in DB
                        await updateScanStatus(payload.scan_id, status);

                        // Fetch the actual findings from DB to send to the frontend
                        const findings = await listFindingsByScan(payload.scan_id);
                        const scanDetails = await findScanById(payload.scan_id);

                        // Emit real-time update to the correct user's socket
                        try {
                            const userId = await findUserIdByScanId(payload.scan_id);
                            if (userId) {
                                const userSocketId = userSockets.get(userId.toString());
                                if (userSocketId) {
                                    getIo().to(userSocketId).emit("scan_completed", {
                                        scan_id: payload.scan_id,
                                        scan_type: scanDetails?.scan_type,
                                        status,
                                        findings,
                                    });
                                    console.log(`[Socket] Emitted scan_completed to user ${userId}`);
                                } else {
                                    console.warn(`[Socket] No active socket found for user ${userId}`);
                                }
                            }
                        } catch (socketErr) {
                            console.error("[Socket] Emit error:", socketErr);
                        }

                        channel.ack(msg);
                    } catch (err) {
                        console.error("[RabbitMQ] Error processing message:", err);
                        channel.nack(msg, false, false); // discard, don't requeue
                    }
                },
                { noAck: false }
            );

            // On connection close, retry
            connection.on("close", () => {
                console.warn("[RabbitMQ] Connection closed. Reconnecting in 5s...");
                setTimeout(connect, RETRY_DELAY_MS);
            });

            connection.on("error", (err) => {
                console.error("[RabbitMQ] Connection error:", err.message);
            });

        } catch (error) {
            console.error("[RabbitMQ] Failed to connect. Retrying in 5s...", error.message);
            setTimeout(connect, RETRY_DELAY_MS);
        }
    };

    connect();
}
