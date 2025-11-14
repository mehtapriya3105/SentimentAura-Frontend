# Deployment Guide - Vercel (Frontend) + Render (Backend)

This guide explains how to deploy the Sentiment Aura frontend to Vercel with a backend hosted on Render.

## Prerequisites

- Backend deployed on Render (get your Render backend URL)
- GitHub account
- Vercel account

## Step 1: Update Backend CORS Settings

Before deploying, ensure your backend on Render allows requests from your Vercel domain.

In `backend/main.py`, update the CORS middleware:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:5173",
        "http://127.0.0.1:8080",
        "https://your-vercel-app.vercel.app",  # Add your Vercel domain
        "https://*.vercel.app",  # Allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Or for development, you can use:
```python
allow_origins=["*"]  # Allow all origins (less secure, but works for development)
```

## Step 2: Update Backend WebSocket URL

In `backend/main.py`, update the `get_deepgram_url` function to return the correct WebSocket URL:

```python
@app.post("/api/get-deepgram-url", response_model=DeepgramURLResponse)
async def get_deepgram_url():
    """
    Returns the WebSocket URL for our proxy endpoint.
    """
    # Get the current request origin or use environment variable
    import os
    backend_url = os.getenv("RENDER_EXTERNAL_URL") or "https://your-app.onrender.com"
    
    # Convert HTTP/HTTPS to WebSocket URL
    if backend_url.startswith("https://"):
        ws_url = backend_url.replace("https://", "wss://")
    else:
        ws_url = backend_url.replace("http://", "ws://")
    
    proxy_url = f"{ws_url}/ws/deepgram"
    
    return DeepgramURLResponse(url=proxy_url, token=None)
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://your-app-name.onrender.com
     ```
   - Replace `your-app-name` with your actual Render app name

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

4. **Deploy**
   ```bash
   vercel
   ```

5. **Set Environment Variable**
   ```bash
   vercel env add VITE_API_URL
   # Enter: https://your-app-name.onrender.com
   ```

6. **Redeploy with environment variable**
   ```bash
   vercel --prod
   ```

## Step 4: Verify Deployment

1. Visit your Vercel deployment URL
2. Open browser console (F12)
3. Check for any CORS or connection errors
4. Test the recording functionality

## Environment Variables

### Required in Vercel:
- `VITE_API_URL`: Your Render backend URL (e.g., `https://your-app.onrender.com`)

### Required in Render (Backend):
- `DEEPGRAM_API_KEY`: Your Deepgram API key
- `HUGGINGFACE_API_KEY`: Your Hugging Face API key

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check that your Render backend CORS settings include your Vercel domain
2. Ensure the backend is using `https://` in production
3. Check browser console for specific error messages

### WebSocket Connection Issues

If WebSocket connections fail:
1. Verify the backend WebSocket endpoint is accessible
2. Check that Render supports WebSocket connections (it does by default)
3. Ensure the WebSocket URL uses `wss://` for HTTPS backends
4. Check browser console for WebSocket errors

### Environment Variables Not Working

- Vercel requires a redeploy after adding environment variables
- Ensure variable names start with `VITE_` for Vite projects
- Check Vercel build logs to verify variables are being read

### Build Failures

- Check Node.js version (Vercel auto-detects, but you can specify in `package.json`)
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel dashboard

## Custom Domain (Optional)

1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update backend CORS to include your custom domain

## Preview Deployments

Vercel automatically creates preview deployments for each pull request. These will use the same environment variables as production unless you configure preview-specific variables.

## Monitoring

- Check Vercel Analytics for performance metrics
- Monitor Render logs for backend issues
- Use browser DevTools to debug frontend issues

## Rollback

If something goes wrong:
1. Go to Vercel Dashboard → Deployments
2. Find the previous working deployment
3. Click "..." → "Promote to Production"

