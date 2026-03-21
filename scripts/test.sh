#!/bin/bash
# 摄影师服务平台 - 自动化测试脚本

API="http://localhost:8000/api/v1"
FRONTEND="http://localhost:3000"
TOKEN=""
BUGS=()
PASSED=0
FAILED=0

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

log_fail() {
    echo -e "${RED}❌ $1${NC}"
    echo "   原因: $2"
    BUGS+=("$1: $2")
    ((FAILED++))
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "======================================"
echo "摄影师服务平台 - 功能测试"
echo "======================================"
echo ""

# 1. 健康检查
echo "【1. 健康检查】"
HEALTH=$(curl -s $API/health)
if [[ $HEALTH == *"ok"* ]]; then
    log_pass "API-001: API 健康检查"
else
    log_fail "API-001: API 健康检查" "API 未响应"
fi

FRONTEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND)
if [[ $FRONTEND_CODE == "200" ]]; then
    log_pass "FRONTEND-001: 前端页面可访问"
else
    log_fail "FRONTEND-001: 前端页面可访问" "返回 $FRONTEND_CODE"
fi

echo ""

# 2. 用户认证
echo "【2. 用户认证测试】"

# 注册测试用户
REG_RESULT=$(curl -s -X POST $API/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser2","email":"test2@example.com","password":"123456"}')

if [[ $REG_RESULT == *"success"* ]] || [[ $REG_RESULT == *"已存在"* ]]; then
    log_pass "AUTH-001: 用户注册"
else
    log_fail "AUTH-001: 用户注册" "$REG_RESULT"
fi

# 登录
LOGIN_RESULT=$(curl -s -X POST $API/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"123456"}')

if [[ $LOGIN_RESULT == *"access_token"* ]]; then
    log_pass "AUTH-002: 用户登录"
    TOKEN=$(echo $LOGIN_RESULT | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
else
    log_fail "AUTH-002: 用户登录" "$LOGIN_RESULT"
fi

# 登录失败测试
LOGIN_FAIL=$(curl -s -X POST $API/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"wrongpassword"}')

if [[ $LOGIN_FAIL == *"error"* ]] || [[ $LOGIN_FAIL == *"失败"* ]]; then
    log_pass "AUTH-003: 登录失败验证"
else
    log_fail "AUTH-003: 登录失败验证" "错误密码未拒绝"
fi

echo ""

# 3. 作品模块
echo "【3. 作品模块测试】"

WORKS=$(curl -s $API/works)
if [[ $WORKS == *"success"* ]] || [[ $WORKS == *"items"* ]]; then
    log_pass "WORK-001: 获取作品列表"
else
    log_fail "WORK-001: 获取作品列表" "$WORKS"
fi

WORKS_PORTRAIT=$(curl -s "$API/works?category=portrait")
if [[ $WORKS_PORTRAIT == *"success"* ]] || [[ $WORKS_PORTRAIT == *"items"* ]]; then
    log_pass "WORK-002: 按分类筛选作品"
else
    log_fail "WORK-002: 按分类筛选作品" "$WORKS_PORTRAIT"
fi

# 创建作品（需要登录）
if [[ -n $TOKEN ]]; then
    CREATE_WORK=$(curl -s -X POST $API/works \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{"title":"测试作品","description":"这是一个测试","images":["https://example.com/test.jpg"],"category":"portrait"}')
    
    if [[ $CREATE_WORK == *"success"* ]]; then
        log_pass "WORK-003: 创建作品"
        WORK_ID=$(echo $CREATE_WORK | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    else
        log_fail "WORK-003: 创建作品" "$CREATE_WORK"
    fi
fi

echo ""

# 4. 打卡点模块
echo "【4. 打卡点模块测试】"

SPOTS=$(curl -s $API/spots)
if [[ $SPOTS == *"success"* ]] || [[ $SPOTS == *"items"* ]]; then
    log_pass "SPOT-001: 获取打卡点列表"
else
    log_fail "SPOT-001: 获取打卡点列表" "$SPOTS"
fi

echo ""

# 5. 约拍模块
echo "【5. 约拍模块测试】"

BOOKINGS=$(curl -s $API/bookings)
if [[ $BOOKINGS == *"success"* ]] || [[ $BOOKINGS == *"items"* ]]; then
    log_pass "BOOK-001: 获取约拍列表"
else
    log_fail "BOOK-001: 获取约拍列表" "$BOOKINGS"
fi

echo ""

# 6. 文章模块
echo "【6. 文章模块测试】"

ARTICLES=$(curl -s $API/articles)
if [[ $ARTICLES == *"success"* ]] || [[ $ARTICLES == *"items"* ]]; then
    log_pass "ART-001: 获取文章列表"
else
    log_fail "ART-001: 获取文章列表" "$ARTICLES"
fi

echo ""

# 7. 通知模块
echo "【7. 通知模块测试】"

if [[ -n $TOKEN ]]; then
    NOTIFS=$(curl -s $API/notifications -H "Authorization: Bearer $TOKEN")
    if [[ $NOTIFS == *"success"* ]] || [[ $NOTIFS == *"items"* ]]; then
        log_pass "NOTIF-001: 获取通知列表"
    else
        log_fail "NOTIF-001: 获取通知列表" "$NOTIFS"
    fi
fi

echo ""

# 8. 前端页面测试
echo "【8. 前端页面测试】"

PAGES=("/" "/works" "/spots" "/bookings" "/articles" "/auth/login" "/notifications" "/help/faq")
for PAGE in "${PAGES[@]}"; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND$PAGE")
    if [[ $CODE == "200" ]]; then
        log_pass "PAGE: $PAGE"
    else
        log_fail "PAGE: $PAGE" "返回 $CODE"
    fi
done

echo ""

# 9. 安全测试
echo "【9. 安全测试】"

# 未授权访问
UNAUTH=$(curl -s -o /dev/null -w "%{http_code}" $API/notifications)
if [[ $UNAUTH == "401" ]]; then
    log_pass "SEC-004: 未授权访问被拒绝"
else
    log_fail "SEC-004: 未授权访问被拒绝" "返回 $UNAUTH 而非 401"
fi

echo ""

# 汇总
echo "======================================"
echo "测试结果汇总"
echo "======================================"
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo ""

if [[ ${#BUGS[@]} -gt 0 ]]; then
    echo "发现的问题:"
    for bug in "${BUGS[@]}"; do
        echo -e "  ${RED}- $bug${NC}"
    done
fi

echo ""
echo "测试完成！"
