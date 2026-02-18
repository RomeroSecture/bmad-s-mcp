# Step 3: CI/CD Pipeline

If user selected "Ninguno por ahora" in discovery → skip this step entirely.

---

## GitHub Actions Pipeline

Generate pipeline based on the deployment plan.

### Pipeline Structure

For **standard** (staging + production) or **complete** (dev + staging + prod) environments:

```
📋 ACCIÓN PROPUESTA: Crear .github/workflows/deploy.yml

Triggers:
- Push to 'develop' → Deploy to development (if complete config)
- Push to 'staging' or PR merge to 'main' → Deploy to staging
- Manual trigger (workflow_dispatch) → Deploy to production

Jobs:
1. test    — Run test suite
2. build   — Build Docker image and push to registry
3. deploy  — Deploy to target environment
```

For **minimal** (production only):

```
Triggers:
- Push to 'main' → Deploy to production
- (Optional) Pull request → Run tests only

Jobs:
1. test    — Run test suite
2. build   — Build and push Docker image
3. deploy  — Deploy to production
```

Show the complete workflow file:

```
📋 ACCIÓN PROPUESTA: Crear .github/workflows/deploy.yml

<Show complete YAML content>
```

The pipeline MUST include:
- Checkout step
- Setup runtime (Node, Python, etc.) with exact version
- Install dependencies
- Run tests (fail pipeline if tests fail)
- Build Docker image with commit SHA tag
- Push to container registry (ECR for AWS, Docker Hub for others)
- Deploy step specific to platform
- Notification step (optional — comment on PR or Slack)

### Secrets Required

After showing the pipeline, list the secrets that need to be configured in GitHub:

```
⚠️ SECRETS REQUERIDOS EN GITHUB:

Ve a: https://github.com/<org>/<repo>/settings/secrets/actions

| Secret | Descripción | Dónde obtenerlo |
|--------|-------------|-----------------|
| AWS_ACCESS_KEY_ID | Clave de acceso AWS | AWS Console > IAM |
| AWS_SECRET_ACCESS_KEY | Secret de AWS | AWS Console > IAM |
| AWS_REGION | Región (ej: eu-west-1) | Tu config de AWS |
| ECR_REPOSITORY | URL del registry | AWS Console > ECR |

(La lista varía según plataforma)
```

> ¿Procedo a crear el pipeline? **[C]** Continuar / **[E]** Editar / **[S]** Saltar

**On [C]:** Create the directory `.github/workflows/` and write the file.

---

## GitLab CI Pipeline

If user selected GitLab CI, generate equivalent `.gitlab-ci.yml`.

Same structure: test → build → deploy, with stages and environment-specific rules.

---

## Step Summary

```
CI/CD PIPELINE:
├── Pipeline file:      [✅ | ❌ | ⏭ SKIPPED]
│   Type: <GitHub Actions | GitLab CI>
│   Location: <path>
├── Environments:
│   ├── development:    [CONFIGURED | N/A]
│   ├── staging:        [CONFIGURED | N/A]
│   └── production:     [CONFIGURED]
└── Secrets to configure: <count> (manual step required)
```

Present menu:
- **[C] Continue** — proceed to platform-specific configuration
- **[R] Retry** — retry any failed action
