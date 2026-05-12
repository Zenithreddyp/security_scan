import pika
import os


def addScantoResult(payload):
    connection = pika.BlockingConnection(pika.ConnectionParameters(os.environ.get("RABBITMQ_HOST", "localhost")))
    channel = connection.channel()

    channel.queue_declare(queue="scan_results", durable=True)

    channel.basic_publish(exchange="", routing_key="scan_results", body=payload)

    connection.close()
