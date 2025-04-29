# Cloudflare Services Integration Guide

## Core Services

### 1. Cloudflare Pages
- **Purpose**: Application hosting and deployment
- **Features**:
  - Automatic deployments from Git
  - Preview deployments for PRs
  - Global CDN
  - Serverless functions
  - Environment variables management
- **Free Tier**:
  - Unlimited bandwidth
  - 500 builds/month
  - Unlimited sites

### 2. Cloudflare Images
- **Purpose**: Image storage and optimization
- **Features**:
  - Image storage and delivery
  - Automatic image optimization
  - Variant generation
  - Custom delivery URLs
  - Image analytics
- **Free Tier**:
  - 100,000 images
  - 100,000 transformations/month

### 3. Cloudflare Workers
- **Purpose**: Serverless functions and background tasks
- **Features**:
  - Edge computing
  - Cron jobs
  - API endpoints
  - Background processing
  - Durable Objects
- **Free Tier**:
  - 100,000 requests/day
  - 10ms CPU time per request

### 4. Cloudflare Queues
- **Purpose**: Message queuing and processing
- **Features**:
  - Reliable message delivery
  - At-least-once delivery
  - Automatic retries
  - Dead letter queues
- **Free Tier**:
  - 100,000 messages/month
  - 1,000 messages/second