# DevOps Cloud Project

Hands-on full-stack deployment project using React, Express, PostgreSQL, Docker Compose, GitHub Actions, and AWS EC2.

## Architecture

Browser -> Nginx/React :80 -> Express API :3000 -> PostgreSQL :5432

Only port 80 is published by Docker Compose. PostgreSQL stays private inside the Compose network.

## 1. Prerequisites

Install Git, Docker Desktop, and VS Code. Docker Desktop includes Docker Compose on Windows/macOS.

Verify:

```bash
git --version
docker --version
docker compose version
```

## 2. Run locally

```bash
cp .env.example .env
# edit DB_PASSWORD in .env
docker compose up -d --build
```

Open http://localhost

Health check:

```bash
curl http://localhost/api/health
```

Useful commands:

```bash
docker compose ps
docker compose logs -f
docker compose down
docker compose down -v   # WARNING: removes DB data
```

## 3. GitHub

```bash
git init
git add .
git commit -m "Initial DevOps cloud project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/devops-cloud-project.git
git push -u origin main
```

The CI workflow builds all containers on pushes and pull requests to main.

## 4. AWS EC2

Create an Ubuntu EC2 instance. For a learning environment, a small instance is enough. Configure the security group initially with:

- SSH TCP 22: source = your public IP only
- HTTP TCP 80: source = 0.0.0.0/0 and ::/0
- Later, HTTPS TCP 443: source = 0.0.0.0/0 and ::/0

Do NOT expose PostgreSQL 5432 publicly.

Connect:

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Install Git and Docker using Docker's official Ubuntu installation instructions, then verify:

```bash
git --version
docker --version
docker compose version
```

Clone and deploy:

```bash
git clone https://github.com/YOUR_USERNAME/devops-cloud-project.git
cd devops-cloud-project
cp .env.example .env
nano .env
sudo docker compose up -d --build
```

If your user has been added to the docker group and you have re-logged in, `sudo` is not needed.

Browse to:

http://YOUR_EC2_PUBLIC_IP

## 5. Automatic deployment with GitHub Actions

Repository -> Settings -> Secrets and variables -> Actions. Add:

- EC2_HOST = EC2 public IP or hostname
- EC2_USER = ubuntu
- EC2_SSH_KEY = contents of your EC2 private SSH key

The supplied deploy.yml connects to the EC2 server, pulls main, rebuilds the containers and restarts the Compose application.

For a learning project this is easy to understand. For production, prefer OIDC/SSM, immutable images from a registry, restricted deployment credentials, and a managed database.

## 6. Domain + HTTPS (next upgrade)

Point an A record for your domain to the EC2 public IP (preferably an Elastic IP), expose ports 80/443, and add a TLS reverse proxy such as Caddy, Traefik, or Nginx + Certbot.

## 7. Production upgrade path

1. PostgreSQL -> Amazon RDS
2. EC2 public IP -> Elastic IP / ALB
3. Docker builds -> GHCR or Amazon ECR
4. SSH deployment -> AWS SSM / OIDC deployment
5. Secrets -> AWS Secrets Manager / SSM Parameter Store
6. Add HTTPS and domain
7. Add Terraform for infrastructure as code
8. Add CloudWatch/Prometheus/Grafana monitoring
9. Add automated backend/frontend tests and DB migrations
10. Move to ECS/Fargate or Kubernetes only when the application needs it

## CI/CD Pipeline
