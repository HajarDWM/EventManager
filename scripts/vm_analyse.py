#!/usr/bin/env python3
"""
Script d'analyse et d'inspection rapide du Serveur Local / Staging (Ubuntu VM)
Connecte en SSH à 192.168.11.110 (hajar) et vérifie la santé, l'espace disque,
l'état des conteneurs Docker et les logs backend.
"""

import sys
import paramiko
from pathlib import Path

CONFIG_FILE = Path(__file__).resolve().parent.parent / "server-config-staging.json"
ENV_FILE = Path(__file__).resolve().parent.parent / ".env.local_server"

def load_credentials():
    creds = {
        "host": "192.168.11.110",
        "port": 22,
        "user": "hajar",
        "password": "199600",
        "remote_dir": "/home/hajar/apps/EventManager"
    }
    
    if ENV_FILE.exists():
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("#") or not line or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k == "VM_HOST": creds["host"] = v
                elif k == "VM_PORT": creds["port"] = int(v)
                elif k == "VM_USER": creds["user"] = v
                elif k == "VM_PASSWORD": creds["password"] = v
                elif k == "VM_REMOTE_DIR": creds["remote_dir"] = v

    return creds

def run_ssh_command(client, command, title=None):
    if title:
        print(f"\n{'='*70}\n[ANALYSE] {title}\n{'='*70}")
    stdin, stdout, stderr = client.exec_command(command, get_pty=True)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if out:
        print(out)
    if err and err != out:
        print(f"[STDERR]: {err}")
    return out

def main():
    creds = load_credentials()
    print(f"\n[SSH Connect] Connexion à {creds['user']}@{creds['host']}:{creds['port']} ...")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(
            hostname=creds["host"],
            port=creds["port"],
            username=creds["user"],
            password=creds["password"],
            timeout=10
        )
        print(" Connexion SSH réussie avec succès!\n")
    except Exception as e:
        print(f"❌ Échec de connexion SSH: {e}")
        sys.exit(1)

    remote_dir = creds["remote_dir"]

    # 1. Espace disque
    run_ssh_command(ssh, "df -h /", "1. Espace Disque (Partition /)")

    # 2. État des conteneurs Docker
    run_ssh_command(ssh, f"cd {remote_dir} && docker compose ps", "2. État des Conteneurs Docker")

    # 3. Dernières lignes des logs Backend
    run_ssh_command(ssh, f"cd {remote_dir} && docker compose logs --tail=15 event-backend", "3. Logs Récents Event Backend")

    # 4. Vérification API Templates & Version
    run_ssh_command(ssh, "curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/api/templates", "4. Statut HTTP Endpoint /api/templates (Code 200 attendu)")

    ssh.close()
    print("\n Analyse du serveur local terminée avec succès.\n")

if __name__ == "__main__":
    main()

