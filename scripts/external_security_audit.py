import requests
import time
import json

def audit_mozilla_observatory(host):
    print(f"--- Mozilla Observatory Audit for {host} ---")
    submit_url = f"https://observatory-api.mdn.mozilla.net/api/v1/submit?host={host}"
    try:
        # Request a new scan
        res = requests.post(submit_url)
        # Get results
        results_url = f"https://observatory-api.mdn.mozilla.net/api/v1/analyze?host={host}"
        for _ in range(10): # Poll for results
            res = requests.get(results_url)
            data = res.json()
            if data.get('state') == 'FINISHED':
                print(f"Grade: {data.get('grade')}")
                print(f"Score: {data.get('score')}")
                return data
            time.sleep(5)
    except Exception as e:
        print(f"Error: {e}")
    return None

def audit_ssllabs(host):
    print(f"--- SSL Labs Audit for {host} ---")
    api_url = f"https://api.ssllabs.com/api/v2/analyze?host={host}&fromCache=on"
    try:
        res = requests.get(api_url)
        data = res.json()
        if 'endpoints' in data:
            grade = data['endpoints'][0].get('grade', 'N/A')
            print(f"Grade: {grade}")
            return data
    except Exception as e:
        print(f"Error: {e}")
    return None

if __name__ == "__main__":
    host = "kitchenz-ai.onrender.com"
    observatory = audit_mozilla_observatory(host)
    ssllabs = audit_ssllabs(host)
    
    with open("security_audit_results.json", "w") as f:
        json.dump({"observatory": observatory, "ssllabs": ssllabs}, f, indent=2)
