# API Endpoints List

## Authentication

- `POST /api/auth/register`: Register a new user or minister with role-specific fields.
- `POST /api/auth/login`: Login for both users and ministers, returning role-specific JWT.
- `POST /api/auth/logout`: Logout and clear session/cookies.
- `GET /api/auth/me`: Get current authenticated user/minister profile.

## Ministers

- `GET /api/ministers`: Search and filter ministers by name, role, or location.
- `GET /api/ministers/:id`: Get detailed profile of a specific minister.
- `PUT /api/ministers/profile`: Update minister profile details.
- `GET /api/ministers/recommended`: Get list of recommended ministers/churches.

## Posts (Minister Exclusive Creation)

- `POST /api/posts`: Create a new post (Ministers only).
- `GET /api/posts`: Get global feed of posts with pagination.
- `GET /api/posts/:id`: Get single post details.
- `PUT /api/posts/:id`: Update a post.
- `DELETE /api/posts/:id`: Delete a post.
- `POST /api/posts/:id/like`: Like/Unlike a post.

## Forum (Tweets)

- `POST /api/tweets`: Create a new tweet in the forum (Users and Ministers).
- `GET /api/tweets`: Get all tweets for the forum feed.
- `GET /api/tweets/:id`: Get single tweet details.
- `PUT /api/tweets/:id`: Update a tweet.
- `DELETE /api/tweets/:id`: Delete a tweet.

## Profile & Stats

- `GET /api/users/:id/profile`: Get a user's profile including stats.
- `POST /api/users/amen`: Increment prayer streak and log an "Amen" interaction.
- `GET /api/users/streak`: Get current user's prayer streak data.

## Search

- `GET /api/search`: Global search across users and ministers based on query string.

## Devotionals

- `GET /api/devotionals/random`: Get a random daily devotional for the sidebar.

## Stories (Minister Only)

- `GET /api/stories`: Get active stories feed.
- `POST /api/stories`: Create a new story.
- `POST /api/stories/:id/view`: Mark a story as viewed.
- `POST /api/stories/:id/react`: React to a story.

## Post Actions

- `POST /api/posts/:id/save`: Save a post to user's collection.
- `DELETE /api/posts/:id/save`: Remove a post from saved collection.
- `POST /api/posts/:id/report`: Report a post for violation.

## Trending & Forum

- `GET /api/hashtags/trending`: Get list of trending hashtags.

## Social Graph (Follow System)

- `POST /api/users/:id/follow`: Follow a user or minister.
- `DELETE /api/users/:id/follow`: Unfollow a user or minister.
- `GET /api/users/:id/followers`: Get list of followers.
- `GET /api/users/:id/following`: Get list of following.

## Explore

- `GET /api/explore`: Get explore feed content (posts, tweets, ministers).
