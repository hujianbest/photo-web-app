# 数据库设计文档

## 数据库选型
- **主数据库**: PostgreSQL 15+
- **缓存数据库**: Redis 7+
- **扩展**: PostGIS (地理位置支持)

## 数据库表结构

### 1. 用户管理模块

#### users (用户表)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- user, model, admin
    points INTEGER DEFAULT 0,
    level VARCHAR(20) DEFAULT 'newbie', -- newbie, intermediate, professional, master
    avatar_url VARCHAR(500),
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(200),
    social_media JSONB, -- 存储社交媒体链接
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, deleted
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_level ON users(level);
```

#### user_relationships (用户关系表)
```sql
CREATE TABLE user_relationships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'follow', -- follow, block
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, follower_id, type)
);

CREATE INDEX idx_user_relationships_user_id ON user_relationships(user_id);
CREATE INDEX idx_user_relationships_follower_id ON user_relationships(follower_id);
```

#### point_records (积分记录表)
```sql
CREATE TABLE point_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL, -- earn, spend
    reason VARCHAR(100),
    related_id INTEGER, -- 关联的记录ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_point_records_user_id ON point_records(user_id);
CREATE INDEX idx_point_records_created_at ON point_records(created_at);
```

### 2. 内容管理模块

#### works (作品表)
```sql
CREATE TABLE works (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    images JSONB NOT NULL, -- 存储图片URL数组
    category VARCHAR(50), -- portrait, landscape, street, product, etc.
    tags TEXT[], -- 标签数组
    camera_info JSONB, -- 相机信息: {camera, lens, settings}
    location VARCHAR(200),
    coordinates geometry(Point, 4326), -- PostGIS地理位置
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'published', -- draft, published, archived
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_works_user_id ON works(user_id);
CREATE INDEX idx_works_category ON works(category);
CREATE INDEX idx_works_status ON works(status);
CREATE INDEX idx_works_published_at ON works(published_at);
CREATE INDEX idx_works_location ON works USING GIST(coordinates);
CREATE INDEX idx_works_tags ON works USING GIN(tags);
```

#### work_likes (作品点赞表)
```sql
CREATE TABLE work_likes (
    id SERIAL PRIMARY KEY,
    work_id INTEGER REFERENCES works(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(work_id, user_id)
);

CREATE INDEX idx_work_likes_work_id ON work_likes(work_id);
CREATE INDEX idx_work_likes_user_id ON work_likes(user_id);
```

#### work_comments (作品评论表)
```sql
CREATE TABLE work_comments (
    id SERIAL PRIMARY KEY,
    work_id INTEGER REFERENCES works(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES work_comments(id) ON DELETE CASCADE, -- 回复评论
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_comments_work_id ON work_comments(work_id);
CREATE INDEX idx_work_comments_user_id ON work_comments(user_id);
```

### 3. 打卡点模块

#### checkin_spots (打卡点表)
```sql
CREATE TABLE checkin_spots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200) NOT NULL,
    coordinates geometry(Point, 4326) NOT NULL,
    city VARCHAR(50),
    province VARCHAR(50),
    images JSONB, -- 打卡点示例图片
    best_time TEXT[], -- 最佳拍摄时间
    tips TEXT[], -- 拍摄建议
    category VARCHAR(50), -- indoor, outdoor, urban, nature
    difficulty VARCHAR(20), -- easy, medium, hard
    views INTEGER DEFAULT 0,
    checkins INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active',
    creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_checkin_spots_coordinates ON checkin_spots USING GIST(coordinates);
CREATE INDEX idx_checkin_spots_city ON checkin_spots(city);
CREATE INDEX idx_checkin_spots_category ON checkin_spots(category);
```

#### checkins (打卡记录表)
```sql
CREATE TABLE checkins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    spot_id INTEGER REFERENCES checkin_spots(id) ON DELETE CASCADE,
    photos JSONB NOT NULL, -- 打卡照片
    caption TEXT,
    tags TEXT[],
    location VARCHAR(200),
    coordinates geometry(Point, 4326),
    weather VARCHAR(50), -- 天气情况
    camera_info JSONB, -- 拍摄参数
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_checkins_spot_id ON checkins(spot_id);
CREATE INDEX idx_checkins_created_at ON checkins(created_at);
CREATE INDEX idx_checkins_coordinates ON checkins USING GIST(coordinates);
```

#### checkin_likes (打卡点赞表)
```sql
CREATE TABLE checkin_likes (
    id SERIAL PRIMARY KEY,
    checkin_id INTEGER REFERENCES checkins(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(checkin_id, user_id)
);

CREATE INDEX idx_checkin_likes_checkin_id ON checkin_likes(checkin_id);
CREATE INDEX idx_checkin_likes_user_id ON checkin_likes(user_id);
```

### 4. 约拍模块

#### booking_requests (约拍需求表)
```sql
CREATE TABLE booking_requests (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    target_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- tfp (互勉), paid (收费)
    title VARCHAR(200),
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time_range VARCHAR(50), -- 09:00-17:00
    location VARCHAR(200),
    coordinates geometry(Point, 4326),
    budget DECIMAL(10,2), -- 收费约拍金额
    requirements TEXT[], -- 具体要求
    style_preferences TEXT[], -- 风格偏好
    sample_images JSONB, -- 参考图片
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, completed, cancelled
    response_deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_booking_requests_requester_id ON booking_requests(requester_id);
CREATE INDEX idx_booking_requests_target_user_id ON booking_requests(target_user_id);
CREATE INDEX idx_booking_requests_status ON booking_requests(status);
CREATE INDEX idx_booking_requests_date ON booking_requests(date);
```

#### orders (订单表)
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES booking_requests(id),
    order_no VARCHAR(50) UNIQUE NOT NULL,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    photographer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, shooting, editing, completed, cancelled, refunded
    payment_method VARCHAR(20), -- alipay, wechat, offline
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

CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_photographer_id ON orders(photographer_id);
CREATE INDEX idx_orders_status ON orders(status);
```

### 5. 订单交付模块

#### deliverables (交付作品表)
```sql
CREATE TABLE deliverables (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    photos JSONB NOT NULL, -- 原始照片
    preview_images JSONB, -- 预览缩略图
    ai_processed BOOLEAN DEFAULT FALSE,
    ai_images JSONB, -- AI处理后的照片
    watermark_enabled BOOLEAN DEFAULT TRUE,
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 3,
    expiry_date TIMESTAMP,
    client_confirmed BOOLEAN DEFAULT FALSE,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deliverables_order_id ON deliverables(order_id);
```

#### download_records (下载记录表)
```sql
CREATE TABLE download_records (
    id SERIAL PRIMARY KEY,
    deliverable_id INTEGER REFERENCES deliverables(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_download_records_deliverable_id ON download_records(deliverable_id);
CREATE INDEX idx_download_records_user_id ON download_records(user_id);
```

### 6. 经验分享模块

#### articles (经验文章表)
```sql
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    cover_image VARCHAR(500),
    category VARCHAR(50), -- tips, review, tutorial, settings
    tags TEXT[],
    equipment JSONB, -- 器材信息
    camera_settings JSONB, -- 拍摄参数
    poses JSONB, -- 摆拍姿势指导
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_tags ON articles USING GIN(tags);
```

#### article_likes (文章点赞表)
```sql
CREATE TABLE article_likes (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, user_id)
);

CREATE INDEX idx_article_likes_article_id ON article_likes(article_id);
CREATE INDEX idx_article_likes_user_id ON article_likes(user_id);
```

#### article_comments (文章评论表)
```sql
CREATE TABLE article_comments (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES article_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_article_comments_article_id ON article_comments(article_id);
CREATE INDEX idx_article_comments_user_id ON article_comments(user_id);
```

### 7. 通知模块

#### notifications (通知表)
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- like, comment, follow, booking, order, system
    title VARCHAR(200) NOT NULL,
    content TEXT,
    data JSONB, -- 通知相关数据
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

### 8. 系统模块

#### settings (系统设置表)
```sql
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_key ON settings(key);
```

#### logs (操作日志表)
```sql
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

CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_action ON logs(action);
CREATE INDEX idx_logs_created_at ON logs(created_at);
```

## 数据库初始化脚本

```sql
-- 创建数据库
CREATE DATABASE photo_platform;

-- 连接数据库
\c photo_platform;

-- 启用PostGIS扩展
CREATE EXTENSION IF NOT EXISTS postgis;

-- 创建UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 执行上述所有表创建脚本
```

## 数据库优化建议

### 索引策略
- 为所有外键创建索引
- 为常用查询条件创建复合索引
- 地理位置查询使用PostGIS GIST索引
- 全文搜索使用GIN索引

### 分区策略
- 按时间分区大型表 (logs, notifications)
- 按用户ID分区订单相关表

### 查询优化
- 使用EXPLAIN ANALYZE分析慢查询
- 合理使用连接查询和子查询
- 避免SELECT *，只查询必要字段
- 大批量操作使用批量插入/更新

### 缓存策略
- 热点数据缓存到Redis
- 缓存用户会话信息
- 缓存热门作品列表
- 缓存地理位置查询结果

## 备份策略

### 备份频率
- 全量备份: 每天凌晨2点
- 增量备份: 每小时
- WAL日志: 实时

### 备份保留
- 全量备份保留30天
- 增量备份保留7天
- 重要数据永久保留

### 备份验证
- 每周进行一次备份恢复测试
- 监控备份任务执行状态