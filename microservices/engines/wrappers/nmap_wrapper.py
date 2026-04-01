import subprocess

# import json
import shutil
# from core.base_engine import BaseEngine

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


class NmapWrapper():

    def parse_output(self, output):
        open_ports = []
        protocol = "tcp"  # default

        for line in output.splitlines():
            line = line.strip()

            # skip header
            if not line or line.startswith("PORT"):
                continue

            parts = line.split()

            if len(parts) >= 2:
                port_proto = parts[0]
                state = parts[1]
                service = parts[2]

                if state == "open":
                    port, proto = port_proto.split("/")
                    open_ports.append({"port": int(port), "service": service})
                    protocol = proto

        return open_ports, protocol

    def run(self, target, port_range="all"):
        nmap_path = shutil.which("nmap")

        if not nmap_path:
            print(nmap_path)
            raise Exception("Nmap is not installed or not in PATH")

        if port_range == "basic":
            ports = ",".join(map(str, BASIC_PORTS))
        elif port_range == "extended":
            ports = ",".join(map(str, EXTENDED_PORTS))
        elif port_range == "all":
            ports = "1-65535"
        else:
            ports = ",".join(map(str, BASIC_PORTS))

        cmd = [nmap_path, "-p", ports, target]

        result = subprocess.run(cmd, capture_output=True, text=True)

        open_ports, protocol = self.parse_output(result.stdout)

        return {
            "open_ports": open_ports,
            "total_open": len(open_ports),
            "protocol": protocol,
            "port_range": port_range,
            "error": result.stderr if result.stderr else None,
        }


# usage
# nmap = NmapWrapper()
# print(nmap.run("178.16.137.95"))
# import os
# print(os.environ["PATH"])
