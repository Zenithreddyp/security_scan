from handlers.ssl_handler import handle_ssl_scan
# from handlers.dns_handler import handle_dns_scan
# from handlers.subdomain_handler import handle_subdomain_scan

def run_full_domain_scan(scan_id, domain):

    print(f"Initiating full domain scan for {domain}")
    
    handle_ssl_scan(scan_id, domain)
