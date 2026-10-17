import json
import paramiko
import yaml
import time

with open('server-config.json', 'r', encoding='utf-8') as f:
    cfg = json.load(f)['server']

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(cfg['host'], cfg['port'], cfg['user'], cfg['password'], timeout=10)

def run_sudo(cmd):
    full_cmd = f'echo "{cfg["password"]}" | sudo -S {cmd}'
    stdin, stdout, stderr = ssh.exec_command(full_cmd)
    return stdout.read().decode(), stderr.read().decode()

# 1. Fetch current routes.yml
stdin, stdout, stderr = ssh.exec_command("cat /opt/traefik/dynamic/routes.yml")
content = stdout.read().decode()

# 2. Check if already applied
if "em.nexenflow.com" in content:
    print("em.nexenflow.com already found in routes.yml")
else:
    target_sts_router = """    sts-https:
      entryPoints:
        - websecure
      rule: "Host(`sys.nexenflow.com`)"
      tls:
        certResolver: letsencrypt
      service: sts-svc"""

    replacement_sts_router = """    sts-https:
      entryPoints:
        - websecure
      rule: "Host(`sys.nexenflow.com`)"
      tls:
        certResolver: letsencrypt
      service: sts-svc

    # --- EventManager (em.nexenflow.com) Routers ---
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
      service: eventmanager-svc"""

    target_sts_svc = """    # --- STS Solution Technology Systems Service ---
    sts-svc:
      loadBalancer:
        passHostHeader: true
        servers:
          - url: "http://host.docker.internal:9500" """

    # Note: check whitespace
    if target_sts_router not in content:
        raise ValueError("Target STS router block not found in routes.yml")

    content = content.replace(target_sts_router, replacement_sts_router, 1)

    target_sts_svc_exact = """    # --- STS Solution Technology Systems Service ---
    sts-svc:
      loadBalancer:
        passHostHeader: true
        servers:
          - url: "http://host.docker.internal:9500" """

    # Let's search by sts-svc block
    svc_anchor = '          - url: "http://host.docker.internal:9500"'
    if svc_anchor not in content:
        raise ValueError(f"Service anchor '{svc_anchor}' not found in routes.yml")

    em_svc_snippet = """\n\n    # --- EventManager Service ---
    eventmanager-svc:
      loadBalancer:
        passHostHeader: true
        servers:
          - url: "http://host.docker.internal:9510" """

    content = content.replace(svc_anchor, svc_anchor + em_svc_snippet, 1)

    # 3. Validate YAML syntax locally before pushing
    try:
        parsed = yaml.safe_load(content)
        print("[SUCCESS] YAML parsed successfully with zero syntax errors!")
        assert "http" in parsed
        assert "eventmanager-http" in parsed["http"]["routers"]
        assert "eventmanager-https" in parsed["http"]["routers"]
        assert "eventmanager-svc" in parsed["http"]["services"]
        print("[SUCCESS] Verified eventmanager-http, eventmanager-https, and eventmanager-svc are properly structured.")
    except Exception as e:
        raise ValueError(f"YAML validation failed: {e}")

    # 4. Upload to remote /tmp/routes_em.yml
    sftp = ssh.open_sftp()
    with sftp.file("/tmp/routes_em.yml", "w") as f:
        f.write(content)
    sftp.close()

    # 5. Backup and apply
    run_sudo("cp /opt/traefik/dynamic/routes.yml /opt/traefik/dynamic/routes.yml.bak_before_em")
    out, err = run_sudo("cp /tmp/routes_em.yml /opt/traefik/dynamic/routes.yml")
    print("Copied to /opt/traefik/dynamic/routes.yml:", out, err)

# 6. Wait for Traefik to reload
print("Waiting 5s for Traefik reload...")
time.sleep(5)

stdin, stdout, stderr = ssh.exec_command("docker logs --tail 25 traefik")
print("\n=== Traefik Logs (Tail 25) ===")
print(stdout.read().decode())
print(stderr.read().decode())

ssh.close()
