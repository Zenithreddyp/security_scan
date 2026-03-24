import pika
import json
from handlers.ssl_handler import handle_ssl_scan
from handlers.ip_handler import handle_ip_scan
# from orchestrators.domain_scan import handle_full_domain_flow
# from orchestrators.ip_scan import handle_full_ip_flow 

SCAN_ROUTER = {
    "SSL/TLS": handle_ssl_scan,
    "IP_RECON": handle_ip_scan
    # "FULL_DOMAIN": handle_full_domain_flow,
    # "FULL_IP": handle_full_ip_flow,
}


def start_consuming():
    connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
    channel = connection.channel()
    channel.queue_declare(queue="scans", durable=True)

    def callback(ch, method, properties, body):
        try:
            data = json.loads(body.decode())
            scan_type = data.get("scan", {}).get("type")
            scan_id = data.get("scan", {}).get("id")
            target = data.get("target", {})

            handler_function = SCAN_ROUTER.get(scan_type)
            
            if handler_function:
                handler_function(scan_id, target.get("url"))
            else:
                print(f"Unknown scan type: {scan_type}")
            

            ch.basic_ack(delivery_tag=method.delivery_tag)

        except Exception as e:
            print(f"Error: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    channel.basic_consume(queue="scans", auto_ack=False, on_message_callback=callback)
    print("Waiting for messages...")
    channel.start_consuming()