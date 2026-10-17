import json
import paramiko
import time

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

def run_sudo(cmd):
    full_cmd = f'echo "{cfg["password"]}" | sudo -S {cmd}'
    stdin, stdout, stderr = ssh.exec_command(full_cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    return out, err

# 1. Backup original file
timestamp = int(time.time())
print(f"Creating backup: /opt/traefik/dynamic/routes.yml.bak_{timestamp}")
run_sudo(f"cp /opt/traefik/dynamic/routes.yml /opt/traefik/dynamic/routes.yml.bak_{timestamp}")

# 2. Read original file
stdin, stdout, stderr = ssh.exec_command("cat /opt/traefik/dynamic/routes.yml")
content = stdout.read().decode()

if "em.nexenflow.com" in content:
    print("em.nexenflow.com already present in routes.yml!")
else:
    # Router snippet to insert before "  middlewares:"
    router_snippet = """    # --- EventManager (em.nexenflow.com) Routers ---
    eventmanager-http:
      entryPoints:
        - web
      rule: "Host(`em.nexenflow.com`)"
      middlewares:
        - redirect-https
      service: eventmanager-svc

    eventmanager-https:
      entryPoints:
        - websecure
      rule: "Host(`em.nexenflow.com`)"
      tls:
        certResolver: letsencrypt
      service: eventmanager-svc

"""
    # Service snippet to insert before "  serversTransports:"
    service_snippet = """    # --- EventManager (Frontend & API Reverse Proxy) ---
    eventmanager-svc:
      loadBalancer:
        passHostHeader: true
        servers:
          - url: "http://host.docker.internal:9510"

"""

    # Check if target anchor points exist
    if "  middlewares:" not in content or "  serversTransports:" not in content:
        raise ValueError("Could not find anchor points ('  middlewares:' or '  serversTransports:') in routes.yml")

    # Insert router
    content = content.replace("  middlewares:", router_snippet + "  middlewares:", 1)
    
    # Insert service
    content = content.replace("  serversTransports:", service_snippet + "  serversTransports:", 1)

    # 3. Write to /tmp/routes_new.yml
    sftp = ssh.open_sftp()
    with sftp.file("/tmp/routes_new.yml", "w") as f:
        f.write(content)
    sftp.close()

    # 4. Copy to /opt/traefik/dynamic/routes.yml with sudo
    print("Updating /opt/traefik/dynamic/routes.yml...")
    out, err = run_sudo("cp /tmp/routes_new.yml /opt/traefik/dynamic/routes.yml && chmod 644 /opt/traefik/dynamic/routes.yml")
    print("Sudo copy status:", out, err)

# 5. Wait for Traefik to reload
print("Waiting 4 seconds for Traefik dynamic reload...")
time.sleep(4)

# 6. Check Traefik logs
stdin, stdout, stderr = ssh.exec_command("docker logs --tail 30 traefik")
print("=== Traefik Logs ===")
print(stdout.read().decode())
print(stderr.read().decode())

ssh.close()
