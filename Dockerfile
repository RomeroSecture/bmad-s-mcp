FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
COPY _bmad/ ./_bmad/
COPY _docs/ ./_docs/
COPY scripts/ ./scripts/
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN addgroup -S bmad && adduser -S bmad -G bmad
COPY --from=builder --chown=bmad:bmad /app/dist ./dist
COPY --from=builder --chown=bmad:bmad /app/content ./content
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
ENV BMAD_TRANSPORT=http
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
USER bmad
CMD ["node", "dist/index.js"]
