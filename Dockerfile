# ============================================================================
# Etapa 1: Build da aplicação Angular (Browser + SSR)
# ============================================================================
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ============================================================================
# Etapa 2: Runtime leve em Node 22 (SSR + /env.js dinâmico)
# ============================================================================
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist/point-da-pizza-front ./dist/point-da-pizza-front

USER node

EXPOSE 4000

CMD ["node", "dist/point-da-pizza-front/server/server.mjs"]
