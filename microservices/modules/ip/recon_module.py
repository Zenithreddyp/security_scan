import socket
import requests
import geoip2.database
import os


IPINFO_TOKEN = "8027c2d3caf1e1"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MAXMIND_DB_PATH = os.path.join(BASE_DIR, "..","..","data", "GeoLite2-City.mmdb")

def get_rdap(ip):
    try:
        url = f"https://rdap.apnic.net/ip/{ip}"
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            return r.json()
    except:
        pass
    return {}


def get_ipinfo(ip):
    try:
        url = f"https://api.ipinfo.io/lookup/{ip}"
        headers = {
            "Authorization": f"Bearer {IPINFO_TOKEN}"
        }

        r = requests.get(url, headers=headers, timeout=5)
        return r.json()

    except Exception as e:
        print("IPinfo error:", e)
        return {}


def get_geo(ip):
    try:
        reader = geoip2.database.Reader(MAXMIND_DB_PATH)
        response = reader.city(ip)

        return {
            "city": response.city.name,
            "region": response.subdivisions.most_specific.name,
            "country": response.country.name,
            "lat": response.location.latitude,
            "lon": response.location.longitude
        }
    except Exception as e:
        print("geo error:", e)
        return {}



def recon_scan(ip):
    result = {
        "ip": ip,
        "hostname": "N/A",

        "network": {
            "asn": "N/A",
            "asn_type": "N/A",
            "org": "N/A"
        },

        "registration": {
            "range": "N/A",
            "cidr": "N/A",
            "country": "N/A",
            "address": "N/A",
            "abuse_email": "N/A"
        },

        "location": {}
    }


    try:
        result["hostname"] = socket.gethostbyaddr(ip)[0]
    except:
        pass


    rdap = get_rdap(ip)

    if rdap:
        result["registration"]["range"] = rdap.get("handle", "N/A")
        result["registration"]["country"] = rdap.get("country", "N/A")


        if "cidr0_cidrs" in rdap:
            cidrs = [
                f"{c['v4prefix']}/{c['length']}"
                for c in rdap["cidr0_cidrs"]
            ]
            result["registration"]["cidr"] = ", ".join(cidrs)


        for ent in rdap.get("entities", []):
            vcard = ent.get("vcardArray", [])
            if len(vcard) < 2:
                continue

            for item in vcard[1]:
                key = item[0]

                if key == "fn" and result["network"]["org"] == "N/A":
                    result["network"]["org"] = item[3]

                if key == "adr" and result["registration"]["address"] == "N/A":
                    result["registration"]["address"] = item[1].get("label", "N/A")

                if key == "email":
                    result["registration"]["abuse_email"] = item[3]


    ipinfo = get_ipinfo(ip)

    if ipinfo:
        result["network"]["asn"] = ipinfo.get("asn", "N/A")

    # country fallback (if RDAP missing)
    if result["registration"]["country"] == "N/A":
        result["registration"]["country"] = ipinfo.get("country", "N/A")


    geo = get_geo(ip)
    if geo:
        result["location"] = geo
    
    print(result)

    return result



# if __name__ == "__main__":
#     ip = "117.250.157.213"
#     data = recon_scan(ip)

#     import json
#     print(json.dumps(data, indent=4))

