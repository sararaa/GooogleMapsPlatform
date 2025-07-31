# Linux Server Deployment Guide

## 🚀 Deploy Citizen Reporting System on Linux Server

### **Prerequisites**
- Ubuntu 20.04+ or CentOS 8+ server
- Root or sudo access
- Domain name (optional but recommended)
- At least 2GB RAM, 20GB storage

### **1. Initial Server Setup**

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git build-essential software-properties-common

# Install Python 3.9+
sudo apt install -y python3 python3-pip python3-venv

# Install Node.js 18+ (for frontend if needed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install system audio dependencies
sudo apt install -y portaudio19-dev python3-pyaudio
```

### **2. Clone and Setup Project**

```bash
# Clone your repository
git clone https://github.com/sararaa/GooogleMapsPlatform.git
cd GooogleMapsPlatform

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
cd backend
pip install -r requirements.txt

# If requirements.txt doesn't exist, install manually:
pip install twilio flask flask-cors python-dotenv requests
pip install sounddevice faster-whisper google-generativeai supabase
```

### **3. Environment Configuration**

```bash
# Create .env file in project root
cp backend/env_sample.txt .env

# Edit with your actual credentials
nano .env
```

### **4. Install and Configure Ngrok**

```bash
# Download and install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Authenticate ngrok (replace with your auth token)
ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN

# Test ngrok
ngrok http 5001 --log=stdout
```

### **5. Process Management with Systemd**

Create systemd services for automatic startup and management:

#### **Flask App Service**
```bash
sudo nano /etc/systemd/system/citizen-reports.service
```

```ini
[Unit]
Description=Citizen Reports Flask App
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/GooogleMapsPlatform
Environment=PATH=/home/ubuntu/GooogleMapsPlatform/venv/bin
ExecStart=/home/ubuntu/GooogleMapsPlatform/venv/bin/python backend/twilio_test.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### **Ngrok Service**
```bash
sudo nano /etc/systemd/system/ngrok.service
```

```ini
[Unit]
Description=Ngrok Tunnel
After=network.target

[Service]
Type=simple
User=ubuntu
ExecStart=/usr/local/bin/ngrok http 5001 --log=stdout
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### **Enable and Start Services**
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable services to start on boot
sudo systemctl enable citizen-reports.service
sudo systemctl enable ngrok.service

# Start services
sudo systemctl start citizen-reports.service
sudo systemctl start ngrok.service

# Check status
sudo systemctl status citizen-reports.service
sudo systemctl status ngrok.service
```

### **6. Firewall Configuration**

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow Flask app port (if accessing directly)
sudo ufw allow 5001

# Check status
sudo ufw status
```

### **7. Monitoring and Logs**

```bash
# View Flask app logs
sudo journalctl -u citizen-reports.service -f

# View ngrok logs
sudo journalctl -u ngrok.service -f

# View all logs together
sudo journalctl -u citizen-reports.service -u ngrok.service -f
```

### **8. Get Ngrok URL Programmatically**

Create a script to automatically get the ngrok URL:

```bash
nano get_ngrok_url.sh
```

```bash
#!/bin/bash
# Get ngrok public URL
curl -s http://localhost:4040/api/tunnels | python3 -c "
import sys, json
data = json.load(sys.stdin)
for tunnel in data['tunnels']:
    if tunnel['config']['addr'] == 'http://localhost:5001':
        print(tunnel['public_url'])
        break
"
```

```bash
chmod +x get_ngrok_url.sh
./get_ngrok_url.sh
```

### **9. Alternative: Use Reverse Proxy (Nginx)**

If you have a domain name, you can use Nginx instead of ngrok:

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/citizen-reports
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/citizen-reports /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL certificate (optional)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### **10. Automatic Updates**

Create a script for automatic updates:

```bash
nano update_app.sh
```

```bash
#!/bin/bash
cd /home/ubuntu/GooogleMapsPlatform
git pull origin main
source venv/bin/activate
pip install -r backend/requirements.txt
sudo systemctl restart citizen-reports.service
echo "App updated and restarted!"
```

```bash
chmod +x update_app.sh
```

### **11. Health Check Script**

```bash
nano health_check.sh
```

```bash
#!/bin/bash
# Check if Flask app is running
if curl -f http://localhost:5001/api/citizen-reports > /dev/null 2>&1; then
    echo "✅ Flask app is healthy"
else
    echo "❌ Flask app is down, restarting..."
    sudo systemctl restart citizen-reports.service
fi

# Check if ngrok is running
if curl -f http://localhost:4040/api/tunnels > /dev/null 2>&1; then
    echo "✅ Ngrok is healthy"
else
    echo "❌ Ngrok is down, restarting..."
    sudo systemctl restart ngrok.service
fi
```

### **12. Cron Jobs for Maintenance**

```bash
# Edit crontab
crontab -e

# Add these lines:
# Health check every 5 minutes
*/5 * * * * /home/ubuntu/GooogleMapsPlatform/health_check.sh

# Daily log cleanup (keep last 7 days)
0 2 * * * sudo journalctl --vacuum-time=7d
```

### **13. Security Considerations**

```bash
# Change default SSH port
sudo nano /etc/ssh/sshd_config
# Change Port 22 to Port 2222

# Disable root login
# PermitRootLogin no

# Restart SSH
sudo systemctl restart ssh

# Update UFW rules
sudo ufw delete allow ssh
sudo ufw allow 2222

# Install fail2ban for brute force protection
sudo apt install fail2ban
```

### **14. Troubleshooting**

```bash
# Check if ports are in use
sudo lsof -i :5001
sudo lsof -i :4040

# Check system resources
htop
df -h

# Check Python dependencies
source venv/bin/activate
pip list

# Test Flask app manually
cd backend
python twilio_test.py
```

### **15. Backup Strategy**

```bash
# Create backup script
nano backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/citizen-reports"
mkdir -p $BACKUP_DIR

# Backup code
tar -czf "$BACKUP_DIR/code_$DATE.tar.gz" /home/ubuntu/GooogleMapsPlatform

# Backup environment file
cp /home/ubuntu/GooogleMapsPlatform/.env "$BACKUP_DIR/env_$DATE.backup"

echo "Backup completed: $BACKUP_DIR"
```

## **🎯 Quick Start Commands**

Once everything is set up, use these commands:

```bash
# Start everything
sudo systemctl start citizen-reports.service ngrok.service

# Stop everything
sudo systemctl stop citizen-reports.service ngrok.service

# Restart everything
sudo systemctl restart citizen-reports.service ngrok.service

# Get ngrok URL
./get_ngrok_url.sh

# View logs
sudo journalctl -u citizen-reports.service -f
```

## **📞 Configure Twilio Webhook**

1. Get your ngrok URL: `./get_ngrok_url.sh`
2. In Twilio Console, set webhook URL to: `https://your-ngrok-url.ngrok.io`
3. Test by calling your Twilio number!

Your citizen reporting system is now running 24/7 on Linux! 🚀 