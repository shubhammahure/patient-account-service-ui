# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS dev
WORKDIR /app
COPY . .
EXPOSE 4200
CMD ["npm", "run", "start:proxy"]

FROM deps AS build
ARG BUILD_CONFIGURATION=production
WORKDIR /app
COPY . .
RUN npm run build -- --configuration ${BUILD_CONFIGURATION}

FROM nginx:1.27-alpine AS runtime
RUN apk add --no-cache gettext \
  && addgroup -S appgroup \
  && adduser -S appuser -G appgroup

WORKDIR /app
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY docker-entrypoint.sh /entrypoint.sh
COPY --from=build /app/dist/patient-account-service-ui/browser /usr/share/nginx/html

RUN chmod +x /entrypoint.sh \
  && chown -R appuser:appgroup /usr/share/nginx/html /var/cache/nginx /var/run /app

USER appuser
EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]

