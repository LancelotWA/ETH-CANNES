FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY tsconfig.base.json ./
COPY apps/backend ./apps/backend
COPY packages ./packages
RUN npm install
EXPOSE 4000
CMD ["npm", "run", "start:dev", "--workspace", "@ethcannes/backend"]
