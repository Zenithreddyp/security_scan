import os
import sys
from messaging.consumer import start_consuming

if __name__ == "__main__":
    try:
        start_consuming()
    except KeyboardInterrupt:
        print("Interrupted")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)