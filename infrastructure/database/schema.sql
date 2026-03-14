-- 摄影师服务平台数据库初始化脚本

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 用户管理模块
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    points INTEGER DEFAULT 0,
    level VARCHAR(20) DEFAULT 'newbie',
    avatar_url VARCHAR(500),
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(200),
    social_media JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_relationships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'follow',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, follower_id, type)
);

CREATE TABLE point_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL,
    reason VARCHAR(100),
    related_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 内容管理模块
CREATE TABLE works (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    images JSONB NOT NULL,
    category VARCHAR(50),
    tags TEXT[],
    camera_info JSONB,
    location VARCHAR(200),
    coordinates geometry(Point, 4326),
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'published',
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE work_likes (
    id SERIAL PRIMARY KEY,
    work_id INTEGER REFERENCES works(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(work_id, user_id)
);

CREATE TABLE work_comments (
    id SERIAL PRIMARY KEY,
    work_id INTEGER REFERENCES works(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES work_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 打卡点模块
CREATE TABLE checkin_spots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200) NOT NULL,
    coordinates geometry(Point, 4326) NOT NULL,
    city VARCHAR(50),
    province VARCHAR(50),
    images JSONB,
    best_time TEXT[],
    tips TEXT[],
    category VARCHAR(50),
    difficulty VARCHAR(20),
    views INTEGER DEFAULT 0,
    checkins INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active',
    creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checkins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    spot_id INTEGER REFERENCES checkin_spots(id) ON DELETE CASCADE,
    photos JSONB NOT NULL,
    caption TEXT,
    tags TEXT[],
    location VARCHAR(200),
    coordinates geometry(Point, 4326),
    weather VARCHAR(50),
    camera_info JSONB,
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checkin_likes (
    id SERIAL PRIMARY KEY,
    checkin_id INTEGER REFERENCES checkins(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(checkin_id, user_id)
);

-- 约拍模块
CREATE TABLE booking_requests (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    target_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(200),
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time_range VARCHAR(50),
    location VARCHAR(200),
    coordinates geometry(Point, 4326),
    budget DECIMAL(10,2),
    requirements TEXT[],
    style_preferences TEXT[],
    sample_images JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    response_deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES booking_requests(id),
    order_no VARCHAR(50) UNIQUE NOT NULL,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    photographer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(20),
    transaction_id VARCHAR(100),
    contract_url VARCHAR(500),
    contract_signed_at TIMESTAMP,
    shooting_date TIMESTAMP,
    completion_date TIMESTAMP,
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 交付模块
CREATE TABLE deliverables (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    photos JSONB NOT NULL,
    preview_images JSONB,
    ai_processed BOOLEAN DEFAULT FALSE,
    ai_images JSONB,
    watermark_enabled BOOLEAN DEFAULT TRUE,
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 3,
    expiry_date TIMESTAMP,
    client_confirmed BOOLEAN DEFAULT FALSE,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE download_records (
    id SERIAL PRIMARY KEY,
    deliverable_id INTEGER REFERENCES deliverables(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 经验分享模块
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    cover_image VARCHAR(500),
    category VARCHAR(50),
    tags TEXT[],
    equipment JSONB,
    camera_settings JSONB,
    poses JSONB,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE article_likes (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, user_id)
);

CREATE TABLE article_comments (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES article_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 通知模块
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 系统模块
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    ip_address VARCHAR(50),
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_level ON users(level);

CREATE INDEX idx_user_relationships_user_id ON user_relationships(user_id);
CREATE INDEX idx_user_relationships_follower_id ON user_relationships(follower_id);

CREATE INDEX idx_point_records_user_id ON point_records(user_id);
CREATE INDEX idx_point_records_created_at ON point_records(created_at);

CREATE INDEX idx_works_user_id ON works(user_id);
CREATE INDEX idx_works_category ON works(category);
CREATE INDEX idx_works_status ON works(status);
CREATE INDEX idx_works_published_at ON works(published_at);
CREATE INDEX idx_works_location ON works USING GIST(coordinates);
CREATE INDEX idx_works_tags ON works USING GIN(tags);

CREATE INDEX idx_work_likes_work_id ON work_likes(work_id);
CREATE INDEX idx_work_likes_user_id ON work_likes(user_id);

CREATE INDEX idx_work_comments_work_id ON work_comments(work_id);
CREATE INDEX idx_work_comments_user_id ON work_comments(user_id);

CREATE INDEX idx_checkin_spots_coordinates ON checkin_spots USING GIST(coordinates);
CREATE INDEX idx_checkin_spots_city ON checkin_spots(city);
CREATE INDEX idx_checkin_spots_category ON checkin_spots(category);

CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_checkins_spot_id ON checkins(spot_id);
CREATE INDEX idx_checkins_created_at ON checkins(created_at);
CREATE INDEX idx_checkins_coordinates ON checkins USING GIST(coordinates);

CREATE INDEX idx_checkin_likes_checkin_id ON checkin_likes(checkin_id);
CREATE INDEX idx_checkin_likes_user_id ON checkin_likes(user_id);

CREATE INDEX idx_booking_requests_requester_id ON booking_requests(requester_id);
CREATE INDEX idx_booking_requests_target_user_id ON booking_requests(target_user_id);
CREATE INDEX idx_booking_requests_status ON booking_requests(status);
CREATE INDEX idx_booking_requests_date ON booking_requests(date);

CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_photographer_id ON orders(photographer_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE INDEX idx_deliverables_order_id ON deliverables(order_id);

CREATE INDEX idx_download_records_deliverable_id ON download_records(deliverable_id);
CREATE INDEX idx_download_records_user_id ON download_records(user_id);

CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_tags ON articles USING GIN(tags);

CREATE INDEX idx_article_likes_article_id ON article_likes(article_id);
CREATE INDEX idx_article_likes_user_id ON article_likes(user_id);

CREATE INDEX idx_article_comments_article_id ON article_comments(article_id);
CREATE INDEX idx_article_comments_user_id ON article_comments(user_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_settings_key ON settings(key);

CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_action ON logs(action);
CREATE INDEX idx_logs_created_at ON logs(created_at);

-- 插入初始数据
INSERT INTO settings (key, value, description) VALUES
('app_name', '摄影师服务平台', '应用名称'),
('app_version', '1.0.0', '应用版本'),
('max_upload_size', '10485760', '最大上传大小(字节)'),
('enable_registration', 'true', '是否开放注册'),
('points_per_work', '10', '发布作品获得的积分'),
('points_per_checkin', '5', '打卡获得的积分'),
('points_per_follow', '2', '关注用户获得的积分');

-- 创建管理员用户
-- 密码: admin123 (需要使用bcrypt加密)
INSERT INTO users (username, email, password_hash, role, points, level, is_verified) VALUES
('admin', 'admin@photoplatform.com', '$2b$10$XK...', 'admin', 0, 'master', TRUE);

-- 创建示例打卡点
INSERT INTO checkin_spots (name, description, location, coordinates, city, province, category, difficulty) VALUES
('故宫博物院', '历史古迹，古典建筑', '北京市东城区景山前街4号', ST_GeomFromText('POINT(116.3971 39.9163)', 4326), '北京', '北京市', 'outdoor', 'medium'),
('三里屯', '时尚街区，街拍圣地', '北京市朝阳区三里屯路', ST_GeomFromText('POINT(116.4500 39.9360)', 4326), '北京', '北京市', 'urban', 'easy'),
('外滩', '上海标志性景观', '上海市黄浦区中山东一路', ST_GeomFromText('POINT(121.4903 31.2403)', 4326), '上海', '上海市', 'urban', 'easy');

COMMIT;