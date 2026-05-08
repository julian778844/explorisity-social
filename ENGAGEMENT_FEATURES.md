
# Engagement Features Added

## Added Concepts
- Likes
- Comments
- Shares/Reposts
- Bookmarks/Saves
- User activity menu
- Saved posts page
- Liked posts page
- Notifications scaffold

## Suggested Database Tables
- post_likes
- post_comments
- post_bookmarks
- reposts
- notifications

## Suggested Routes
GET /api/me/likes
GET /api/me/bookmarks
POST /api/posts/:id/like
POST /api/posts/:id/bookmark
POST /api/posts/:id/comment
POST /api/posts/:id/repost
