export interface PlatformStep {
  title: string;
  detail: string;
  command?: string;
  actionUrl?: string;
  actionLabel?: string;
}

const RAILWAY_STEPS = (framework?: string): PlatformStep[] => [
  {
    title: "Install the Railway CLI",
    detail: "The Railway CLI lets you deploy, manage services, and stream logs from your terminal.",
    command: "npm install -g @railway/cli",
    actionUrl: "https://docs.railway.app/guides/cli",
    actionLabel: "CLI docs"
  },
  {
    title: "Log in and initialise",
    detail: "Authenticate your terminal session and link this directory to a Railway project.",
    command: "railway login && railway init"
  },
  {
    title: framework === "csharp" ? "Add a Dockerfile" : "Confirm your start command",
    detail:
      framework === "csharp"
        ? "Railway builds from a Dockerfile. Add one at the repo root that targets your .NET runtime."
        : "Railway reads the `start` script from package.json. Confirm it starts your server process.",
    command:
      framework === "csharp"
        ? 'echo "FROM mcr.microsoft.com/dotnet/aspnet:8.0\\nWORKDIR /app\\nCOPY . .\\nRUN dotnet publish -c Release -o out\\nENTRYPOINT [\\"dotnet\\", \\"out/App.dll\\"]" > Dockerfile'
        : undefined
  },
  {
    title: "Set environment variables",
    detail: "Push your .env.example keys to Railway — never commit real secrets.",
    command: "railway variables set DATABASE_URL=... REDIS_URL=...",
    actionUrl: "https://docs.railway.app/guides/variables",
    actionLabel: "Variables docs"
  },
  {
    title: "Deploy",
    detail: "Trigger a deploy from the current directory. Railway will build and start your service.",
    command: "railway up"
  }
];

const FLY_STEPS = (framework?: string): PlatformStep[] => [
  {
    title: "Install flyctl",
    detail: "flyctl is the Fly.io CLI — it handles app creation, deploys, and secrets.",
    command: "brew install flyctl",
    actionUrl: "https://fly.io/docs/hands-on/install-flyctl/",
    actionLabel: "Install docs"
  },
  {
    title: "Log in",
    detail: "Authenticate your flyctl session.",
    command: "flyctl auth login"
  },
  {
    title: "Launch the app",
    detail:
      framework === "csharp"
        ? "flyctl will detect your Dockerfile and configure the app. Confirm the .NET runtime settings."
        : "flyctl detects your runtime and generates a fly.toml config file.",
    command: "flyctl launch",
    actionUrl: "https://fly.io/docs/reference/configuration/",
    actionLabel: "fly.toml reference"
  },
  {
    title: "Set secrets",
    detail: "Add environment variables as encrypted Fly secrets.",
    command: "flyctl secrets set DATABASE_URL=... REDIS_URL=..."
  },
  {
    title: "Deploy",
    detail: "Build and push your app to Fly's infrastructure.",
    command: "flyctl deploy"
  }
];

const VERCEL_STEPS = (): PlatformStep[] => [
  {
    title: "Install the Vercel CLI",
    detail: "The Vercel CLI lets you deploy and manage projects from your terminal.",
    command: "npm install -g vercel",
    actionUrl: "https://vercel.com/docs/cli",
    actionLabel: "CLI docs"
  },
  {
    title: "Log in",
    detail: "Authenticate and link your Vercel account.",
    command: "vercel login"
  },
  {
    title: "Deploy",
    detail: "Vercel auto-detects Next.js and configures build settings. Follow the prompts.",
    command: "vercel",
    actionUrl: "https://vercel.com/docs/deployments/overview",
    actionLabel: "Deploy docs"
  },
  {
    title: "Set environment variables",
    detail: "Add secrets in the Vercel dashboard or via CLI.",
    command: "vercel env add",
    actionUrl: "https://vercel.com/docs/environment-variables",
    actionLabel: "Env vars docs"
  },
  {
    title: "Set up production domain",
    detail: "Promote to production and attach your custom domain.",
    command: "vercel --prod",
    actionUrl: "https://vercel.com/docs/projects/domains",
    actionLabel: "Domains docs"
  }
];

const RENDER_STEPS = (framework?: string): PlatformStep[] => [
  {
    title: "Connect your GitHub repository",
    detail: "Render deploys directly from GitHub. Connect the repo in the Render dashboard.",
    actionUrl: "https://dashboard.render.com/new/web",
    actionLabel: "Open Render dashboard"
  },
  {
    title: "Configure build and start commands",
    detail:
      framework === "csharp"
        ? "Set build command to `dotnet publish -c Release -o out` and start command to `dotnet out/App.dll`."
        : framework === "python"
          ? "Set build command to `pip install -r requirements.txt` and start to `uvicorn main:app` or `gunicorn`."
          : "Set your build command (e.g. `npm run build`) and start command (e.g. `npm start`).",
    actionUrl: "https://docs.render.com/deploys",
    actionLabel: "Deploy docs"
  },
  {
    title: "Add a render.yaml (optional but recommended)",
    detail: "Declare your service as Infrastructure as Code for reproducible deploys.",
    command:
      framework === "csharp"
        ? `cat > render.yaml << 'EOF'\nservices:\n  - type: web\n    name: my-app\n    runtime: docker\n    buildCommand: dotnet publish -c Release -o out\n    startCommand: dotnet out/App.dll\nEOF`
        : `cat > render.yaml << 'EOF'\nservices:\n  - type: web\n    name: my-app\n    runtime: node\n    buildCommand: npm install && npm run build\n    startCommand: npm start\nEOF`,
    actionUrl: "https://docs.render.com/infrastructure-as-code",
    actionLabel: "IaC docs"
  },
  {
    title: "Set environment variables",
    detail: "Add secrets in the Render dashboard under Environment.",
    actionUrl: "https://docs.render.com/configure-environment-variables",
    actionLabel: "Env vars docs"
  },
  {
    title: "Deploy",
    detail: "Trigger a manual deploy or push to your main branch to auto-deploy.",
    actionUrl: "https://dashboard.render.com",
    actionLabel: "Open dashboard"
  }
];

const AZURE_ACA_STEPS = (framework?: string): PlatformStep[] => [
  {
    title: "Install the Azure CLI",
    detail: "The Azure CLI and Container Apps extension are needed to create and manage your app.",
    command: "brew install azure-cli && az extension add --name containerapp",
    actionUrl: "https://learn.microsoft.com/en-us/azure/container-apps/get-started",
    actionLabel: "ACA quickstart"
  },
  {
    title: "Log in to Azure",
    detail: "Authenticate your CLI session and select the target subscription.",
    command: "az login && az account set --subscription <SUBSCRIPTION_ID>"
  },
  {
    title: "Create a resource group and Container Apps environment",
    detail: "All Container Apps in the same environment share a virtual network and logging.",
    command: "az group create --name my-rg --location eastus && az containerapp env create --name my-env --resource-group my-rg --location eastus"
  },
  {
    title: framework === "csharp" ? "Build and push the .NET image" : "Build and push your container image",
    detail:
      framework === "csharp"
        ? "Build the Docker image from your Dockerfile and push it to Azure Container Registry."
        : "Build your Docker image and push it to Azure Container Registry or Docker Hub.",
    command:
      framework === "csharp"
        ? "az acr build --registry <ACR_NAME> --image myapp:latest ."
        : "az acr build --registry <ACR_NAME> --image myapp:latest .",
    actionUrl: "https://learn.microsoft.com/en-us/azure/container-registry/container-registry-quickstart-task-cli",
    actionLabel: "ACR docs"
  },
  {
    title: "Deploy the container app",
    detail: "Create the Container App using the pushed image and set required environment variables.",
    command: "az containerapp create --name myapp --resource-group my-rg --environment my-env --image <ACR_NAME>.azurecr.io/myapp:latest --target-port 8080 --ingress external",
    actionUrl: "https://learn.microsoft.com/en-us/azure/container-apps/",
    actionLabel: "ACA docs"
  }
];

const AWS_STEPS = (framework?: string): PlatformStep[] => [
  {
    title: "Install the AWS CLI and configure credentials",
    detail: "The AWS CLI is used to push images to ECR and create App Runner services.",
    command: "brew install awscli && aws configure",
    actionUrl: "https://docs.aws.amazon.com/apprunner/latest/dg/getting-started.html",
    actionLabel: "App Runner docs"
  },
  {
    title: "Create an ECR repository and push your image",
    detail: framework === "csharp"
      ? "Build the .NET Docker image and push it to Elastic Container Registry."
      : "Build your Docker image and push it to ECR for App Runner to pull from.",
    command: "aws ecr create-repository --repository-name myapp && aws ecr get-login-password | docker login --username AWS --password-stdin <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com && docker build -t myapp . && docker tag myapp:latest <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/myapp:latest && docker push <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/myapp:latest"
  },
  {
    title: "Create an App Runner service",
    detail: "Point App Runner at your ECR image — it handles scaling, load balancing, and TLS automatically.",
    command: "aws apprunner create-service --service-name myapp --source-configuration '{\"ImageRepository\":{\"ImageIdentifier\":\"<ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/myapp:latest\",\"ImageRepositoryType\":\"ECR\"}}'",
    actionUrl: "https://docs.aws.amazon.com/apprunner/latest/dg/service-source-image.html",
    actionLabel: "Image source docs"
  },
  {
    title: "Set environment variables",
    detail: "Add secrets via App Runner environment variables or AWS Secrets Manager.",
    actionUrl: "https://docs.aws.amazon.com/apprunner/latest/dg/service-configure-secrets.html",
    actionLabel: "Secrets docs"
  },
  {
    title: "Verify and set up auto-deploy",
    detail: "Enable automatic deployments from ECR so every image push triggers a redeploy.",
    actionUrl: "https://docs.aws.amazon.com/apprunner/latest/dg/manage-automatic-deployments.html",
    actionLabel: "Auto-deploy docs"
  }
];

const GCP_STEPS = (framework?: string): PlatformStep[] => [
  {
    title: "Install and initialise the gcloud CLI",
    detail: "The gcloud CLI is used to build, push, and deploy to Cloud Run.",
    command: "brew install --cask google-cloud-sdk && gcloud init",
    actionUrl: "https://cloud.google.com/run/docs/quickstarts",
    actionLabel: "Cloud Run quickstart"
  },
  {
    title: "Enable required APIs",
    detail: "Enable Cloud Run and Artifact Registry for your project.",
    command: "gcloud services enable run.googleapis.com artifactregistry.googleapis.com"
  },
  {
    title: framework === "python" ? "Build and deploy your Python service" : "Build and deploy your container",
    detail:
      framework === "python"
        ? "Cloud Run can build directly from source using a Buildpack — no Dockerfile required for most Python apps."
        : "Build your Docker image and deploy it to Cloud Run in a single command.",
    command:
      framework === "python"
        ? "gcloud run deploy myapp --source . --region us-central1 --allow-unauthenticated"
        : "gcloud run deploy myapp --source . --region us-central1 --allow-unauthenticated",
    actionUrl: "https://cloud.google.com/run/docs/deploying-source-code",
    actionLabel: "Deploy from source"
  },
  {
    title: "Set environment variables and secrets",
    detail: "Add configuration via Cloud Run environment variables or Secret Manager for sensitive values.",
    command: "gcloud run services update myapp --set-env-vars KEY=VALUE --region us-central1",
    actionUrl: "https://cloud.google.com/run/docs/configuring/services/secrets",
    actionLabel: "Secrets docs"
  },
  {
    title: "Set up continuous deployment",
    detail: "Connect Cloud Run to Cloud Build or GitHub Actions for automatic deploys on push.",
    actionUrl: "https://cloud.google.com/run/docs/continuous-deployment-with-cloud-build",
    actionLabel: "CI/CD docs"
  }
];

const HEROKU_STEPS = (framework?: string): PlatformStep[] => [
  {
    title: "Install the Heroku CLI",
    detail: "The Heroku CLI handles app creation, deploys, and add-on management.",
    command: "brew tap heroku/brew && brew install heroku",
    actionUrl: "https://devcenter.heroku.com/articles/heroku-cli",
    actionLabel: "CLI docs"
  },
  {
    title: "Log in and create the app",
    detail: "Authenticate your session and create a new Heroku app.",
    command: "heroku login && heroku create myapp"
  },
  {
    title: framework === "python" ? "Confirm Procfile and runtime.txt" : "Confirm Procfile and start script",
    detail:
      framework === "python"
        ? "Heroku uses Procfile to know how to start your app. Add `web: gunicorn app:app` (or your WSGI entrypoint). Add runtime.txt to pin the Python version."
        : "Heroku reads the Procfile to start your app. Add `web: node server.js` (or your entrypoint). Confirm the start script in package.json.",
    command: framework === "python" ? 'echo "web: gunicorn app:app" > Procfile && echo "python-3.11.x" > runtime.txt' : undefined,
    actionUrl: "https://devcenter.heroku.com/articles/procfile",
    actionLabel: "Procfile docs"
  },
  {
    title: "Add database and set environment variables",
    detail: "Provision Heroku Postgres and push your config vars.",
    command: "heroku addons:create heroku-postgresql:mini && heroku config:set SECRET_KEY=...",
    actionUrl: "https://devcenter.heroku.com/articles/heroku-postgresql",
    actionLabel: "Postgres docs"
  },
  {
    title: "Deploy",
    detail: "Push to Heroku's git remote to trigger a deploy.",
    command: "git push heroku main",
    actionUrl: "https://devcenter.heroku.com/articles/git",
    actionLabel: "Git deploy docs"
  }
];

const DIGITALOCEAN_STEPS = (framework?: string): PlatformStep[] => [
  {
    title: "Connect your GitHub repository",
    detail: "DigitalOcean App Platform deploys directly from GitHub. Open the App Platform console and select your repo.",
    actionUrl: "https://cloud.digitalocean.com/apps/new",
    actionLabel: "Open App Platform"
  },
  {
    title: "Configure your app spec",
    detail:
      framework === "python"
        ? "Set build command to `pip install -r requirements.txt` and run command to `gunicorn app:app` or `uvicorn main:app`."
        : "Set your build command (e.g. `npm run build`) and run command (e.g. `node server.js` or `npm start`).",
    actionUrl: "https://docs.digitalocean.com/products/app-platform/reference/app-spec/",
    actionLabel: "App spec reference"
  },
  {
    title: "Add a .do/app.yaml (optional but recommended)",
    detail: "Declare your app spec as a file for reproducible deploys and version-controlled configuration.",
    command: `mkdir -p .do && cat > .do/app.yaml << 'EOF'\nname: myapp\nregion: nyc\nservices:\n  - name: web\n    github:\n      repo: owner/repo\n      branch: main\n    run_command: npm start\nEOF`,
    actionUrl: "https://docs.digitalocean.com/products/app-platform/reference/app-spec/",
    actionLabel: "App spec docs"
  },
  {
    title: "Set environment variables",
    detail: "Add secrets in the App Platform console under Components > Environment Variables.",
    actionUrl: "https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/",
    actionLabel: "Env vars docs"
  },
  {
    title: "Deploy",
    detail: "Push to your main branch or trigger a manual deploy from the console.",
    actionUrl: "https://cloud.digitalocean.com/apps",
    actionLabel: "Open console"
  }
];

const NETLIFY_STEPS = (): PlatformStep[] => [
  {
    title: "Install the Netlify CLI",
    detail: "The Netlify CLI lets you deploy and manage sites from your terminal.",
    command: "npm install -g netlify-cli",
    actionUrl: "https://docs.netlify.com/cli/get-started/",
    actionLabel: "CLI docs"
  },
  {
    title: "Log in and link your site",
    detail: "Authenticate and link this directory to a Netlify site.",
    command: "netlify login && netlify init"
  },
  {
    title: "Configure build settings",
    detail: "Add a netlify.toml to define your build command and publish directory.",
    command: `cat > netlify.toml << 'EOF'\n[build]\n  command = "npm run build"\n  publish = ".next"\n\n[[plugins]]\n  package = "@netlify/plugin-nextjs"\nEOF`,
    actionUrl: "https://docs.netlify.com/configure-builds/file-based-configuration/",
    actionLabel: "netlify.toml docs"
  },
  {
    title: "Set environment variables",
    detail: "Add secrets in the Netlify dashboard under Site configuration > Environment variables.",
    command: "netlify env:set KEY value",
    actionUrl: "https://docs.netlify.com/environment-variables/overview/",
    actionLabel: "Env vars docs"
  },
  {
    title: "Deploy",
    detail: "Deploy a preview or push to main for a production deploy.",
    command: "netlify deploy --prod",
    actionUrl: "https://docs.netlify.com/site-deploys/overview/",
    actionLabel: "Deploy docs"
  }
];

const DOCKER_VPS_STEPS = (framework?: string): PlatformStep[] => [
  {
    title: "Provision a VPS with Docker",
    detail: "Spin up a VPS (DigitalOcean Droplet, Hetzner CX, or any Linux VM) and install Docker and Docker Compose.",
    command: "curl -fsSL https://get.docker.com | sh && sudo apt-get install -y docker-compose-plugin",
    actionUrl: "https://docs.docker.com/engine/install/",
    actionLabel: "Docker install docs"
  },
  {
    title: "Confirm or create docker-compose.yml",
    detail:
      framework === "csharp"
        ? "Add a docker-compose.yml that defines each .NET service, its Dockerfile path, and inter-service networking."
        : "Add a docker-compose.yml that defines your app service, database, and any other dependencies.",
    command:
      framework === "csharp"
        ? undefined
        : `cat > docker-compose.yml << 'EOF'\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    env_file: .env\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: secret\nEOF`,
    actionUrl: "https://docs.docker.com/compose/compose-file/",
    actionLabel: "Compose file reference"
  },
  {
    title: "Copy your env file to the server",
    detail: "Use scp or a secrets manager to push your environment variables to the VPS — never commit real secrets.",
    command: "scp .env user@your-vps:/app/.env"
  },
  {
    title: "Deploy with Docker Compose",
    detail: "SSH into your VPS, pull the latest code, and start all services.",
    command: "git pull && docker compose up -d --build"
  },
  {
    title: "Set up a reverse proxy (optional)",
    detail: "Add Nginx or Caddy in front of your containers to handle TLS and domain routing.",
    actionUrl: "https://caddyserver.com/docs/quick-starts/reverse-proxy",
    actionLabel: "Caddy reverse proxy"
  }
];

const FALLBACK_STEPS = (platform: string): PlatformStep[] => [
  {
    title: `Create a ${platform} project`,
    detail: `Set up a new project on ${platform} and connect your repository.`
  },
  {
    title: "Configure build and start commands",
    detail: "Set the commands your platform uses to build and start your application."
  },
  {
    title: "Set environment variables",
    detail: "Add any secrets and configuration variables your application needs."
  },
  {
    title: "Deploy",
    detail: "Trigger your first deploy and confirm the build passes."
  }
];

export function getPlatformSteps(platform: string, framework?: string): PlatformStep[] {
  switch (platform.toLowerCase()) {
    case "railway":
      return RAILWAY_STEPS(framework);
    case "fly.io":
    case "fly":
      return FLY_STEPS(framework);
    case "vercel":
      return VERCEL_STEPS();
    case "render":
      return RENDER_STEPS(framework);
    case "azure container apps":
    case "azure":
      return AZURE_ACA_STEPS(framework);
    case "aws app runner":
    case "aws":
      return AWS_STEPS(framework);
    case "gcp cloud run":
    case "gcp":
      return GCP_STEPS(framework);
    case "heroku":
      return HEROKU_STEPS(framework);
    case "digitalocean app platform":
    case "digitalocean":
      return DIGITALOCEAN_STEPS(framework);
    case "netlify":
      return NETLIFY_STEPS();
    case "docker + vps":
    case "docker":
      return DOCKER_VPS_STEPS(framework);
    default:
      return FALLBACK_STEPS(platform);
  }
}
