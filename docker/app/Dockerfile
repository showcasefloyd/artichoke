FROM node:22-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends php-cli php-mysql ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY package.json package-lock.json* .npmrc* ./
RUN npm install

ENV PATH="/workspace/node_modules/.bin:${PATH}"

EXPOSE 3000 8093
