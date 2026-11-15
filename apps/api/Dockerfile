FROM node:20-alpine
WORKDIR /app
COPY apps/api/package.json ./package.json
RUN npm install
COPY apps/api/tsconfig.json ./tsconfig.json
COPY apps/api/src ./src
RUN npm run build
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/server.js"]
