# Use official Node.JS image
FROM node:18 as builder
WORKDIR /app
COPY package.json ./
RUN yarn install
COPY . .
RUN yarn build

# Use official Nginx image for serving static files
FROM nginx:alpine as runner
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]