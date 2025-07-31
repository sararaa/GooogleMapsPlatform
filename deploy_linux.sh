#!/bin/bash

# Citizen Reporting System - Linux Deployment Script
# Run with: chmod +x deploy_linux.sh && ./deploy_linux.sh

set -e

echo "🚀 Starting Citizen Reporting System deployment on Linux..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install system dependencies
print_status "Installing system dependencies..."
sudo apt install -y curl wget git build-essential software-properties-common
sudo apt install -y python3 python3-pip python3-venv
sudo apt install -y portaudio19-dev python3-pyaudio

# Install ngrok
print_status "Installing ngrok..."
if ! command -v ngrok &> /dev/null; then
    curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
    echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
    sudo apt update && sudo apt install ngrok
    print_status "Ngrok installed successfully"
else
    print_status "Ngrok already installed"
fi

# Setup Python virtual environment
print_status "Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating template..."
    cat > .env << 'EOF'
# Twilio Configuration
TWILIO_ACCOUNTSID=your_twilio_account_sid_here
TWILIO_AUTHTOKEN=your_twilio_auth_token_here
TWILIO_NUMBER=your_twilio_phone_number_here

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
EOF
    print_warning "Please edit .env file with your actual API keys before running the app"
fi

# Create systemd service for Flask app
print_status "Creating systemd service for Flask app..."
sudo tee /etc/systemd/system/citizen-reports.service > /dev/null << EOF
[Unit]
Description=Citizen Reports Flask App
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PWD
Environment=PATH=$PWD/venv/bin
ExecStart=$PWD/venv/bin/python backend/twilio_test.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create systemd service for ngrok
print_status "Creating systemd service for ngrok..."
sudo tee /etc/systemd/system/ngrok.service > /dev/null << EOF
[Unit]
Description=Ngrok Tunnel
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=/usr/bin/ngrok http 5001 --log=stdout
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create utility scripts
print_status "Creating utility scripts..."

# Ngrok URL getter script
cat > get_ngrok_url.sh << 'EOF'
#!/bin/bash
curl -s http://localhost:4040/api/tunnels | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for tunnel in data['tunnels']:
        if tunnel['config']['addr'] == 'http://localhost:5001':
            print(tunnel['public_url'])
            break
    else:
        print('No tunnel found for port 5001')
except:
    print('Could not get ngrok URL. Make sure ngrok is running.')
"
EOF
chmod +x get_ngrok_url.sh

# Health check script
cat > health_check.sh << 'EOF'
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
EOF
chmod +x health_check.sh

# Update script
cat > update_app.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating Citizen Reporting System..."
git pull origin main
source venv/bin/activate
pip install -r backend/requirements.txt
sudo systemctl restart citizen-reports.service
echo "✅ App updated and restarted!"
EOF
chmod +x update_app.sh

# Reload systemd and enable services
print_status "Enabling systemd services..."
sudo systemctl daemon-reload
sudo systemctl enable citizen-reports.service
sudo systemctl enable ngrok.service

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 5001
sudo ufw --force enable

print_status "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit .env file with your API keys: nano .env"
echo "2. Configure ngrok auth token: ngrok config add-authtoken YOUR_TOKEN"
echo "3. Start services: sudo systemctl start citizen-reports.service ngrok.service"
echo "4. Get ngrok URL: ./get_ngrok_url.sh"
echo "5. Configure Twilio webhook with the ngrok URL"
echo ""
echo "🔧 Useful Commands:"
echo "  Start services:   sudo systemctl start citizen-reports.service ngrok.service"
echo "  Stop services:    sudo systemctl stop citizen-reports.service ngrok.service"
echo "  View logs:        sudo journalctl -u citizen-reports.service -f"
echo "  Health check:     ./health_check.sh"
echo "  Update app:       ./update_app.sh"
echo ""
print_status "Your citizen reporting system is ready! 🚀" 