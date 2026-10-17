import os
import sys
import json
import time
import paramiko

# Ensure safe console output for Windows cmd/powershell
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

CONFIG_FILE = "server-config.json"
REPO_URL = "https://github.com/HajarDWM/EventManager.git"

def get_config():
    if not os.path.exists(CONFIG_FILE):
        print(f"[ERROR] {CONFIG_FILE} not found!")
        sys.exit(1)
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def run_ssh_stream(ssh, command, cwd=None):
    if cwd:
        command = f"cd {cwd} && {command}"
    print(f"\n>>> Running: {command}")
    stdin, stdout, stderr = ssh.exec_command(command, get_pty=True)
    
    while True:
        try:
            line = stdout.readline()
            if not line:
                break
            # Sanitize output line for console printing
            safe_line = line.rstrip()
            print(f"  {safe_line}")
        except Exception:
            pass

    exit_status = stdout.channel.recv_exit_status()
    return exit_status

def main():
    config = get_config()
    server = config["server"]
    deploy_cfg = config.get("deployment", {})

    host = server["host"]
    port = server.get("port", 22)
    user = server["user"]
    password = server.get("password")
    remote_dir = deploy_cfg.get("remoteDirectory", f"/home/{user}/eventmanager")

    print("=" * 65)
    print("  EventManager — Git Clone / Pull & Deploy (Ports 9510-9520)")
    print(f"  Host: {user}@{host}:{port}")
    print(f"  Repository: {REPO_URL}")
    print(f"  Remote Dir: {remote_dir}")
    print("=" * 65)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        print("\n[1/6] Connecting via SSH...")
        ssh.connect(hostname=host, port=port, username=user, password=password, timeout=15)
        print("  Connected successfully!")

        # 1. Check if git repo exists or clone
        print("\n[2/6] Synchronizing Git repository on remote server...")
        check_git_cmd = f"test -d {remote_dir}/.git && echo 'GIT_EXISTS' || echo 'NO_GIT'"
        stdin, stdout, stderr = ssh.exec_command(check_git_cmd)
        result = stdout.read().decode().strip()

        if "GIT_EXISTS" in result:
            print(f"  Existing git repository found in {remote_dir}. Pulling latest commits...")
            pull_cmd = f"cd {remote_dir} && git fetch origin && git reset --hard origin/main && git status"
            run_ssh_stream(ssh, pull_cmd)
        else:
            print(f"  No git repo in {remote_dir}. Cloning from {REPO_URL}...")
            clone_cmd = f"rm -rf {remote_dir} && git clone {REPO_URL} {remote_dir} && cd {remote_dir} && git status"
            status = run_ssh_stream(ssh, clone_cmd)
            if status != 0:
                raise RuntimeError(f"Git clone failed with exit code {status}")

        # 2. Upload .env configuration file (ignored by Git for security)
        print("\n[3/6] Uploading production .env configuration...")
        sftp = ssh.open_sftp()
        sftp.put(".env", f"{remote_dir}/.env")
        sftp.close()
        print("  .env uploaded successfully!")

        # 3. Handle container updates
        reset_db = "--reset-db" in sys.argv
        if reset_db:
            print("\n[4/6] Flag --reset-db specified: Stopping containers and resetting database volume...")
            run_ssh_stream(ssh, f"cd {remote_dir} && docker compose -f docker-compose.prod.yml down -v --remove-orphans || true")
        else:
            print("\n[4/6] Preserving database volume. Updating running containers...")

        # 4. Build and start containers
        print("\n[5/6] Launching/updating containers with Docker Compose...")
        # Remove any container running without compose labels if any
        run_ssh_stream(ssh, "docker rm -f event-phpmyadmin 2>/dev/null || true")
        build_cmd = f"cd {remote_dir} && docker compose -f docker-compose.prod.yml up -d --remove-orphans"
        status = run_ssh_stream(ssh, build_cmd)
        if status != 0:
            raise RuntimeError(f"Docker compose build failed with exit code {status}")

        # 5. Wait for startup & Verify health
        print("\n[6/6] Checking container statuses and health...")
        time.sleep(12)
        run_ssh_stream(ssh, f"cd {remote_dir} && docker compose -f docker-compose.prod.yml ps")
        run_ssh_stream(ssh, f"cd {remote_dir} && docker compose -f docker-compose.prod.yml logs --tail 30 event-backend")

        print("\n--- Health Testing Remote Endpoints ---")
        run_ssh_stream(ssh, "curl -sI http://127.0.0.1:9510 | head -n 5")
        run_ssh_stream(ssh, "curl -sI http://127.0.0.1:9511/api/auth/login | head -n 5")

        print("\n" + "=" * 65)
        print("  🎉 DEPLOYMENT FINISHED SUCCESSFULLY! 🎉")
        print("=" * 65)
        print(f"  • Frontend Web Application: http://{host}:9510")
        print(f"  • Backend REST API:         http://{host}:9511")
        print(f"  • MySQL Database (Port):     {host}:9512")
        print(f"  • phpMyAdmin Interface:     http://{host}:9513")
        print("-" * 65)
        print("  Demo Client Access:")
        print(f"    - RSVP Link:   http://{host}:9510/rsvp/demo-rsvp-token-1")
        print(f"    - Portal Token: demo-client-token")
        print(f"    - Caterer:     demo@eventmanager.com / demo12345")
        print("=" * 65)

    except Exception as e:
        print(f"\n[FATAL ERROR] {e}")
        sys.exit(1)
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
