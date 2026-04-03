import pika
import json
from handlers.ssl_handler import handle_ssl_scan
from handlers.ip_handler import handle_ip_ssl_scan, handle_ip_port_scan
from handlers.domain_handler import handle_subdomain_scan
import threading


SCAN_ROUTER = {
    "SSL/TLS": handle_ssl_scan,
    "IP_RECON": handle_ip_ssl_scan,
    "IP_PORT_SCAN": handle_ip_port_scan,
    "SUBDOMAIN_ENUM": handle_subdomain_scan,
    # "FULL_DOMAIN": handle_full_domain_flow,
    # "FULL_IP": handle_full_ip_flow,
}


# pika in not thread safe so channel and connections must be touched from same thread that created them
def ack_message(channel, delivery_tag):
    if channel.is_open:
        channel.basic_ack(delivery_tag)


def nack_message(channel, delivery_tag):
    if channel.is_open:
        channel.basic_nack(delivery_tag, requeue=False)


def process_scan_job(connection, channel, delivery_tag, body):
    try:
        data = json.loads(body.decode())

        scan_type = data.get("scan", {}).get("type")
        scan_id = data.get("scan", {}).get("id")

        scan_options = data.get("scan")
        target = data.get("target", {})

        handler_function = SCAN_ROUTER.get(scan_type)

        if handler_function:
            handler_function(scan_id, target, **scan_options)
        else:
            print(f"Unknown scan type: {scan_type}")

        # channel.basic_ack(delivery_tag=delivery_tag)
        cb = lambda: ack_message(channel, delivery_tag)
        connection.add_callback_threadsafe(cb)

    except Exception as e:
        print(f"Error processing job: {e}")
        # channel.basic_nack(delivery_tag=delivery_tag, requeue=False)
        cb = lambda: nack_message(channel, delivery_tag)
        connection.add_callback_threadsafe(cb)


def start_consuming():
    connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
    channel = connection.channel()
    channel.queue_declare(queue="scans", durable=True)
    channel.basic_qos(prefetch_count=1)

    def callback(ch, method, properties, body):
        # try:
        #     data = json.loads(body.decode())
        #     scan_type = data.get("scan", {}).get("type")
        #     scan_id = data.get("scan", {}).get("id")
        #     # scan_level = data.get("scan", {}).get("level")
        #     scan_options = data.get("scan")
        #     target = data.get("target", {})

        #     handler_function = SCAN_ROUTER.get(scan_type)

        #     if handler_function:
        #         handler_function(scan_id, target, **scan_options)
        #     else:
        #         print(f"Unknown scan type: {scan_type}")

        #     ch.basic_ack(delivery_tag=method.delivery_tag)

        # except Exception as e:
        #     print(f"Error: {e}")
        #     ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        thread = threading.Thread(
            target=process_scan_job, args=(connection, ch, method.delivery_tag, body)
        )
        thread.start()

    channel.basic_consume(queue="scans", auto_ack=False, on_message_callback=callback)
    print("Waiting for messages...")
    channel.start_consuming()
