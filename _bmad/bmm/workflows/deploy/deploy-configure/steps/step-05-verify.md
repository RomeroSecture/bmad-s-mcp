# Step 5: Verification & Deployment Documentation

## Generate Deployment Documentation

Compile everything into a single deployment guide:

```
📋 ACCIÓN PROPUESTA: Crear docs/project/deployment-setup.md

Contenido:
- Plataforma y entornos configurados
- Arquitectura de despliegue (diagrama de texto)
- Ficheros generados y su propósito
- Variables de entorno requeridas
- Secrets a configurar en GitHub/GitLab
- Costes estimados
- Comandos de despliegue manual (fallback)
- Troubleshooting básico
```

> ¿Procedo? **[C]** Continuar / **[S]** Saltar

**On [C]:** Write the file to `{project_knowledge}/deployment-setup.md`

This document serves two purposes:
1. Human reference for the team
2. Context for other agents (Kent, Homer) to understand the deployment setup

---

## Final Summary

```
╔══════════════════════════════════════════════════╗
║       DEPLOYMENT CONFIGURATION COMPLETE          ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Project: {project_name}                         ║
║  Platform: <platform>                            ║
║  Environments: <list>                            ║
║                                                  ║
║  FILES GENERATED                                 ║
║  ├── Dockerfile:              ✅                 ║
║  ├── .dockerignore:           ✅                 ║
║  ├── docker-compose.yml:      [✅ | N/A]         ║
║  ├── .env.example:            ✅                 ║
║  ├── CI/CD pipeline:          [✅ | ⏭]          ║
║  ├── Deploy config:           [✅ | 📋]          ║
║  └── docs/project/deployment-setup.md: ✅        ║
║                                                  ║
║  MANUAL STEPS PENDING                            ║
║  ├── Configure GitHub Secrets: <count> secrets   ║
║  ├── Create IAM roles:        <if AWS>           ║
║  └── First deploy:            "Wiggum, DD"       ║
║                                                  ║
║  ESTIMATED COST: ~$<range>/mes                   ║
║                                                  ║
╚══════════════════════════════════════════════════╝
```

## Next Steps

> **Configuración lista. Próximos pasos:**
>
> 1. Configura los secrets en GitHub (lista arriba)
> 2. Si es AWS: verifica los roles IAM con tu equipo de infra
> 3. Cuando el código esté listo para desplegar → **"Wiggum, DD"**
> 4. Para verificar el estado de deploys → **"Wiggum, DT"**
> 5. Si necesitas CI/CD automático, haz push a la rama configurada

Present menu:
- **[V] Verify** — review all generated files for consistency
- **[X] Exit** — configuration complete
