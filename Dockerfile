FROM cypress/base:18.12.1

RUN mkdir /app
WORKDIR /app

COPY . /app

RUN npm install

RUN $(npm bin)/cypress verify

RUN ["npx", "cypress", "verify"]
RUN ["npm", "run", "cypress:e2e"]
#RUN ["npx", "cypress", "verify"]
