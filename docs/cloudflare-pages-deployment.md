# Cloudflare Pages Deployment Guide

## Prerequisites

1. A Cloudflare account
2. A domain name (optional, but recommended)
3. Git repository access

## Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

## Step 2: Login to Cloudflare

```bash
wrangler login
```

## Step 3: Configure Your Project

1. Make sure your `wrangler.toml` file is properly configured
2. Update the `zone_name` in `wrangler.toml` with your domain
3. Set up your environment variables in the Cloudflare dashboard

## Step 4: Deploy to Cloudflare Pages

### Option 1: Using Wrangler CLI

```bash
wrangler pages deploy .next
```

### Option 2: Using Git Integration

1. Go to the Cloudflare dashboard
2. Navigate to Pages
3. Click "Create a project"
4. Connect your Git repository
5. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Node.js version: 18 (or higher)

## Step 5: Configure Environment Variables

1. In the Cloudflare dashboard, go to your Pages project
2. Navigate to Settings > Environment variables
3. Add the following variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - Any other environment variables from your `.env` file

## Step 6: Set Up Custom Domain (Optional)

1. In the Cloudflare dashboard, go to your Pages project
2. Navigate to Settings > Custom domains
3. Click "Set up a custom domain"
4. Follow the instructions to configure DNS

## Step 7: Configure Build Settings

1. In the Cloudflare dashboard, go to your Pages project
2. Navigate to Settings > Build & deployments
3. Configure:
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Node.js version: 18 (or higher)
   - Environment variables (as needed)

## Step 8: Enable Preview Deployments

1. In the Cloudflare dashboard, go to your Pages project
2. Navigate to Settings > Build & deployments
3. Enable "Preview deployments" for pull requests

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check the build logs in the Cloudflare dashboard
   - Ensure all dependencies are properly installed
   - Verify environment variables are correctly set

2. **Environment Variables**
   - Make sure all required variables are set in the Cloudflare dashboard
   - Check for typos in variable names
   - Verify variable values are correct

3. **Custom Domain Issues**
   - Check DNS configuration
   - Verify SSL certificate status
   - Ensure domain is properly proxied through Cloudflare

### Useful Commands

```bash
# Check build locally
npm run build

# Preview deployment locally
wrangler pages dev .next

# View deployment logs
wrangler pages deployment list
```

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/) 