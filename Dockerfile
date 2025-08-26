FROM node:latest

# ENV PORT=8000
# ENV JWT_SECRET=secret
# ENV MONGO_URI=mongodb://localhost
# ENV PASSWORD_SALT=5

COPY package.json /app/
COPY src /app/
COPY tsconfig.json /app/
COPY emoji.json /app/

WORKDIR /app

RUN npm i
RUN npx tsc

CMD [ "node", "dist/server.js" ]