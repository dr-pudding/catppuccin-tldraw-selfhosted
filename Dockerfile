FROM node:22-alpine as base
RUN apk add --no-cache dumb-init
RUN corepack enable && corepack prepare pnpm@10.7.0 --activate
WORKDIR /usr/src/app

FROM base as deps
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml /usr/src/app/
COPY --chown=node:node patches /usr/src/app/patches
RUN pnpm install --frozen-lockfile

FROM deps as builder
COPY --chown=node:node . /usr/src/app
ARG VITE_TLDRAW_LICENSE_KEY
ENV VITE_TLDRAW_LICENSE_KEY=${VITE_TLDRAW_LICENSE_KEY}
RUN pnpm build

FROM base as prod-deps
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml /usr/src/app/
COPY --chown=node:node patches /usr/src/app/patches
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile

FROM base as app
COPY --chown=node:node --from=builder /usr/src/app/dist /usr/src/app/dist
COPY --chown=node:node --from=prod-deps /usr/src/app/node_modules /usr/src/app/node_modules
ENV NODE_ENV=production \
    CONFIG_DIR=/config
WORKDIR /usr/src/app
CMD ["dumb-init", "node", "dist/src/server/server.node.js"]
