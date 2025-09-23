#!/usr/bin/env sh
set -eu

# Default upstream if not provided
: "${WEAVIATE_UPSTREAM:=https://weaviate.cmsinfosec.com}"

# Render nginx.conf from template
if [ -f /etc/nginx/templates/nginx.conf.template ]; then
  envsubst '${WEAVIATE_UPSTREAM}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf
elif [ -f /nginx.conf.template ]; then
  envsubst '${WEAVIATE_UPSTREAM}' < /nginx.conf.template > /etc/nginx/nginx.conf
fi

# Show effective config line for debugging
echo "Using WEAVIATE_UPSTREAM=${WEAVIATE_UPSTREAM}"

exec nginx -g 'daemon off;'
