# API接口文档

## 基础信息
- **基础URL**: `https://api.example.com/api/v1`
- **认证方式**: JWT Bearer Token
- **响应格式**: JSON
- **字符编码**: UTF-8

## 统一响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1677648000
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "参数错误",
  "error": "详细错误信息",
  "timestamp": 1677648000
}
```

### 状态码说明
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `429`: 请求过于频繁
- `500`: 服务器错误

## 认证接口

### 用户注册
```
POST /auth/register
```

**请求体**:
```json
{
  "username": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "role": "user"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 1,
      "username": "john",
      "email": "john@example.com",
      "phone": "13800138000",
      "role": "user",
      "points": 0,
      "level": "newbie",
      "created_at": "2024-03-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 用户登录
```
POST /auth/login
```

**请求体**:
```json
{
  "username": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "john",
      "email": "john@example.com",
      "role": "user",
      "points": 1000,
      "level": "intermediate"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 刷新Token
```
POST /auth/refresh
```

**请求体**:
```json
{
  "refreshToken": "string"
}
```

### 发送验证码
```
POST /auth/send-code
```

**请求体**:
```json
{
  "phone": "13800138000",
  "type": "register" // register, login, reset_password
}
```

## 用户接口

### 获取用户信息
```
GET /users/:id
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "john",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "bio": "专注于人像摄影",
    "location": "北京",
    "website": "https://portfolio.com",
    "level": "intermediate",
    "points": 1000,
    "stats": {
      "works_count": 50,
      "followers_count": 120,
      "following_count": 30,
      "checkins_count": 25
    },
    "is_following": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 更新用户信息
```
PUT /users/:id
```

**请求体**:
```json
{
  "bio": "string",
  "location": "string",
  "website": "string",
  "avatar": "string"
}
```

### 获取用户作品
```
GET /users/:id/works?page=1&limit=20
```

### 关注用户
```
POST /users/:id/follow
```

### 取消关注
```
DELETE /users/:id/follow
```

### 获取关注者列表
```
GET /users/:id/followers?page=1&limit=20
```

### 获取关注列表
```
GET /users/:id/following?page=1&limit=20
```

## 作品接口

### 获取作品列表
```
GET /works?page=1&limit=20&category=portrait&sort=latest
```

**参数说明**:
- `page`: 页码
- `limit`: 每页数量
- `category`: 作品分类
- `sort`: 排序方式 (latest, popular, random)

**响应**:
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "城市夜景",
        "description": "拍摄于三里屯",
        "images": [
          "https://cdn.example.com/work1.jpg"
        ],
        "category": "urban",
        "tags": ["夜景", "街拍"],
        "author": {
          "id": 1,
          "username": "john",
          "avatar": "https://cdn.example.com/avatar.jpg"
        },
        "stats": {
          "views": 1000,
          "likes": 120,
          "comments": 20
        },
        "is_liked": false,
        "created_at": "2024-03-01T00:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_items": 200,
      "per_page": 20
    }
  }
}
```

### 获取作品详情
```
GET /works/:id
```

### 上传作品
```
POST /works
```

**请求体**:
```json
{
  "title": "string",
  "description": "string",
  "images": ["string"],
  "category": "string",
  "tags": ["string"],
  "camera_info": {
    "camera": "string",
    "lens": "string",
    "settings": {
      "iso": 100,
      "aperture": "f/2.8",
      "shutter": "1/125",
      "focal_length": "50mm"
    }
  },
  "location": "string",
  "coordinates": {
    "lat": 39.9042,
    "lng": 116.4074
  }
}
```

### 更新作品
```
PUT /works/:id
```

### 删除作品
```
DELETE /works/:id
```

### 点赞作品
```
POST /works/:id/like
```

### 取消点赞作品
```
DELETE /works/:id/like
```

### 获取作品评论
```
GET /works/:id/comments?page=1&limit=20
```

### 发表评论
```
POST /works/:id/comments
```

**请求体**:
```json
{
  "content": "string",
  "parent_id": 0 // 回复评论时填写
}
```

## 打卡点接口

### 获取打卡点列表
```
GET /spots?page=1&limit=20&city=北京&category=outdoor&sort=popular
```

**参数说明**:
- `city`: 城市
- `category`: 类型 (indoor, outdoor, urban, nature)
- `sort`: 排序 (popular, latest, rating)

**响应**:
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "故宫博物院",
        "description": "历史古迹，古典建筑",
        "location": "北京市东城区景山前街4号",
        "coordinates": {
          "lat": 39.9163,
          "lng": 116.3971
        },
        "images": ["https://cdn.example.com/spot1.jpg"],
        "best_time": ["清晨", "黄昏"],
        "tips": ["建议使用广角镜头", "注意人流避开节假日"],
        "category": "outdoor",
        "rating": 4.8,
        "checkins": 1250,
        "views": 5000,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 15,
      "total_items": 300,
      "per_page": 20
    }
  }
}
```

### 搜索打卡点
```
GET /spots/search?keyword=公园&lat=39.9042&lng=116.4074&radius=5000
```

**参数说明**:
- `keyword`: 搜索关键词
- `lat, lng`: 中心点坐标
- `radius`: 搜索半径(米)

### 获取打卡点详情
```
GET /spots/:id
```

### 创建打卡点
```
POST /spots
```

**请求体**:
```json
{
  "name": "string",
  "description": "string",
  "location": "string",
  "coordinates": {
    "lat": 39.9042,
    "lng": 116.4074
  },
  "city": "北京",
  "images": ["string"],
  "best_time": ["string"],
  "tips": ["string"],
  "category": "outdoor"
}
```

### 打卡
```
POST /spots/:id/checkin
```

**请求体**:
```json
{
  "photos": ["string"],
  "caption": "string",
  "tags": ["string"],
  "weather": "晴天",
  "camera_info": {
    "camera": "Canon EOS R5",
    "lens": "RF 50mm f/1.2",
    "settings": {
      "iso": 100,
      "aperture": "f/2.0",
      "shutter": "1/200"
    }
  }
}
```

### 获取打卡记录
```
GET /spots/:id/checkins?page=1&limit=20
```

### 获取我的打卡记录
```
GET /checkins/me?page=1&limit=20
```

### 点赞打卡
```
POST /checkins/:id/like
```

## 约拍接口

### 获取约拍列表
```
GET /bookings?page=1&limit=20&type=all&status=pending
```

**参数说明**:
- `type`: 类型 (all, tfp, paid)
- `status`: 状态 (pending, accepted, rejected, completed)

### 创建约拍需求
```
POST /bookings
```

**请求体**:
```json
{
  "target_user_id": 2,
  "type": "paid",
  "title": "人像拍摄",
  "description": "需要拍摄个人写真，风格清新自然",
  "date": "2024-03-15",
  "time_range": "09:00-17:00",
  "location": "北京市朝阳区三里屯",
  "coordinates": {
    "lat": 39.9360,
    "lng": 116.4500
  },
  "budget": 500.00,
  "requirements": [
    "需要化妆",
    "提供3套服装"
  ],
  "style_preferences": [
    "清新",
    "自然",
    "生活化"
  ]
}
```

### 获取约拍详情
```
GET /bookings/:id
```

### 接受约拍
```
POST /bookings/:id/accept
```

### 拒绝约拍
```
POST /bookings/:id/reject
```

**请求体**:
```json
{
  "reason": "时间冲突"
}
```

### 取消约拍
```
POST /bookings/:id/cancel
```

## 订单接口

### 获取订单列表
```
GET /orders?page=1&limit=20&status=all
```

### 创建订单
```
POST /orders
```

**请求体**:
```json
{
  "booking_id": 1
}
```

### 获取订单详情
```
GET /orders/:id
```

### 支付订单
```
POST /orders/:id/pay
```

**请求体**:
```json
{
  "payment_method": "alipay"
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "order_id": 1,
    "payment_url": "https://qr.alipay.com/...",
    "qr_code": "data:image/png;base64,...",
    "expire_time": "2024-03-15T00:30:00Z"
  }
}
```

### 确认拍摄完成
```
POST /orders/:id/complete
```

### 申请退款
```
POST /orders/:id/refund
```

**请求体**:
```json
{
  "reason": "时间冲突",
  "amount": 500.00
}
```

## 交付接口

### 上传交付作品
```
POST /deliverables
```

**请求体**:
```json
{
  "order_id": 1,
  "photos": ["string"],
  "watermark_enabled": true
}
```

### 获取交付作品
```
GET /deliverables/:id
```

### AI修图
```
POST /deliverables/:id/enhance
```

**请求体**:
```json
{
  "mode": "portrait", // portrait, landscape, auto
  "settings": {
    "enhance_quality": true,
    "remove_noise": true,
    "adjust_exposure": true
  }
}
```

### 下载作品
```
GET /deliverables/:id/download
```

### 确认交付
```
POST /deliverables/:id/confirm
```

**请求体**:
```json
{
  "feedback": "非常满意，感谢！"
}
```

## 经验分享接口

### 获取文章列表
```
GET /articles?page=1&limit=20&category=tips&sort=latest
```

### 获取文章详情
```
GET /articles/:id
```

### 创建文章
```
POST /articles
```

**请求体**:
```json
{
  "title": "string",
  "content": "string",
  "summary": "string",
  "cover_image": "string",
  "category": "tips",
  "tags": ["string"],
  "equipment": {
    "camera": "string",
    "lens": "string",
    "accessories": ["string"]
  },
  "camera_settings": {
    "iso": 100,
    "aperture": "f/2.8",
    "shutter": "1/125"
  }
}
```

### 更新文章
```
PUT /articles/:id
```

### 删除文章
```
DELETE /articles/:id
```

### 点赞文章
```
POST /articles/:id/like
```

## 通知接口

### 获取通知列表
```
GET /notifications?page=1&limit=20&unread=true
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "type": "like",
        "title": "新点赞",
        "content": "john 点赞了你的作品《城市夜景》",
        "data": {
          "work_id": 1,
          "user_id": 2
        },
        "is_read": false,
        "created_at": "2024-03-01T00:00:00Z"
      }
    ],
    "unread_count": 5
  }
}
```

### 标记已读
```
POST /notifications/:id/read
```

### 全部标记已读
```
POST /notifications/read-all
```

## 文件上传接口

### 上传图片
```
POST /upload/image
```

**请求**: multipart/form-data

**响应**:
```json
{
  "code": 200,
  "data": {
    "url": "https://cdn.example.com/images/xxx.jpg",
    "thumbnail_url": "https://cdn.example.com/images/xxx_thumb.jpg",
    "filename": "xxx.jpg",
    "size": 1024000,
    "width": 1920,
    "height": 1080
  }
}
```

### 批量上传
```
POST /upload/batch
```

**请求**: multipart/form-data (多文件)

## 搜索接口

### 全局搜索
```
GET /search?q=keyword&type=all&page=1&limit=20
```

**参数说明**:
- `q`: 搜索关键词
- `type`: 搜索类型 (all, works, users, spots, articles)

## 地理位置接口

### 逆地理编码
```
GET /location/reverse?lat=39.9042&lng=116.4074
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "address": "北京市东城区王府井大街",
    "city": "北京",
    "province": "北京市",
    "country": "中国"
  }
}
```

### 地理编码
```
GET /location/geocode?address=北京市朝阳区三里屯
```

## 统计接口

### 用户统计
```
GET /stats/user/:id
```

### 平台统计
```
GET /stats/platform
```

## 错误处理

### 错误响应格式
```json
{
  "code": 400,
  "message": "错误描述",
  "error": "详细错误信息",
  "timestamp": 1677648000
}
```

### 常见错误码
- `400`: 请求参数错误
- `401`: Token无效或过期
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突
- `413`: 文件过大
- `429`: 请求过于频繁
- `500`: 服务器内部错误

### 限流规则
- 普通用户: 100次/分钟
- VIP用户: 300次/分钟
- 上传接口: 10次/分钟
- 注册登录: 5次/分钟

## 接口版本控制

当前版本: `v1`

版本升级策略:
- 新增接口不影响旧版本
- 重大变更发布新版本
- 旧版本保留至少6个月

## 接口文档更新

最后更新时间: 2024-03-01

文档维护: 技术团队