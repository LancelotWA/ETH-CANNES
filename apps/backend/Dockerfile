FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* tsconfig.base.json ./
COPY apps/backend ./apps/backend
COPY packages ./packages
RUN npm install
RUN npm run build --workspace @ethcannes/backend
EXPOSE 4000
CMD ["node", "apps/backend/dist/apps/backend/src/main.js"]
