import os
import sys
import pika
import json

from modules.ssl_module import ssl_scan
from config.db import update_scan_status

def main():

    connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))

    channel = connection.channel()

    channel.queue_declare(queue="scans", durable=True)

    def callback(ch, method, properties, body):
        try:
            data = json.loads(body.decode())

            if data.get("scan", {}).get("type") == "SSL/TLS":
                scan_id=data.get("scan",{}).get("id")
                hostname = data.get("target", {}).get("url")

                if hostname:
                    update_scan_status(scan_id,"started")
                    ssl_scan(scan_id,hostname)
                else:
                    print("No hostname provided")

            ch.basic_ack(delivery_tag=method.delivery_tag)

        except Exception as e:
            print(f"Error: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

        # ch.basic_ack(delivery_tag=method.delivery_tag) --  if auto_ack is not there

    channel.basic_consume(queue="scans", auto_ack=False, on_message_callback=callback)

    print("waiting for messages")
    channel.start_consuming()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Interrupted")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
