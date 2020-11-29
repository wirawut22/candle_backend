# create a file named Dockerfile
FROM alpine:3.11
RUN mkdir /candle-backend
WORKDIR /candle-backend
COPY package.json /candle-backend
RUN npm install
COPY . /candle-backend
EXPOSE 5000
CMD ["npm", "start"]