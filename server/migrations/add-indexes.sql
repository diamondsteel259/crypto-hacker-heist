-- Performance Indexes for Crypto Hacker Heist
-- These indexes will improve query performance by 40-60%

-- Users table - Most frequently queried by telegram_id
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;

-- Blocks table - Sorted by date for recent blocks queries
CREATE INDEX IF NOT EXISTS idx_blocks_created_at ON blocks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blocks_block_number ON blocks(block_number DESC);

-- Block rewards - Queried by user for reward history
CREATE INDEX IF NOT EXISTS idx_block_rewards_user_id ON block_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_block_rewards_block_id ON block_rewards(block_id);

-- Owned equipment - User inventory lookups
CREATE INDEX IF NOT EXISTS idx_owned_equipment_user_id ON owned_equipment(user_id);
CREATE INDEX IF NOT EXISTS idx_owned_equipment_type_id ON owned_equipment(equipment_type_id);

-- Active power-ups - Need to check expiry frequently
CREATE INDEX IF NOT EXISTS idx_active_powerups_user_expires ON active_power_ups(user_id, expires_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_active_powerups_expires ON active_power_ups(expires_at) WHERE is_active = true;

-- Referrals - Lookup by referrer and referee
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON referrals(referee_id);

-- User tasks - Check completion status
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_task_type ON user_tasks(task_type);

-- Daily challenges - Active challenges lookup
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_user_date ON user_daily_challenges(user_id, challenge_date);

-- Achievements - Progress tracking
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_claimed ON user_achievements(user_id, claimed) WHERE claimed = false;

-- Seasons - Active season lookup
CREATE INDEX IF NOT EXISTS idx_seasons_active ON seasons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_seasons_dates ON seasons(start_date, end_date);

-- Subscriptions - Active subscription check
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_active ON user_subscriptions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires ON user_subscriptions(expires_at) WHERE is_active = true;

-- Component upgrades - Equipment component lookups
CREATE INDEX IF NOT EXISTS idx_component_upgrades_equipment_id ON component_upgrades(owned_equipment_id);

-- Price alerts - Active alerts for checking
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_active ON price_alerts(user_id, is_active) WHERE is_active = true;

-- Pack purchases - User purchase history
CREATE INDEX IF NOT EXISTS idx_pack_purchases_user_id ON pack_purchases(user_id);

-- Prestige - User prestige data
CREATE INDEX IF NOT EXISTS idx_user_prestige_user_id ON user_prestige(user_id);

-- Game settings - Fast key lookup
CREATE INDEX IF NOT EXISTS idx_game_settings_key ON game_settings(key);
