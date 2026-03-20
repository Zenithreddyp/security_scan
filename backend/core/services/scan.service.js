import amqp from "amqplib";

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

        console.log("Scan successfully added to queue");

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error("RabbitMQ Error:", error);
        throw error;
    }
}
