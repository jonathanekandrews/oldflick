#!/bin/bash
set -e

echo "=== Oldflick Production Deployment Script ==="
echo "Starting deployment to DigitalOcean..."

# Update system
echo "\n[1/10] Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 20.x
echo "\n[2/10] Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install other dependencies
echo "\n[3/10] Installing Nginx, Git, and other tools..."
apt install -y nginx git certbot python3-certbot-nginx

# Install PM2 globally
echo "\n[4/10] Installing PM2 process manager..."
npm install -g pm2

# Clone repository
echo "\n[5/10] Cloning Oldflick repository from GitHub..."
cd /root
if [ -d "oldflick" ]; then
  rm -rf oldflick
fi
git clone https://github.com/jonathanekandrews/oldflick.git
cd oldflick

# Install dependencies
echo "\n[6/10] Installing Node.js dependencies..."
npm install

echo "\n[7/10] Please enter your environment variables:"
read -p "Enter DATABASE_URL (Neon): " DATABASE_URL
read -p "Enter SUPABASE_URL: " SUPABASE_URL
read -p "Enter SUPABASE_KEY: " SUPABASE_KEY
read -p "Enter STRIPE_SECRET_KEY: " STRIPE_SECRET_KEY

# Create .env file
echo "\n[8/10] Creating environment file..."
cat > .env << ENVEOF
DATABASE_URL=$DATABASE_URL
SUPABASE_URL=$SUPABASE_URL
SUPABASE_KEY=$SUPABASE_KEY
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
NODE_ENV=production
PORT=3001
ENVEOF

# Start with PM2
echo "\n[9/10] Starting application with PM2..."
pm2 start server/index.js --name oldflick
pm2 startup
pm2 save

# Configure Nginx
echo "\n[10/10] Configuring Nginx reverse proxy..."
cat > /etc/nginx/sites-available/oldflick << NGINXEOF
server {
    listen 80;
    server_name oldflick.com www.oldflick.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/oldflick /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo "\n✅ Deployment Complete!"
echo "\n=== Next Steps ==="
echo "1. Update your Namecheap DNS:"
echo "   - A Record: @ -> 46.101.45.147"
echo "   - A Record: www -> 46.101.45.147"
echo "\n2. Wait 5-10 minutes for DNS propagation"
echo "\n3. Run SSL setup:"
echo "   certbot --nginx -d oldflick.com -d www.oldflick.com"
echo "\n4. Check status:"
echo "   pm2 status"
echo "   pm2 logs oldflick"
echo "\nYour IP: 46.101.45.147"
