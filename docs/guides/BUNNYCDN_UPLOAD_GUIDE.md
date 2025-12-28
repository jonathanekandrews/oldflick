# Bunny.NET Upload Guide for Oldflick

**Last Updated**: 2025-12-27
**Status**: Ready for Production
**Trial Credits**: $50.00 remaining

---

## 📦 Your Bunny.NET Infrastructure

### Storage Zones (Images)
| Zone | Purpose | Username | Zone ID |
|------|---------|----------|---------|
| oldflick-films-images | Film posters & thumbnails | oldflick-films-images | 1315449 |
| oldflick-shows-images | TV show posters & thumbnails | oldflick-shows-images | 1315450 |

### Stream Libraries (Videos)
| Library | Purpose | Library ID | CDN |
|---------|---------|-----------|-----|
| oldflick-films | Classic film videos | 571209 | vz-c72dc0cc-607.b-cdn.net |
| oldflick-tv-shows | Classic TV show videos | 571210 | vz-d4cba3a0-7a5.b-cdn.net |

---

## 🎬 Method 1: Upload Videos to Bunny Stream

### Step 1: Install Bunny CLI (Optional but Recommended)

```bash
npm install -g bunnycdn-cli
```

### Step 2: Upload a Film

```bash
# Using Bunny CLI
bunnycdn-cli upload \
  --library-id 571209 \
  --api-key 4b3c6-49fe-9a42ab12cafe-96c8-4846 \
  /path/to/the-kid.mp4 \
  --title "The Kid" \
  --description "Charlie Chaplin's The Kid (1921)"
```

### Step 3: Get the Video URL

After upload, Bunny Stream provides a URL like:
```
https://vz-c72dc0cc-607.b-cdn.net/videos/{video-id}/the-kid.mp4
```

### Step 4: Update Database

```sql
UPDATE content
SET video_url = 'https://vz-c72dc0cc-607.b-cdn.net/videos/{video-id}/the-kid.mp4'
WHERE title = 'The Kid';
```

---

## 🖼️ Method 2: Upload Poster Images via FTP

### Step 1: Configure FTP in Your Editor/Terminal

**FTP Details:**
- **Host**: `storage.bunnycdn.com`
- **Username**: `oldflick-films-images` (for film posters)
- **Password**: `7146a4f7-25ba-4f35-a119-97fd98c-d368-4491`
- **Port**: 21
- **Connection Type**: Passive

### Step 2: Create Directory Structure

```
/oldflick-films-images/
├── the-kid.jpg
├── the-general.jpg
└── metropolis.jpg
```

### Step 3: Upload Images

Using FTP client or terminal:
```bash
ftp storage.bunnycdn.com
# Login with credentials above
# Put your-image.jpg
```

### Step 4: Get Public URL

```
https://oldflick-films-images.b-cdn.net/the-kid.jpg
```

### Step 5: Update Database

```sql
UPDATE content
SET poster_url = 'https://oldflick-films-images.b-cdn.net/the-kid.jpg'
WHERE title = 'The Kid';
```

---

## 📝 Complete Example: Add Film with Bunny URLs

```sql
INSERT INTO content (
  title,
  description,
  content_type,
  genre,
  release_year,
  rating,
  runtime_minutes,
  poster_url,
  director,
  actors,
  plot_summary,
  video_url,
  available
) VALUES (
  'The Kid',
  'A tramp cares for an abandoned boy and forms a profound bond with him.',
  'film',
  'Comedy, Drama',
  1921,
  8.3,
  68,
  'https://oldflick-films-images.b-cdn.net/the-kid.jpg',
  'Charlie Chaplin',
  'Charlie Chaplin, Jackie Coogan, Edna Purviance',
  'A destitute tramp discovers an abandoned child and decides to raise him.',
  'https://vz-c72dc0cc-607.b-cdn.net/videos/{video-id}/the-kid.mp4',
  true
);
```

---

## 🚀 API Integration (Advanced)

### Upload via Stream API

```bash
curl -X POST "https://video.bunnycdn.com/library/571209/videos" \
  -H "AccessKey: 4b3c6-49fe-9a42ab12cafe-96c8-4846" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Kid",
    "description": "Charlie Chaplin classic"
  }' \
  -F "file=@/path/to/the-kid.mp4"
```

### Get Upload Status

```bash
curl -X GET "https://video.bunnycdn.com/library/571209/videos" \
  -H "AccessKey: 4b3c6-49fe-9a42ab12cafe-96c8-4846"
```

---

## 📊 Storage & Bandwidth Info

### Current Usage
- **Films Library**: 3 videos uploaded, 14.66 MB traffic
- **TV Shows Library**: 0 videos
- **Storage Zones**: Both empty, ready for images

### Pricing (Trial: $50 free)
- **Storage**: $0.015/GB/month
- **Bandwidth**: $0.03/GB (overage)
- **No charges during trial period**

### Monitoring
Track usage in Bunny dashboard:
- https://dash.bunny.net/account

---

## ✅ Recommended Workflow

### For Each Film/Show:

1. **Prepare Files**
   ```
   /uploads/
   ├── the-kid.mp4 (video)
   └── the-kid.jpg (poster)
   ```

2. **Upload Video**
   - Use Stream API or Bunny CLI
   - Get CDN URL

3. **Upload Poster**
   - Use FTP to storage zone
   - Get CDN URL

4. **Update Database**
   ```sql
   INSERT INTO content (...)
   VALUES (..., poster_url, ..., video_url, ...);
   ```

5. **Test in Frontend**
   - Browse to http://localhost:5000
   - Verify video and poster load

---

## 🔐 Security Notes

1. **API Keys**: Keep these secure (they're in your .env or config)
2. **FTP Passwords**: Use passive mode, consider SFTP if available
3. **CDN URLs**: Public, designed to be shared
4. **Access Control**: Bunny handles geo-replication and DDoS protection

---

## 🆘 Troubleshooting

### Videos Not Playing
- Check video URL in database
- Verify CDN URL is correct
- Test URL directly in browser

### Poster Images Not Showing
- Verify FTP upload was successful
- Check URL format: `https://{zone-name}.b-cdn.net/{filename}`
- Check browser cache

### Upload Fails
- Verify credentials
- Check file size limits
- Ensure passive FTP mode

---

## 📞 Support Resources

- **Bunny Docs**: https://docs.bunny.net
- **Stream API**: https://docs.bunny.net/reference/stream-api-overview
- **Storage API**: https://docs.bunny.net/reference/storage-api
- **Dashboard**: https://dash.bunny.net

---

## Your Credentials Summary

**Films Images Zone:**
- URL: `https://oldflick-films-images.b-cdn.net/`
- FTP: `oldflick-films-images` @ `storage.bunnycdn.com`

**Shows Images Zone:**
- URL: `https://oldflick-shows-images.b-cdn.net/`
- FTP: `oldflick-shows-images` @ `storage.bunnycdn.com`

**Films Stream Library:**
- ID: `571209`
- CDN: `https://vz-c72dc0cc-607.b-cdn.net/`

**Shows Stream Library:**
- ID: `571210`
- CDN: `https://vz-d4cba3a0-7a5.b-cdn.net/`

---

**Ready to upload!** Choose your method and start adding content to Oldflick. 🚀
