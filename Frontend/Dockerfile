# Production Nginx image serving pre-compiled Angular SPA
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy pre-compiled Angular bundle
COPY dist/Frontend/browser /usr/share/nginx/html

# Copy custom reverse proxy & SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
