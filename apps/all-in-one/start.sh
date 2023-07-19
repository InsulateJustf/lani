#!/bin/bash

set -e

if [ ! -e /config/config.yaml ] ; then
    echo "/config/config.yaml required"
    exit 255
fi

yq '. *= load("/config/config.yaml")' /deploy/apps/all-in-one/defaults.yaml > merged.yaml

echo "Copying config files..."

cp -v -f merged.yaml /deploy/apps/api-server/config.yaml
cp -v -f merged.yaml /deploy/apps/data-server/config.yaml
cp -v -f merged.yaml /deploy/apps/gateway/config.yaml

# Run database migration
DATABASE_URL=`yq '.postgresUrl' merged.yaml`
(cd /deploy/libs/db; DATABASE_URL=$DATABASE_URL npm run migrate:deploy)

# Create bucket
mkdir -p /storage/images

# Replace bash process
export HOME="/deploy"
exec pm2-runtime /deploy/apps/all-in-one/ecosystem.config.js
