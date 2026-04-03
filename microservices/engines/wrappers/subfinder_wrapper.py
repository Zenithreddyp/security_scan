import subprocess
import socket, requests


# import shutil
# from core.base_engine import BaseEngine


# path = "subfinder" # Generic alternative if added to PATH
path = "C:\\Users\\zenith\\Downloads\\subfinder_2.13.0_windows_amd64\\subfinder.exe"


class SubfinderWrapper:

    def parse_output(self, result):
        subdomain = []

        if result.stdout:
            for line in result.stdout.splitlines():
                line = line.strip()
                if line:  # skip empty lines

                    subdomain.append({"domain": line, "active": self.isactive(line)})

        error = None
        if result.returncode != 0:
            error = result.stderr.strip()

        return {
            "subdomains": subdomain,
            "total_subdomains": len(subdomain),
            "error": error,
        }

    def isactive(self, url):

        try:
            socket.gethostbyname(url)

            try:
                r = requests.get(f"http://{url}", timeout=3)
                return r.status_code == 200  # more realistic
            except requests.RequestException:
                return False

        except socket.gaierror:
            return False

    def run(self, target, scan_level="basic"):
        cmd = [path, "-d", target]
        result = subprocess.run(cmd, capture_output=True, text=True)
        # print(result)
        return self.parse_output(result)
