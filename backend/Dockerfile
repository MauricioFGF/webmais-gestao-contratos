# Build: instala tudo, gera o Prisma Client e compila TS -> dist
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma.config.ts tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate && npm run build

# Runtime: reaproveita node_modules do build (inclui o CLI do Prisma,
# necessário para `migrate deploy` no boot)
FROM node:22-alpine
# O npm embutido na imagem base carrega CVEs conhecidas (sigstore/picomatch);
# atualizá-lo traz as versões corrigidas até a imagem oficial ser re-publicada
RUN npm install -g npm@latest
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
# src é necessário para rodar o seed (npx prisma db seed) dentro do container
COPY --from=build --chown=node:node /app/src ./src
COPY --chown=node:node package.json prisma.config.ts ./
COPY --chown=node:node prisma ./prisma
USER node
EXPOSE 3333
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
