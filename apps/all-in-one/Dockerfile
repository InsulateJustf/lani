FROM node:14-slim

# Install nginx
RUN apt-get update && apt-get install -y \
    nginx \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install minio
RUN wget https://dl.min.io/server/minio/release/linux-amd64/minio -O /usr/bin/minio
RUN chmod +x /usr/bin/minio

# Install yq
RUN wget https://github.com/mikefarah/yq/releases/download/v4.28.1/yq_linux_amd64 -O /usr/bin/yq
RUN chmod +x /usr/bin/yq

# Install pm2
RUN npm install pm2 -g

WORKDIR /deploy/apps/all-in-one
COPY ./common/deploy/apps/all-in-one/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./common/deploy /deploy
RUN chmod -R 777 /deploy

EXPOSE 8080

CMD ["/deploy/apps/all-in-one/start.sh"]
