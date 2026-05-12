# Bulk Import Examples

## Text Post Examples

### Simple text post (publish now)
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"Hello everyone! Check out my latest thoughts on LinkedIn automation 🚀",text,,,true,,
```

### Scheduled text post
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"Join me for a live Q&A session tomorrow!",text,,2025-05-15T10:00:00,false,,
```

---

## Image Post Examples

### Image with schedule
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"Beautiful morning view from the office",image,,2025-05-15T08:30:00,false,https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600,
```

### Image publish now
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"Team building event was amazing! 🎉",image,,,true,https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600,
```

---

## Video Post Examples

### Scheduled video
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"New product walkthrough - watch the full demo",video,,2025-05-16T14:00:00,false,,https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4
```

### Live now video
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"5 productivity tips for remote workers",video,,,true,,https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4
```

---

## Link Post Examples

### Article link with schedule
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"Check out this comprehensive guide on career development",link,https://example.com/career-guide-2025,2025-05-17T09:00:00,false,,
```

### Blog post publish now
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"My thoughts on the future of AI in the workplace",link,https://myblog.com/ai-workplace-future,,,true,,
```

---

## Mixed Bulk Example (5 posts)

```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"Starting the week right! Looking forward to great conversations.",text,,,true,,
"Check out this beautiful workspace setup",image,,2025-05-15T10:00:00,false,https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600,
"Watch my latest tutorial on content strategy",video,,2025-05-15T14:30:00,false,,https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4
"Read the full article on LinkedIn strategies",link,https://example.com/linkedin-strategies,2025-05-16T09:00:00,false,,
"Thank you all for the amazing engagement this week!",text,,,true,,
```

---

## Format Variations (All Valid)

### Date Format Variations
```csv
scheduled_at examples (all formats work):
2025-05-15T10:00:00          ← ISO format (recommended)
2025-05-15 10:00:00          ← Space instead of T
15/05/2025 10:00             ← DD/MM/YYYY format
05/15/2025 10:00             ← MM/DD/YYYY format  
15/05/2025                   ← Date only (midnight)
2025-05-15                   ← ISO date only
```

### Boolean Format Variations
```csv
publish_now examples (all valid):
true                         ← Preferred
1                            ← Numeric
yes                          ← Text
y                            ← Short text
TRUE / True / TrUe           ← Case insensitive
```

### Column Name Variations
All these are equivalent:

**Content:** `content` OR `post_content` OR `text`
**Type:** `post_type` OR `type`
**Link:** `link_url` OR `url` OR `link`
**Schedule:** `scheduled_at` OR `schedule_at` OR `publish_at` OR `publish_date`
**Image:** `image_url` OR `image`
**Video:** `video_url` OR `video`
**Publish:** `publish_now` (no variations)

Example with alternate names:
```csv
text,type,url,schedule,yes,image,video
"My post",text,https://example.com,2025-05-15T10:00:00,true,,
```

---

## Minimal Examples

### Absolute Minimum (text only)
```csv
content
"Hello world!"
```

### Minimal with scheduling
```csv
content,scheduled_at
"Hello world!",2025-05-15T10:00:00
```

### Minimal with image
```csv
content,post_type,image_url
"Beautiful photo",image,https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800
```

---

## Common Errors & Fixes

### ❌ Missing Content
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
,text,,,true,,
```
**Error:** Missing required "content"  
**Fix:** Add content text

### ✅ Fixed
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"Post text here",text,,,true,,
```

---

### ❌ Invalid URL
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"Post with image",image,,2025-05-15T10:00:00,false,not-a-real-url,
```
**Error:** Invalid image_url format  
**Fix:** Use valid URL starting with http:// or https://

### ✅ Fixed
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"Post with image",image,,2025-05-15T10:00:00,false,https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800,
```

---

### ❌ Invalid Date
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"Future post",text,,not-a-date,false,,
```
**Error:** Invalid scheduled_at format  
**Fix:** Use ISO format: 2025-05-15T10:00:00

### ✅ Fixed
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"Future post",text,,2025-05-15T10:00:00,false,,
```

---

## Real-World Scenarios

### Weekly Content Calendar (5 posts)
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"Monday Motivation: You've got this! 💪",text,,2025-05-19T07:00:00,false,,
"Wednesday Webinar Recap",video,,2025-05-21T14:00:00,false,,https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4
"New blog post on industry trends",link,https://myblog.com/industry-trends,2025-05-22T10:00:00,false,,
"Team photo from conference",image,,2025-05-23T12:00:00,false,https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600,
"Friday Thoughts: Week well spent! 🎉",text,,2025-05-23T17:00:00,false,,
```

### Marketing Campaign (Images + Links)
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"Introducing our new product line",image,,2025-05-25T09:00:00,false,https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600,
"Product features overview",link,https://example.com/product-features,2025-05-25T10:00:00,false,,
"Customer testimonial video",video,,2025-05-25T11:00:00,false,,https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4
"Special launch offer - Limited time",text,,2025-05-25T12:00:00,false,,
"Thank you for supporting us!",text,,,true,,
```

---

## URL Sources

### Free Stock Photos
- Unsplash: `https://images.unsplash.com/photo-[ID]?w=800&h=600`
- Pexels: `https://images.pexels.com/photos/[ID]/pexels-photo-[ID].jpeg`

### Free Stock Videos
- Test video: `https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4`
- Other options: `ElephantsDream.mp4`, `ForBiggerBlazes.mp4`

### Your Own URLs
Replace with your hosting URLs (must be publicly accessible)

---

## Tips

1. **Start simple:** Test with text posts first
2. **Add images:** Then add image posts
3. **Add videos:** Then add video posts
4. **Add scheduling:** Use different dates for each post
5. **Bulk test:** Mix everything together in one file

---

## Quick Copy-Paste Templates

### Template 1: Single Text Post
```csv
content
"Your post text here"
```

### Template 2: Text + Image
```csv
content,post_type,image_url
"Your text here",image,https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800
```

### Template 3: With Schedule
```csv
content,post_type,scheduled_at
"Your text here",text,2025-05-15T10:00:00
```

### Template 4: Full Features
```csv
content,post_type,link_url,scheduled_at,publish_now,image_url,video_url
"Your text",text,,2025-05-15T10:00:00,false,,
```

---

Ready to test? Pick a template, fill in your content, and upload!
