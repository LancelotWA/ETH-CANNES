FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY tsconfig.base.json ./
COPY apps/frontend ./apps/frontend
COPY packages ./packages
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev", "--workspace", "@ethcannes/frontend"]
