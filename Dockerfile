# Medad Style Lab: static site served by nginx.
# CranL sets $PORT; nginx's template step substitutes it at startup.
FROM nginx:1.27-alpine
ENV PORT=8080
COPY deploy/default.conf.template /etc/nginx/templates/default.conf.template
COPY index.html favicon.ico /usr/share/nginx/html/
COPY shared /usr/share/nginx/html/shared
COPY styles /usr/share/nginx/html/styles
EXPOSE 8080
