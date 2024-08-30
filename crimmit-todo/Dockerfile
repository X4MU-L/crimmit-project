
FROM node:18
# Set the working directory
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5010
CMD ["npm", "run", "dev"]