import json
import sys
import paramiko

def test_connection():
    with open("server-config.json", "r", encoding="utf-8") as f:
        config = json.load(f)
    
    server = config["server"]
    host = server["host"]
    port = server.get("port", 22)
    user = server["user"]
    password = server.get("password")

    print(f"Connecting to {user}@{host}:{port}...")

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        ssh.connect(hostname=host, port=port, username=user, password=password, timeout=10)
        print("SSH Connection SUCCESSFUL!")
        
        commands = [
            "whoami",
            "uname -a",
            "docker --version 2>&1 || echo 'docker not found'",
            "docker compose version 2>&1 || echo 'docker compose not found'",
            "free -h",
            "df -h /"
        ]

        for cmd in commands:
            print(f"\n--- Running: {cmd} ---")
            stdin, stdout, stderr = ssh.exec_command(cmd)
            out = stdout.read().decode('utf-8', errors='replace').strip()
            err = stderr.read().decode('utf-8', errors='replace').strip()
            if out:
                print(out)
            if err:
                print(f"[stderr] {err}")

        ssh.close()
        print("\nTest completed successfully.")
        return True

    except Exception as e:
        print(f"SSH Connection FAILED: {e}")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
