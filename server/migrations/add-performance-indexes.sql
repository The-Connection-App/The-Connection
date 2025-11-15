-- Migration: Add performance indexes for frequently queried tables
-- This addresses N+1 query problems and improves query performance

-- Index for user_blocks (blocker lookups - used on every feed/community/events request)
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_id ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_id ON user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_blocked ON user_blocks(blocker_id, blocked_id);

-- Index for microblog_likes (user interaction lookups)
CREATE INDEX IF NOT EXISTS idx_microblog_likes_user_id ON microblog_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_microblog_likes_microblog_id ON microblog_likes(microblog_id);
CREATE INDEX IF NOT EXISTS idx_microblog_likes_user_microblog ON microblog_likes(user_id, microblog_id);

-- Index for user_interactions (recommendation system)
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_content_type ON user_interactions(content_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_content ON user_interactions(user_id, content_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at DESC);

-- Index for community_members (frequent community lookups)
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_community ON community_members(user_id, community_id);

-- Index for posts (feed queries with ordering)
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_id_desc ON posts(id DESC);

-- Index for events (location and creator queries)
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_is_public ON events(is_public);

-- Index for chat_messages (room message queries)
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Index for user_follows (recommendation and follower queries)
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);

-- Index for communities (location-based queries)
CREATE INDEX IF NOT EXISTS idx_communities_city_state ON communities(city, state) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_communities_is_private ON communities(is_private);
CREATE INDEX IF NOT EXISTS idx_communities_created_by ON communities(created_by);
