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
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/content ./content
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
ENV BMAD_TRANSPORT=http
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
