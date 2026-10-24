# Complete Ubuntu AWS EC2 Deployment Guide

> **Note for Beginners:** This guide assumes you have zero prior experience with AWS EC2, Linux command lines, Docker, or networking. Every command is written out completely with explanations.

---

## Table of Contents
1. [Prerequisites & Cost Awareness](#1-prerequisites--cost-awareness)
2. [Step 1: Launch an Ubuntu EC2 Instance](#step-1-launch-an-ubuntu-ec2-instance)
3. [Step 2: Configure EC2 Security Group (Firewall)](#step-2-configure-ec2-security-group-firewall)
4. [Step 3: Connect to EC2 via SSH](#step-3-connect-to-ec2-via-ssh)
5. [Step 4: Install Docker Engine and Docker Compose V2](#step-4-install-docker-engine-and-docker-compose-v2)
6. [Step 5: Transfer or Clone the College Portal Project](#step-5-transfer-or-clone-the-college-portal-project)
7. [Step 6: Configure Environment Secrets (.env)](#step-6-configure-environment-secrets-env)
8. [Step 7: Validate and Build the Containers](#step-7-validate-and-build-the-containers)
9. [Step 8: Verify Container Status and Inspect Logs](#step-8-verify-container-status-and-inspect-logs)
10. [Step 9: Access and Test the Portal Live](#step-9-access-and-test-the-portal-live)
11. [Step 10: Updating the Application (Maintenance Workflow)](#step-10-updating-the-application-maintenance-workflow)
12. [Step 11: Stopping, Restarting, and Data Preservation](#step-11-stopping-restarting-and-data-preservation)
13. [Step 12: Production Security and Optional HTTPS Setup](#step-12-production-security-and-optional-https-setup)
14. [Troubleshooting Common Deployment Issues](#troubleshooting-common-deployment-issues)

---

## 1. Prerequisites & Cost Awareness

### AWS Free Tier Notice
* If your AWS account is less than 12 months old, you are eligible for the **AWS Free Tier**, which includes **750 hours per month** of a `t2.micro` (or `t3.micro` in regions where `t2.micro` is unavailable) instance, plus **30 GB of EBS storage**.
* Running a single `t2.micro` instance 24/7 stays within this 750-hour free allocation.
* If your account is older than 12 months or you use resources outside free-tier limits, AWS will charge standard on-demand rates (approximately $8 to $10/month for a `t2.micro`).
* **Always stop or terminate EC2 instances when you are no longer using them** if you want to prevent unexpected costs.

---

## Step 1: Launch an Ubuntu EC2 Instance

1. Log into your **AWS Management Console** at [https://aws.amazon.com/console/](https://aws.amazon.com/console/).
2. In the top search bar, type **EC2** and select **EC2 Dashboard**.
3. Ensure your desired AWS Region is selected in the top-right corner (e.g., `us-east-1` (N. Virginia), `ap-south-1` (Mumbai), or `eu-west-1` (Ireland)).
4. Click the orange **Launch Instance** button.
5. Configure the instance settings:
   * **Name:** `college-portal-server`
   * **Application and OS Images (Amazon Machine Image):** Select **Ubuntu**, then choose **Ubuntu Server 24.04 LTS (HVM)** or **Ubuntu Server 22.04 LTS (HVM)** (64-bit x86). Both are Free Tier eligible.
   * **Instance Type:** Choose **`t2.micro`** (1 vCPU, 1 GiB Memory, Free tier eligible) or **`t3.micro`** / **`t3.small`** if you prefer faster Docker build times.
   * **Key pair (login):**
     - Click **Create new key pair**.
     - Name: `college-portal-key`.
     - Key pair type: `RSA`.
     - Private key file format: `.pem` (works on Windows PowerShell, Git Bash, macOS, and Linux).
     - Click **Create key pair**. The `.pem` file will download to your computer. **Store it safely!**
   * **Configure Storage:** Change the root volume size from 8 GiB to **20 GiB** (General Purpose SSD gp3). Free tier allows up to 30 GiB.

---

## Step 2: Configure EC2 Security Group (Firewall)

Under the **Network settings** section of the Launch Instance screen:
1. Select **Create security group**.
2. Security group name: `college-portal-security-group`.
3. Description: `Allow SSH from admin IP and HTTP from anywhere`.
4. Configure the following rules:

| Type | Protocol | Port Range | Source Type | Source / IP | Why It Is Needed |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SSH** | TCP | 22 | **My IP** | Your public IP (`x.x.x.x/32`) | Allows you to log in securely to manage the server. **Never set SSH to 0.0.0.0/0**. |
| **HTTP** | TCP | 80 | **Anywhere** | `0.0.0.0/0` | Allows public web browsers to view the College Portal frontend. |
| **HTTPS** (Optional) | TCP | 443 | **Anywhere** | `0.0.0.0/0` | Reserved for SSL/TLS encrypted traffic if you attach a domain. |

> **CRITICAL SECURITY RULE:** **NEVER** add an inbound rule for MySQL port `3306`! MySQL runs safely inside the private Docker internal bridge network (`college-portal-network`) and communicates with Spring Boot internally. It must never be exposed to the public internet.

5. Click **Launch Instance** at the bottom right.
6. Wait 1–2 minutes until the instance state changes to **Running** and Status check shows **2/2 checks passed**.
7. Click on your instance to view its details. Note the **Public IPv4 address** (e.g., `54.210.45.12`).

---

## Step 3: Connect to EC2 via SSH

### On Windows (using PowerShell):
1. Open PowerShell and navigate to the directory where your `college-portal-key.pem` was downloaded:
   ```powershell
   cd C:\Users\YourUsername\Downloads
   ```
2. Set appropriate Windows file permissions on your key file so SSH allows its use:
   ```powershell
   icacls.exe .\college-portal-key.pem /reset
   icacls.exe .\college-portal-key.pem /grant:r "$($env:USERNAME):(R)"
   icacls.exe .\college-portal-key.pem /inheritance:r
   ```
3. Connect to your EC2 instance (replace `54.210.45.12` with your actual EC2 Public IPv4 address):
   ```powershell
   ssh -i .\college-portal-key.pem ubuntu@54.210.45.12
   ```
4. If prompted with `Are you sure you want to continue connecting (yes/no/[fingerprint])?`, type `yes` and press Enter.

### On Linux or macOS:
1. Open Terminal and set permission 400 on the key:
   ```bash
   chmod 400 ~/Downloads/college-portal-key.pem
   ```
2. Connect:
   ```bash
   ssh -i ~/Downloads/college-portal-key.pem ubuntu@54.210.45.12
   ```

You are now logged into your remote Ubuntu server prompt: `ubuntu@ip-172-31-xx-xx:~$`.

---

## Step 4: Install Docker Engine and Docker Compose V2

Run the following commands on your Ubuntu server to install the latest official Docker Engine and the Docker Compose plugin:

```bash
# 1. Update existing package list
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install essential prerequisites
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 3. Add Docker's official GPG encryption key
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 4. Set up the Docker repository in apt sources
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Install Docker Engine, CLI, and Docker Compose plugin
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. Allow your ubuntu user to run Docker commands without sudo
sudo usermod -aG docker $USER

# 7. Apply the group changes immediately
newgrp docker
```

### Verify the Installation:
Run:
```bash
docker --version
docker compose version
```
Expected output:
```text
Docker version 27.x.x, build ...
Docker Compose version v2.x.x
```

---

## Step 5: Transfer or Clone the College Portal Project

### Option A: Clone from GitHub (Recommended)
If you have pushed your project to a GitHub repository:
```bash
cd ~
git clone https://github.com/<YOUR_GITHUB_USERNAME>/college-portal.git
cd college-portal
```

### Option B: Transfer via SCP (Direct file copy from your computer)
If the project is only on your local computer, run this command from your local Windows PowerShell (replace paths and IP):
```powershell
# From local Windows PowerShell:
scp -i .\college-portal-key.pem -r C:\Users\vinay\college-portal ubuntu@54.210.45.12:~/college-portal
```
Then on the Ubuntu server, navigate into the directory:
```bash
cd ~/college-portal
```

---

## Step 6: Configure Environment Secrets (.env)

Do not commit real database passwords to version control. On the EC2 server, generate a real `.env` file from the provided `.env.example`:

```bash
# Copy the example file to .env
cp .env.example .env

# Edit the .env file with nano
nano .env
```

Inside the `nano` editor, set strong, unique passwords:
```env
MYSQL_ROOT_PASSWORD=SuperSecretRootPass987#
MYSQL_DATABASE=college_db
MYSQL_USER=college_user
MYSQL_PASSWORD=SuperSecretUserPass456#
PORT=80
```
* Press `Ctrl + O`, then press `Enter` to save.
* Press `Ctrl + X` to exit `nano`.

Restrict file permissions so only your user can read `.env`:
```bash
chmod 600 .env
```

---

## Step 7: Validate and Build the Containers

### 1. Validate the Docker Compose Configuration:
```bash
docker compose config
```
This prints the resolved configuration and verifies that all environment variables, networks, and volume definitions are syntactically valid.

### 2. Build and Start All Services in the Background:
```bash
docker compose up -d --build
```

**What this command does:**
* Downloads `mysql:8.0` and creates the persistent volume `college_mysql_data`.
* Builds the Spring Boot backend inside a multi-stage Maven container, packaging Java 17 artifacts into a lightweight Alpine image.
* Builds the React frontend using Node 20 and packages the production bundle into a high-performance Nginx web server.
* Links all three containers securely on the private `college-portal-network`.
* Configures automatic restarts (`restart: unless-stopped`).

---

## Step 8: Verify Container Status and Inspect Logs

### 1. Check Container Status:
```bash
docker compose ps
```
Expected output:
```text
NAME               IMAGE                   COMMAND                  SERVICE    CREATED          STATUS                    PORTS
college-backend    college-portal-backend  "sh -c 'java $JAVA_O…"   backend    1 minute ago     Up 1 minute (healthy)     8080/tcp
college-frontend   college-portal-frontend "/docker-entrypoint.…"   frontend   1 minute ago     Up 1 minute (healthy)     0.0.0.0:80->80/tcp
college-mysql      mysql:8.0               "docker-entrypoint.s…"   mysql      1 minute ago     Up 1 minute (healthy)     3306/tcp
```
Notice that all three services show `Up` and `(healthy)`.

### 2. View Real-Time Logs:
To check logs from all services:
```bash
docker compose logs -f
```
Or check individual service logs:
```bash
# Backend logs:
docker compose logs -f backend

# MySQL logs:
docker compose logs -f mysql

# Frontend / Nginx logs:
docker compose logs -f frontend
```
*(Press `Ctrl + C` at any time to exit the log view without stopping the containers).*

---

## Step 9: Access and Test the Portal Live

1. Open any web browser on your computer or mobile phone.
2. In the address bar, enter your EC2 instance's **Public IPv4 address**:
   ```
   http://54.210.45.12
   ```
   *(Do NOT include `https://` because SSL is not yet configured, and do NOT include `:80` because port 80 is the default HTTP port).*
3. The **College Portal** dashboard will load immediately:
   * **Dashboard Tab:** Displays total student count, department distribution progress bars, and recent students.
   * **Top Bar:** The status pill displays **System Online** with a glowing green dot.
4. Test the CRUD features end-to-end:
   * Click **New Student** and enter:
     - Name: `Jane Doe`
     - Email: `jane.doe@college.edu`
     - Department: `Computer Science`
     - Academic Year: `2nd Year`
     - Phone: `+1-555-9876`
   * Click **Save Student**. Notice the instant green confirmation toast and live dashboard counter increment.
   * Go to **Students Directory** tab: verify `Jane Doe` appears in the table with ID `STU-0006`.
   * Test the search bar: type `Jane` to filter.
   * Click the **Eye icon**: view student profile modal.
   * Click the **Pencil icon**: update her department or academic year and save.
   * Click the **Trash icon**: confirm permanent deletion and verify the table refreshes.

---

## Step 10: Updating the Application (Maintenance Workflow)

When you make changes to the code (e.g. backend Java classes or frontend React components) and push them to GitHub, update your EC2 server in two simple commands:

```bash
cd ~/college-portal

# 1. Pull the latest code
git pull origin main

# 2. Rebuild and restart the containers with zero data loss
docker compose up -d --build
```
Docker Compose will intelligently detect which Dockerfile layers changed, recompile only the modified services, and swap in the newly built containers with minimal downtime.

---

## Step 11: Stopping, Restarting, and Data Preservation

### How to Stop Containers Temporarily:
```bash
docker compose stop
```

### How to Start Stopped Containers:
```bash
docker compose start
```

### How to Shut Down Containers (Safely preserving database data):
```bash
docker compose down
```
> **IMPORTANT:** Running `docker compose down` deletes the temporary container wrappers, but **DOES NOT** touch your student database. The database is stored safely in the named volume `college_mysql_data`.
> When you run `docker compose up -d` again, all your students, departments, and records remain intact!

### What NOT to Run:
**NEVER** run `docker compose down -v` unless you explicitly want to wipe out the database volume permanently.

---

## Step 12: Production Security and Optional HTTPS Setup

### Security Best Practices Implemented:
1. **No Public MySQL Port:** MySQL runs exclusively on `college-portal-network`. External scanners cannot reach MySQL.
2. **Non-Root Container Users:** The Spring Boot container runs under an unprivileged `appuser`.
3. **Environment Segregation:** Passwords exist only in `.env` (permissions `600`) and are not committed to Git.
4. **Security Headers in Nginx:** Includes `X-Frame-Options`, `X-Content-Type-Options`, and `X-XSS-Protection`.

### Optional: Setting Up a Custom Domain and Free HTTPS (SSL/TLS)
When you are ready to point a domain (e.g., `portal.yourcollege.edu`) to your EC2 instance:
1. Create an **A Record** in your DNS registrar pointing your domain name to your EC2 Public IP.
2. Ensure EC2 Security Group has port **443 (HTTPS)** open.
3. Install Certbot on Ubuntu:
   ```bash
   sudo apt-get install -y certbot
   ```
4. Request a Let's Encrypt certificate:
   ```bash
   sudo certbot certonly --standalone -d portal.yourcollege.edu
   ```
5. Mount the certificates into `frontend/nginx.conf` and expose port 443 in `docker-compose.yml`.

---

## Troubleshooting Common Deployment Issues

### Issue 1: Browser says "This site can’t be reached" (Connection Timed Out)
* **Root Cause:** EC2 Security Group inbound rule for port 80 is missing or restricted.
* **Fix:** Go to AWS Console -> EC2 -> Security Groups -> Edit Inbound Rules -> Add Rule:
  - Type: `HTTP`
  - Port: `80`
  - Source: `0.0.0.0/0` (Anywhere IPv4)
  - Save rules.

### Issue 2: `Permission denied (publickey)` when running SSH
* **Root Cause:** Wrong key file, incorrect username, or loose file permissions on the `.pem` file.
* **Fix:**
  - Verify you are connecting as `ubuntu` (not `root` or `ec2-user`).
  - On Linux/Mac, run `chmod 400 college-portal-key.pem`.
  - Ensure you specified the correct path to the key file with `-i`.

### Issue 3: Nginx 502 Bad Gateway
* **Root Cause:** Backend Spring Boot container is still starting up or failed to connect to MySQL.
* **Fix:**
  1. Check backend status:
     ```bash
     docker compose logs --tail=100 backend
     ```
  2. If MySQL was slow to initialize, restart the backend:
     ```bash
     docker compose restart backend
     ```

### Issue 4: Docker build runs out of memory on `t2.micro`
* **Root Cause:** `t2.micro` instances have 1 GiB RAM. Running Maven compile and Vite build simultaneously might exhaust memory.
* **Fix:** Add a temporary 2 GB swap file on Ubuntu:
  ```bash
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```
  Then run `docker compose up -d --build` again. It will build smoothly!

---

*End of Deployment Guide. You have a battle-tested, secure, containerized College Portal deployed on AWS EC2!*
