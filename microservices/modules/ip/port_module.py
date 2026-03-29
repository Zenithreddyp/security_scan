import socket
from concurrent.futures import ThreadPoolExecutor
from threading import Lock

# Future TO DO's
# add stealth mode
# Banner grabbing
# Protocol probing
# TLS inspection
# Version detection
# Service detection (like -sV)
# Risk scoring engine


BASIC_PORTS = [
    20,
    21,
    22,
    23,
    25,
    53,
    80,
    110,
    123,
    137,
    139,
    143,
    161,
    179,
    389,
    443,
    445,
    465,
    500,
    587,
    993,
    995,
    1433,
    1521,
    2049,
    2083,
    2181,
    3000,
    3306,
    3389,
    3690,
    4000,
    4200,
    4444,
    5000,
    5432,
    5601,
    5672,
    5900,
    5985,
    6379,
    7001,
    8000,
    8008,
    8080,
    8081,
    8086,
    8200,
    8443,
    9000,
    9042,
    9092,
    9200,
    9418,
    27017,
]

EXTENDED_PORTS = sorted(
    list(
        set(
            BASIC_PORTS
            + [
                7,
                9,
                13,
                37,
                88,
                111,
                135,
                177,
                427,
                512,
                513,
                514,
                515,
                520,
                631,
                636,
                989,
                990,
                1080,
                1194,
                1214,
                1434,
                1900,
                2048,
                2082,
                2086,
                2095,
                2096,
                2375,
                2376,
                2483,
                2484,
                3001,
                3128,
                3260,
                3268,
                3269,
                4443,
                4567,
                4848,
                5001,
                5060,
                5061,
                5433,
                5555,
                5631,
                6000,
                6378,
                6660,
                6667,
                7002,
                7070,
                7443,
                7777,
                8001,
                8002,
                8069,
                8082,
                8083,
                8181,
                8333,
                8444,
                8500,
                8600,
                8888,
                9001,
                9043,
                9080,
                9090,
                9091,
                9443,
                10000,
                11211,
                15672,
                27018,
                27019,
                28017,
                50070,
                50075,
                10250,
                10255,
                6443,
            ]
        )
    )
)



def single_scan_port(ip, port, protocol, open_ports, lock):
    is_open = False
    s = None
    
    try:
        if protocol.lower() == "udp":
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.settimeout(2)  
            
            try:
                s.sendto(b'\x00', (ip, port))
                s.recvfrom(1024)
                is_open = True
            except socket.timeout:
                # In basic UDP scanning, a timeout often means the port is open|filtered
                is_open = True
            except ConnectionResetError:
                # ICMP Port Unreachable means closed
                is_open = False
            except Exception:
                is_open = False
                
        else:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(1)
            if s.connect_ex((ip, port)) == 0:
                is_open = True

        if is_open:
            with lock:
                open_ports.append(port)

    except Exception:
        pass
    finally:
        if s:
            try:
                s.close()
            except:
                pass


def port_scan(ip, protocol, port_range):
    print(f"Started {protocol.upper()} scan on {ip} for {port_range} ports")
    socket.setdefaulttimeout(1)
    
    open_ports = []
    lock = Lock()

    try:
        if port_range == "basic":
            ports = BASIC_PORTS
        elif port_range == "extended":
            ports = EXTENDED_PORTS
        elif port_range == "all":
            ports = range(1, 65536) 
        else:
            ports = BASIC_PORTS 

        workers = 500 if port_range == "all" else 100

        with ThreadPoolExecutor(max_workers=workers) as executor:
            for port in ports:
                executor.submit(single_scan_port, ip, port, protocol, open_ports, lock)

        return {
            "open_ports": sorted(open_ports),
            "total_open": len(open_ports),
            "protocol": protocol,
            "port_range": port_range,
            "error": None,
        }

    except Exception as e:
        return {"open_ports": [], "error": str(e)}