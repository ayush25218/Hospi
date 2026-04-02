# Stage 1: Dependency Installation
FROM node:20-alpine AS deps

ARG NEXT_PUBLIC_CLIENT_KEY
ENV NEXT_PUBLIC_CLIENT_KEY=${NEXT_PUBLIC_CLIENT_KEY}

WORKDIR /app

# Frontend dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Backend dependencies
COPY backend/package.json backend/package-lock.json* ./backend/
RUN npm install --prefix backend

# ------------------------------------------------

# Stage 2: Code Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Copy source
COPY . .

# Build both
RUN npm run build
RUN npm run backend:build

# ------------------------------------------------

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build from Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy backend build and necessary runtime node_modules
COPY --from=builder --chown=nextjs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nextjs:nodejs /app/backend/package.json ./backend/package.json
COPY --from=builder --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules

# Create uploads directory and set permissions for both frontend and backend
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

# Copy the start script
COPY --chown=nextjs:nodejs start.sh ./

# Set ownership of all files to the non-root user
RUN chown -R nextjs:nodejs /app

# Finalize script permissions
RUN chmod +x ./start.sh

USER nextjs

EXPOSE 3000
EXPOSE 5000

CMD ["./start.sh"]