


PORT_DATA2 = {
    20:  {"protocol": "FTP",       "transport": "TCP",  "service": "FTP Data",             "security": "Insecure"},
    21:  {"protocol": "FTP",       "transport": "TCP",  "service": "FTP Control",          "security": "Insecure"},
    22:  {"protocol": "SSH",       "transport": "TCP",  "service": "Secure Shell",         "security": "Secure"},
    23:  {"protocol": "Telnet",    "transport": "TCP",  "service": "Remote Terminal",       "security": "Insecure"},
    25:  {"protocol": "SMTP",      "transport": "TCP",  "service": "Email (Send)",          "security": "Unencrypted"},
    53:  {"protocol": "DNS",       "transport": "Both", "service": "Domain Resolution",    "security": "Essential"},
    67:  {"protocol": "DHCP",      "transport": "UDP",  "service": "DHCP Server",           "security": "Internal"},
    68:  {"protocol": "DHCP",      "transport": "UDP",  "service": "DHCP Client",           "security": "Internal"},
    69:  {"protocol": "TFTP",      "transport": "UDP",  "service": "Simple File Transfer", "security": "Insecure"},
    80:  {"protocol": "HTTP",      "transport": "TCP",  "service": "Web Traffic",           "security": "Unencrypted"},
    110: {"protocol": "POP3",      "transport": "TCP",  "service": "Email (Receive)",       "security": "Unencrypted"},
    123: {"protocol": "NTP",       "transport": "UDP",  "service": "Time Sync",             "security": "Essential"},
    137: {"protocol": "NetBIOS",   "transport": "UDP",  "service": "Name Service",          "security": "Legacy"},
    139: {"protocol": "NetBIOS",   "transport": "TCP",  "service": "Session Service",       "security": "Legacy"},
    143: {"protocol": "IMAP",      "transport": "TCP",  "service": "Email (Receive)",       "security": "Unencrypted"},
    161: {"protocol": "SNMP",      "transport": "UDP",  "service": "Network Monitoring",    "security": "Sensitive"},
    179: {"protocol": "BGP",       "transport": "TCP",  "service": "Routing Protocol",      "security": "Critical"},
    389: {"protocol": "LDAP",      "transport": "Both",  "service": "Directory Service",     "security": "Unencrypted"},
    443: {"protocol": "HTTPS",     "transport": "TCP",  "service": "Secure Web",            "security": "Secure"},
    445: {"protocol": "SMB",       "transport": "TCP",  "service": "File Sharing",          "security": "Vulnerable"},
    465: {"protocol": "SMTPS",     "transport": "TCP",  "service": "Secure Email",          "security": "Secure"},
    500: {"protocol": "ISAKMP",    "transport": "UDP",  "service": "VPN Key Exchange",      "security": "Secure"},
    587: {"protocol": "SMTP",      "transport": "TCP",  "service": "Email with TLS",        "security": "Secure"},
    993: {"protocol": "IMAPS",     "transport": "TCP",  "service": "Secure Email",          "security": "Secure"},
    995: {"protocol": "POP3S",     "transport": "TCP",  "service": "Secure Email",          "security": "Secure"},

    1433: {"protocol": "MS SQL",    "transport": "TCP",  "service": "SQL Server",           "security": "Secure connection"},
    1521: {"protocol": "Oracle",    "transport": "TCP",  "service": "Oracle DB",            "security": "Secure connection"},
    2049: {"protocol": "NFS",       "transport": "Both", "service": "File Sharing",         "security": "Exposed risk"},
    2083: {"protocol": "HTTPS",     "transport": "TCP",  "service": "cPanel Secure",        "security": "Admin panel"},
    2181: {"protocol": "Zookeeper", "transport": "TCP",  "service": "Coordination Service", "security": "Sensitive"},

    3000: {"protocol": "Custom",    "transport": "TCP",  "service": "Node.js/React",        "security": "Development"},
    3306: {"protocol": "MySQL",     "transport": "TCP",  "service": "MySQL/MariaDB",        "security": "Secure connection"},
    3389: {"protocol": "RDP",       "transport": "Both", "service": "Remote Desktop",       "security": "High risk"},
    3690: {"protocol": "SVN",       "transport": "TCP",  "service": "Version Control",      "security": "Legacy"},
    4000: {"protocol": "Custom",    "transport": "TCP",  "service": "Dev Server",           "security": "Development"},
    4200: {"protocol": "Custom",    "transport": "TCP",  "service": "Angular",              "security": "Development"},
    4444: {"protocol": "Custom",    "transport": "TCP",  "service": "Testing/Metasploit",   "security": "Exploitation"},
    5000: {"protocol": "Custom",    "transport": "TCP",  "service": "Flask",                "security": "Development"},
    5432: {"protocol": "PostgreSQL","transport": "TCP",  "service": "PostgreSQL",           "security": "Secure connection"},
    5601: {"protocol": "Kibana",    "transport": "TCP",  "service": "Analytics Dashboard",  "security": "Sensitive"},
    5672: {"protocol": "AMQP",      "transport": "TCP",  "service": "RabbitMQ",             "security": "Secure connection"},
    5900: {"protocol": "VNC",       "transport": "TCP",  "service": "Remote Desktop",        "security": "Weak auth"},
    5985: {"protocol": "WinRM",     "transport": "TCP",  "service": "Remote Management",    "security": "Sensitive"},
    6379: {"protocol": "Redis",     "transport": "TCP",  "service": "Redis Cache",          "security": "Secure connection"},
    7001: {"protocol": "WebLogic",  "transport": "TCP",  "service": "App Server",           "security": "Vulnerable"},
    8000: {"protocol": "Custom",    "transport": "TCP",  "service": "Django/PHP",           "security": "Development"},
    8008: {"protocol": "HTTP",      "transport": "TCP",  "service": "Alt Web",              "security": "Unencrypted"},
    8080: {"protocol": "HTTP",      "transport": "TCP",  "service": "Alt Web/Vue",          "security": "Development"},
    8081: {"protocol": "HTTP",      "transport": "TCP",  "service": "Alt Web",              "security": "Development"},
    8086: {"protocol": "InfluxDB",  "transport": "TCP",  "service": "Time Series DB",       "security": "Sensitive"},
    8200: {"protocol": "Vault",     "transport": "TCP",  "service": "Secrets Management",   "security": "Secure"},
    8443: {"protocol": "HTTPS",     "transport": "TCP",  "service": "Alt Secure Web",       "security": "Secure"},
    9000: {"protocol": "Custom",    "transport": "TCP",  "service": "SonarQube",            "security": "Sensitive"},
    9042: {"protocol": "Cassandra", "transport": "TCP",  "service": "Database",             "security": "Secure connection"},
    9092: {"protocol": "Kafka",     "transport": "TCP",  "service": "Streaming",            "security": "Sensitive"},
    9200: {"protocol": "Elastic",   "transport": "TCP",  "service": "Elasticsearch",        "security": "Exposed risk"},
    9418: {"protocol": "Git",       "transport": "TCP",  "service": "Version Control",      "security": "Read access"},
    27017: {"protocol": "MongoDB",  "transport": "TCP",  "service": "MongoDB",              "security": "Secure connection"},
}


all_keys = set(PORT_DATA1) | set(PORT_DATA2)

for key in all_keys:
    val1 = PORT_DATA1.get(key)
    val2 = PORT_DATA2.get(key)

    if val1 != val2:
        print(f"{key}: {val1} != {val2}")