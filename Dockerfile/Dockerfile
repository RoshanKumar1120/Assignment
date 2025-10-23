# ---- Step 1: Build Stage ----
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# ---- Step 2: Runtime Stage ----
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app ./

EXPOSE 5000
CMD ["npm", "start"]
