import os
import sys
import json
import time
import tarfile
import paramiko
from pathlib import Path

CONFIG_FILE = "server-config.json"
BUNDLE_TAR = "deploy_bundle.tar.gz"

EXCLUDE_DIRS = {
    'node_modules', '.angular', 'target', 'dist', 
    '.git', '.idea', '.vscode', '__pycache__', 'certbot'
}
EXCLUDE_EXTS = {'.log', '.tmp', '.bat', '.ps1'}

def get_config():
    if not os.path.exists(CONFIG_FILE):
        print(f"[ERROR] {CONFIG_FILE} not found!")
        sys.exit(1)
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def create_bundle(archive_name):
    print("\n[Package] Creating optimized source bundle...")
    start_time = time.time()
    
    def tar_filter(tarinfo):
        parts = tarinfo.name.replace('\\', '/').split('/')
        for part in parts:
            if part in EXCLUDE_DIRS:
                return None
        if any(tarinfo.name.endswith(ext) for ext in EXCLUDE_EXTS):
            return None
        if tarinfo.name in {archive_name, BUNDLE_TAR}:
            return None
        return tarinfo

    items_to_add = [
        "docker-compose.prod.yml",
        ".env",
        "server-config.json",
        "Backend",
        "Frontend",
        "scripts"
    ]

    with tarfile.open(archive_name, "w:gz") as tar:
        for item in items_to_add:
            if os.path.exists(item):
                print(f"  Adding {item}...")
                tar.add(item, filter=tar_filter)

    size_mb = os.path.getsize(archive_name) / 1024 / 1024
    elapsed = time.time() - start_time
    print(f"  Bundle ready: {archive_name} ({size_mb:.2f} MB in {elapsed:.1f}s)")
    return size_mb

def upload_bundle_with_progress(sftp, local_path, remote_path):
    print(f"\n[Upload] Transferring {local_path} to remote server...")
    total_size = os.path.getsize(local_path)
    start_time = time.time()
    last_reported = [0]

    def progress_callback(transferred, total):
        pct = (transferred / total) * 100
        now = time.time()
        if now - last_reported[0] >= 1.0 or transferred == total:
            last_reported[0] = now
            elapsed = max(now - start_time, 0.001)
            speed_mb = (transferred / 1024 / 1024) / elapsed
            print(f"  Uploaded: {transferred / 1024 / 1024:.1f}/{total / 1024 / 1024:.1f} MB ({pct:.1f}%) at {speed_mb:.2f} MB/s", end='\r')

    sftp.put(local_path, remote_path, callback=progress_callback)
    print(f"\n  Upload finished successfully in {time.time() - start_time:.1f}s!")

def run_ssh_stream(ssh, command, cwd=None):
    if cwd:
        command = f"cd {cwd} && {command}"
    print(f"\n>>> Remote Exec: {command}")
    stdin, stdout, stderr = ssh.exec_command(command, get_pty=True)
    
    while True:
        line = stdout.readline()
        if not line:
            break
        print(f"  {line.rstrip()}")

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
    print("  EventManager — Full Remote Deployment (Ports 9510 - 9520)")
    print(f"  Target: {user}@{host}:{port}")
    print(f"  Target Directory: {remote_dir}")
    print("=" * 65)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        print("\n[1/7] Connecting to remote server...")
        ssh.connect(hostname=host, port=port, username=user, password=password, timeout=15)
        print("  SSH connection established!")

        # 1. Port Availability Check
        print("\n[2/7] Checking ports 9510 to 9520 on server...")
        stdin, stdout, stderr = ssh.exec_command("ss -tlpn | grep -E ':(951[0-9]|9520)' || echo 'ALL_PORTS_AVAILABLE'")
        port_check = stdout.read().decode().strip()
        print(f"  Port status:\n  {port_check}")

        # 2. Package Source Bundle
        print("\n[3/7] Packaging local files...")
        archive_name = BUNDLE_TAR
        create_bundle(archive_name)

        # 3. Create Remote Directory & Upload
        print(f"\n[4/7] Ensuring remote directory {remote_dir} exists...")
        ssh.exec_command(f"mkdir -p {remote_dir}")
        
        sftp = ssh.open_sftp()
        remote_tar = f"{remote_dir}/{archive_name}"
        upload_bundle_with_progress(sftp, archive_name, remote_tar)
        sftp.close()

        # 4. Extract on remote server
        print("\n[5/7] Extracting bundle on remote server...")
        extract_cmd = f"tar -xzf {archive_name} -C {remote_dir} && rm -f {archive_name}"
        status = run_ssh_stream(ssh, extract_cmd, cwd=remote_dir)
        if status != 0:
            raise RuntimeError("Failed to extract deployment bundle on remote server.")

        # 5. Build and Launch Containers
        print("\n[6/7] Building and launching containers with Docker Compose...")
        # First stop previous instances if any
        run_ssh_stream(ssh, "docker compose -f docker-compose.prod.yml down --remove-orphans || true", cwd=remote_dir)
        
        # Build and start
        build_cmd = "docker compose -f docker-compose.prod.yml up -d --build"
        status = run_ssh_stream(ssh, build_cmd, cwd=remote_dir)
        if status != 0:
            raise RuntimeError(f"Docker Compose failed with status {status}")

        # 6. Verify Service Status
        print("\n[7/7] Verifying running services...")
        time.sleep(12)
        run_ssh_stream(ssh, "docker compose -f docker-compose.prod.yml ps", cwd=remote_dir)
        run_ssh_stream(ssh, "docker compose -f docker-compose.prod.yml logs --tail 25 event-backend", cwd=remote_dir)

        # Health tests
        print("\n--- Health Checks on Remote Ports ---")
        run_ssh_stream(ssh, "curl -sI http://127.0.0.1:9510 | head -n 5 || echo 'Frontend check done'")
        run_ssh_stream(ssh, "curl -s http://127.0.0.1:9511/actuator/health || curl -sI http://127.0.0.1:9511/api/auth/login | head -n 5 || echo 'Backend check done'")

        print("\n" + "=" * 65)
        print("  🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉")
        print("=" * 65)
        print(f"  • Frontend Web App:     http://{host}:9510")
        print(f"  • Backend REST API:     http://{host}:9511")
        print(f"  • MySQL Database Port:  {host}:9512")
        print(f"  • phpMyAdmin:           http://{host}:9513")
        print("-" * 65)
        print("  Demo Credentials:")
        print("    - Caterer: demo@eventmanager.com / demo12345")
        print("    - Client:  demo-client-token")
        print("    - RSVP:    http://" + host + ":9510/rsvp/demo-rsvp-token-1")
        print("=" * 65)

    except Exception as e:
        print(f"\n[FATAL ERROR] {e}")
        sys.exit(1)
    finally:
        ssh.close()
        # Clean up local archive
        if os.path.exists(BUNDLE_TAR):
            try:
                os.remove(BUNDLE_TAR)
            except Exception:
                pass

if __name__ == "__main__":
    main()
