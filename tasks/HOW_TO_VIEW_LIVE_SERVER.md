# How to View Oldflick on Live Server

## Quick Start

### Option 1: View in Browser (Easiest)

1. **Open your web browser** (Chrome, Firefox, Safari, Edge, etc.)

2. **Navigate to one of these URLs:**
   - **Frontend**: `http://localhost:5000`
   - **Backend API**: `http://localhost:3001/api/content`
   - **Health Check**: `http://localhost:3001/api/health`

3. **You should see:**
   - Frontend: The Oldflick classic films & TV platform with UI
   - API: JSON data with all 28 films and TV shows

---

## Detailed Instructions by Browser

### Chrome / Firefox / Edge / Safari

1. Click on the address bar at the top
2. Type: `http://localhost:5000`
3. Press **Enter**
4. Wait 2-3 seconds for the page to load
5. You should see the Oldflick homepage with:
   - Navigation menu (Classic Films, Classic TV, My List, Genre)
   - Search functionality
   - Sign In / Sign Up buttons
   - Content catalog

---

## Testing Different Parts

### View the Frontend (User Interface)
```
http://localhost:5000
```
This shows the complete web application with all UI elements.

### View All Content (API Data)
```
http://localhost:3001/api/content
```
This returns JSON data of all 28 items (17 films + 11 TV shows).

### Check Backend Health
```
http://localhost:3001/api/health
```
This confirms the backend is running: `{"status":"ok"}`

---

## Common URLs to Explore

| URL | Purpose | What You'll See |
|-----|---------|-----------------|
| `http://localhost:5000` | Main frontend | Full Oldflick website |
| `http://localhost:3001/api/health` | Backend status | JSON status response |
| `http://localhost:3001/api/content` | All content | JSON array of 28 items |
| `http://localhost:3001/api/content/1` | Single item | JSON for first film |
| `http://localhost:3001/api/content/18` | Single item | JSON for first TV show |

---

## Troubleshooting

### If the page doesn't load:

1. **Check if server is running:**
   - Look at your terminal where you ran `npm run dev`
   - You should see:
     ```
     Server running on port 3001
     [Vite] ready in XXX ms
     Local: http://localhost:5000
     ```

2. **If not running, start it:**
   ```bash
   cd c:\Users\j_and\.vscode\oldflick
   npm run dev
   ```

3. **Wait for startup:**
   - Backend takes ~1 second
   - Frontend (Vite) takes ~500ms
   - Total: 2-3 seconds

4. **Try a different port if 5000 is taken:**
   - Vite will automatically use 5001, 5002, etc. if 5000 is busy
   - Check the terminal output for the actual port
   - Example: `Local: http://localhost:5001`

### If you get a connection error:

- Make sure the server hasn't crashed
- Check terminal for error messages
- Restart with: `npm run dev`
- Wait for "Server running on port 3001" message

---

## What You Should See

### Frontend (http://localhost:5000)
```
┌─────────────────────────────────────────┐
│          OLDFLICK PLATFORM              │
├─────────────────────────────────────────┤
│ Classic Films  Classic TV  My List      │
├─────────────────────────────────────────┤
│ [Search Box]                            │
│                                         │
│ Featured Content:                       │
│ • Metropolis (1927) - 8.3★              │
│ • Dracula (1931) - 7.4★                 │
│ • Frankenstein (1931) - 7.8★            │
│                                         │
│ [Sign In]  [Sign Up Free]              │
│                                         │
│ Catalog: 28 Classic Films & TV Shows   │
└─────────────────────────────────────────┘
```

### Backend API (http://localhost:3001/api/content)
```json
[
  {
    "id": 1,
    "title": "The Gumby Show (Re-run)",
    "description": "Gumby returns with classic episodes.",
    "content_type": "tv",
    "genre": "Animation",
    "rating": 7.8,
    "director": "Art Clokey",
    "actors": "Art Clokey",
    "runtime_minutes": 30,
    "release_year": 1966,
    "available": true
  },
  ... (27 more items)
]
```

---

## Development Features

### Hot Module Reloading (HMR)
If you edit the frontend code, the page automatically refreshes:
- Edit a React component
- Save the file
- Page updates without full refresh

### API Testing
You can test individual items:
- `http://localhost:3001/api/content/1` - First item
- `http://localhost:3001/api/content/15` - Metropolis film
- `http://localhost:3001/api/content/18` - The Lone Ranger TV show

---

## Mobile/Network Access

### Access from Another Computer on Your Network

Replace `localhost` with your computer's IP address:

1. **Find your IP address:**
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. **Share this link with others:**
   ```
   http://192.168.1.100:5000
   ```

3. **They can access your live server** from any device on your network

---

## Keyboard Shortcuts (in browser DevTools)

Press **F12** to open Developer Tools and:
- View console for JavaScript errors
- Check Network tab to see API calls
- Inspect HTML elements
- Debug frontend code

---

## Summary

**To view your live Oldflick platform:**

1. Open browser
2. Go to `http://localhost:5000`
3. Explore the platform!

**That's it!** The backend is serving at port 3001, and the frontend is at port 5000.

---

**Status**: ✅ Live Server Running
**Frontend**: http://localhost:5000
**Backend**: http://localhost:3001
**Content Items**: 28 (17 films + 11 TV shows)
**Database**: Supabase (connected via IPv4)
