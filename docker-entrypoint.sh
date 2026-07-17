#!/bin/sh
set -eu

: "${API_UPSTREAM:=http://patient-account-service:8080}"
: "${API_BASE_URL:=}"

# Generate NGINX runtime config from template
envsubst '${API_UPSTREAM}' < /etc/nginx/templates/nginx.conf.template > /tmp/nginx.conf

# Expose runtime environment to Angular app
cat > /usr/share/nginx/html/env-config.js <<EOF
window.__env = {
  API_BASE_URL: "${API_BASE_URL}",
  API_UPSTREAM: "${API_UPSTREAM}"
};
EOF

exec nginx -c /tmp/nginx.conf -g 'daemon off;'

