import amqp from "amqplib";
import { updateScanStatus } from "../models/scan.model.js";
// import { updateScanStatus } from "../models/scan.model";

export async function AddScantoQueue(payload) {
    try {
        const connection = await amqp.connect("amqp://localhost");

        const channel = await connection.createChannel();

        const queue = "scans";

        await channel.assertQueue(queue, {
            durable: true,
            // arguments: {
            //     "x-queue-type": "quorum", //type of queue no advancements required
            // },
        });

        channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
            //scan must be json
            persistent: true, //saved to disk
        });

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error("RabbitMQ Error:", error);
        throw error;
    }
}

export async function ConsumeScanResults() {
    try {
        const connection = await amqp.connect("amqp://localhost");
        const channel = await connection.createChannel();

        const queue = "scan_results"; // Python → Node queue
        await channel.assertQueue(queue, { durable: true });

        channel.consume(
            queue,
            async (msg) => {
                if (msg !== null) {
                    const payload = JSON.parse(msg.content.toString());
                    console.log("Received from Python:", payload);

                    if (!payload.error) {
                        updateScanStatus(payload.scan_id,payload.status)
                    } else {
                        updateScanStatus(payload.scan_id,"failed")
                    }

                    channel.ack(msg);
                }
            },
            { noAck: false },
        );
    } catch (error) {
        console.error("RabbitMQ Error (Consume):", error);
        throw error;
    }
}

ConsumeScanResults();
