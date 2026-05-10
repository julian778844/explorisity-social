# Profile, Posts, Followers, Images, Likes, Comments, and Head-to-Head Fix

## Added and fixed

### Profile
- Profile page now shows:
  - profile picture
  - username
  - bio
  - follower count
  - following count
  - post count
  - user's real posts from database
- Empty state: "You have not posted anything yet."

### Posts
- Users can create posts with:
  - title
  - text/body
  - category
  - optional link
  - optional image
- Posts are connected to the logged-in user.
- Post images appear on:
  - Explore feed
  - homepage activity/opportunities
  - profile page
  - public profile page

### Editing
- Users can edit only their own posts.
- Backend checks author ownership before allowing edits.
- Users cannot edit another user's posts.

### Followers
- Public profiles show followers and following.
- Follow/unfollow buttons show when viewing someone else.
- Counts update after follow/unfollow.

### Likes and comments
- Every post now has visible Like and Comment buttons.
- Like count appears on posts.
- Comment count appears on posts.
- Comments show usernames and profile links.
- Users must be signed in to like/comment.

### Easy posting widget
- Added a clean posting widget:
  - title
  - text
  - category
  - link
  - image upload preview
- Added to profile, homepage, and explore.

### Head-to-head
- Homepage now makes school head-to-head comparison the main feature again.
- Social posting/networking stays integrated around it.

## Required Neon SQL

Run:

lib/db/migrations/10001_profile_posts_follow_images_likes_comments.sql

## Deploy

1. Copy files into GitHub Desktop repo.
2. Commit.
3. Push origin.
4. Run the SQL migration in Neon.
5. Render: Clear build cache & deploy.
6. Vercel: Redeploy without cache.
