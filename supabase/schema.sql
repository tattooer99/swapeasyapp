-- SwapEasyApp Database Schema for Supabase
-- Виконайте цей SQL скрипт в SQL Editor Supabase

-- Таблиця користувачів
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  telegram_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  username TEXT,
  region TEXT,
  rating INTEGER DEFAULT 0,
  successful_exchanges INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблиця кейсів користувача
CREATE TABLE IF NOT EXISTS my_items (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  item_type TEXT NOT NULL,
  description TEXT NOT NULL,
  price_category TEXT NOT NULL,
  photo1 TEXT,
  photo2 TEXT,
  photo3 TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблиця вподобаних кейсів
CREATE TABLE IF NOT EXISTS liked_items (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  item_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  item_type TEXT NOT NULL,
  description TEXT NOT NULL,
  price_category TEXT NOT NULL,
  photo1 TEXT,
  photo2 TEXT,
  photo3 TEXT,
  owner_telegram_id TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Таблиця інтересів
CREATE TABLE IF NOT EXISTS interests (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  price_category TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблиця лайків
CREATE TABLE IF NOT EXISTS likes (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  item_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Таблиця пропозицій обміну
CREATE TABLE IF NOT EXISTS exchange_offers (
  id BIGSERIAL PRIMARY KEY,
  from_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  to_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  offered_item_id BIGINT NOT NULL,
  requested_item_id BIGINT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Таблиця сповіщень про взаємні лайки
CREATE TABLE IF NOT EXISTS mutual_likes_notifications (
  id BIGSERIAL PRIMARY KEY,
  user1_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  user2_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  user1_item_id BIGINT NOT NULL,
  user2_item_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user1_id, user2_id, user1_item_id, user2_item_id)
);

-- Таблиця повідомлень (чат між користувачами)
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  from_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  to_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Додавання полів рейтингу до існуючої таблиці users (якщо їх ще немає)
DO $$ 
BEGIN
  -- Додаємо поле rating, якщо його немає
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'rating'
  ) THEN
    ALTER TABLE users ADD COLUMN rating INTEGER DEFAULT 0;
  END IF;

  -- Додаємо поле successful_exchanges, якщо його немає
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'successful_exchanges'
  ) THEN
    ALTER TABLE users ADD COLUMN successful_exchanges INTEGER DEFAULT 0;
  END IF;
END $$;

-- Створення індексів для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_my_items_user_id ON my_items(user_id);
CREATE INDEX IF NOT EXISTS idx_my_items_item_type ON my_items(item_type);
CREATE INDEX IF NOT EXISTS idx_liked_items_user_id ON liked_items(user_id);
CREATE INDEX IF NOT EXISTS idx_interests_user_id ON interests(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_item_id ON likes(item_id);
CREATE INDEX IF NOT EXISTS idx_exchange_offers_to_user_id ON exchange_offers(to_user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_offers_status ON exchange_offers(status);
CREATE INDEX IF NOT EXISTS idx_exchange_offers_from_user_id ON exchange_offers(from_user_id);
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating);
CREATE INDEX IF NOT EXISTS idx_messages_from_user_id ON messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user_id ON messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Увімкнення Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE liked_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutual_likes_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Політики доступу (для розробки - дозволяємо всі операції)
-- УВАГА: Для продакшену потрібно налаштувати більш обмежені політики!

DROP POLICY IF EXISTS "Enable all operations for all users" ON users;
CREATE POLICY "Enable all operations for all users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON my_items;
CREATE POLICY "Enable all operations for all users" ON my_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON liked_items;
CREATE POLICY "Enable all operations for all users" ON liked_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON interests;
CREATE POLICY "Enable all operations for all users" ON interests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON likes;
CREATE POLICY "Enable all operations for all users" ON likes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON exchange_offers;
CREATE POLICY "Enable all operations for all users" ON exchange_offers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON mutual_likes_notifications;
CREATE POLICY "Enable all operations for all users" ON mutual_likes_notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON messages;
CREATE POLICY "Enable all operations for all users" ON messages FOR ALL USING (true) WITH CHECK (true);

-- Додавання полів рейтингу до існуючої таблиці users (якщо їх ще немає)
DO $$ 
BEGIN
  -- Додаємо поле rating, якщо його немає
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'rating'
  ) THEN
    ALTER TABLE users ADD COLUMN rating INTEGER DEFAULT 0;
  END IF;

  -- Додаємо поле successful_exchanges, якщо його немає
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'successful_exchanges'
  ) THEN
    ALTER TABLE users ADD COLUMN successful_exchanges INTEGER DEFAULT 0;
  END IF;
END $$;

-- Функція для збільшення рейтингу користувача
CREATE OR REPLACE FUNCTION increment_user_rating(user_id_param BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET 
    successful_exchanges = COALESCE(successful_exchanges, 0) + 1,
    rating = COALESCE(rating, 0) + 1
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

