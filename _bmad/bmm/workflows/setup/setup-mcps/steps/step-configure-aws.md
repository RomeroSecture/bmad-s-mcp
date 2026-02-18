# Step: Configure AWS MCP Server

## Prerequisites Check

Before starting, verify:
- User has an AWS account with appropriate permissions
- AWS CLI is installed (`aws --version` in terminal) — recommended but not required
- Docker is installed (`docker --version`) — required for local MCP server

If Docker is NOT installed:
> Para usar el AWS MCP Server local necesitas Docker.
> Descárgalo de https://www.docker.com/products/docker-desktop/
> **[HALT]** — Cannot proceed without Docker.

---

## Part A: Determine AWS Authentication Method

Ask the user:

> {user_name}, ¿cómo gestionáis los accesos a AWS en vuestra empresa?

Present options:

| Método | Descripción | Recomendado para |
|--------|-------------|------------------|
| **SSO (AWS IAM Identity Center)** | Login temporal via navegador | Empresas con SSO corporativo |
| **IAM Access Keys** | Par de claves estáticas | Cuentas personales o proyectos pequeños |
| **AWS Profiles** | Perfiles configurados en `~/.aws/credentials` | Devs con múltiples cuentas AWS |

Based on selection, guide accordingly:

---

### Option 1: SSO (Recommended for enterprise)

> Necesito estos datos de tu administrador AWS:
> 1. **SSO Start URL**: La URL de inicio de sesión SSO (ej: `https://tu-empresa.awsapps.com/start`)
> 2. **SSO Region**: La región del SSO (ej: `eu-west-1`)
> 3. **Account ID**: El ID de la cuenta AWS donde desplegaréis
> 4. **Role name**: El nombre del rol SSO que tenéis asignado

### Option 2: IAM Access Keys

> Necesito que crees un par de claves de acceso:
>
> 1. Abre **https://console.aws.amazon.com/iam/home#/security_credentials** 
> 2. En la sección **"Access keys"**, click en **"Create access key"**
> 3. Selecciona **"Command Line Interface (CLI)"**
> 4. Confirma y click en **"Create access key"**
> 5. **COPIA ambas claves** (Access Key ID y Secret Access Key) — el secret no se puede ver de nuevo
>
> Pásame ambas claves. Las usaré solo para la configuración.

⚠️ **SECURITY:** Never commit AWS credentials to git. They go ONLY in `.cursor/mcp.json` or environment variables.

### Option 3: Existing AWS Profile

> Ejecuta `aws configure list-profiles` en tu terminal y dime qué perfiles tienes.
> Usaré el perfil que elijas para la configuración del MCP.

---

## Part B: Determine AWS Services Needed

Ask the user:

> ¿Qué servicios de AWS necesitaréis para el despliegue?

Present common patterns:

| Patrón de deploy | Servicios AWS | Caso de uso |
|-----------------|---------------|-------------|
| **Contenedores (ECS)** | ECR, ECS, ALB, CloudWatch | Apps Docker con load balancer |
| **Contenedores (EKS)** | ECR, EKS, CloudWatch | Kubernetes en AWS |
| **Serverless** | Lambda, API Gateway, S3 | APIs y funciones |
| **Estático** | S3, CloudFront | SPAs, landing pages |
| **No lo sé aún** | Configuración genérica | Se puede ampliar después |

Based on the selection, determine which AWS MCP tools to enable (toolsets).

---

## Part C: Generate Configuration

Generate the MCP configuration block based on auth method:

### For IAM Access Keys:
```json
{
  "mcpServers": {
    "aws": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "AWS_ACCESS_KEY_ID",
        "-e", "AWS_SECRET_ACCESS_KEY",
        "-e", "AWS_REGION",
        "public.ecr.aws/aws-mcp/aws-mcp-server:latest"
      ],
      "env": {
        "AWS_ACCESS_KEY_ID": "<USER_KEY_HERE>",
        "AWS_SECRET_ACCESS_KEY": "<USER_SECRET_HERE>",
        "AWS_REGION": "<SELECTED_REGION>"
      }
    }
  }
}
```

### For SSO Profile:
```json
{
  "mcpServers": {
    "aws": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-v", "~/.aws:/root/.aws:ro",
        "-e", "AWS_PROFILE",
        "-e", "AWS_REGION",
        "public.ecr.aws/aws-mcp/aws-mcp-server:latest"
      ],
      "env": {
        "AWS_PROFILE": "<PROFILE_NAME>",
        "AWS_REGION": "<SELECTED_REGION>"
      }
    }
  }
}
```

Actions:
1. Merge into existing `.cursor/mcp.json` or create new
2. Verify `.gitignore` includes `.cursor/mcp.json`
3. Ask user which AWS region to use as default

Show the generated configuration and ask for confirmation before writing.

---

## Part D: Ask About Human Confirmation Preference

> {user_name}, el AWS MCP puede ejecutar acciones que crean o modifican recursos reales
> (y que cuestan dinero). ¿Cómo quieres gestionar las confirmaciones?

| Modo | Descripción |
|------|-------------|
| **Strict (recomendado)** | Confirmar CADA acción antes de ejecutar |
| **Read-only auto** | Lecturas automáticas, escrituras con confirmación |
| **Full auto** | Todo automático (NO RECOMENDADO para producción) |

Store preference for Wiggum's workflow configuration.

---

## Part E: Verify Connectivity

> Reinicia Cursor para cargar la nueva configuración.
> Cuando hayas reiniciado, dime [C] y verificaré la conexión con AWS.

After user confirms:
1. Attempt a read-only AWS operation (e.g., list S3 buckets or describe regions)
2. If successful:
   ```
   ✅ AWS MCP Server: CONNECTED
      - Authentication: Valid
      - Region: <region>
      - Identity: <arn>
      - Available services: S3, ECS, ECR, Lambda, CloudWatch, ...
      - Confirmation mode: <strict|read-only|full>
   ```
3. If failed:
   ```
   ❌ AWS MCP Server: FAILED
      - Error: <error message>
      - Possible causes:
        - Docker not running → Open Docker Desktop
        - Credentials invalid → Check keys at AWS Console
        - Region incorrect → Verify region code
        - Permissions insufficient → Check IAM policies
   ```

---

## Completion

```
AWS MCP: ✅ CONFIGURED AND VERIFIED
Region: <region>
Auth method: <SSO | IAM Keys | Profile>
Confirmation mode: <mode>
```

Present menu:
- **[C] Continue** — proceed to next MCP in setup plan
- **[S] Skip** — skip to next MCP
