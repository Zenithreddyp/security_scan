import os
import sys
import pika

def main():

    connection=pika.BlockingConnection(pika.ConnectionParameters('localhost'))

    channel=connection.channel()

    channel.queue_declare(queue="scans",durable=True)




    def callback(ch, method, properties, body):
        print(f" [x] Received {body}")

        # ch.basic_ack(delivery_tag=method.delivery_tag) --  if auto_ack is not there



    channel.basic_consume(queue="scans",auto_ack=True,on_message_callback=callback)


    print("waiting for messages")
    channel.start_consuming()
 
if __name__=="__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Interrupted")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)




