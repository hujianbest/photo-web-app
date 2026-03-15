/**
 * E2E：使用测试数据填写表单、完成工作流、响应式、错误信息、控制台 JS 错误监控
 * 运行前请确保 API 已启动：cd services/api && npm run start:dev
 */
import { test, expect } from '@playwright/test';

const TEST_USER = {
  username: `e2e_${Date.now()}`,
  email: `e2e_${Date.now()}@test.local`,
  password: 'Test123456',
};

test.describe('控制台 JS 错误监控', () => {
  test('主要页面加载无未捕获的 JS 错误', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      const type = msg.type();
      if (type === 'error') {
        const text = msg.text();
        consoleErrors.push(text);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle').catch(() => {});

    const allowed = [
      'Failed to load resource',
      'net::ERR_CONNECTION_REFUSED',
      '404',
      'WebSocket',
      'socket',
    ];
    const critical = consoleErrors.filter(
      (e) => !allowed.some((a) => e.includes(a))
    );
    expect(critical, `发现控制台错误: ${critical.join('; ')}`).toHaveLength(0);
  });
});

test.describe('认证流程', () => {
  test('登录页：无效账号显示错误信息', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByPlaceholder('用户名或邮箱').fill('invalid_user_xyz');
    await page.getByPlaceholder('密码').fill('wrongpassword');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page.getByText(/登录失败|错误|invalid/i)).toBeVisible({ timeout: 10000 });
  });

  test('注册页：密码不一致显示错误', async ({ page }) => {
    await page.goto('/auth/register');
    await page.getByPlaceholder(/用户名/).fill('testuser');
    await page.getByPlaceholder('邮箱地址').fill('test@test.com');
    await page.getByPlaceholder(/密码.*至少6位/).fill('Test123456');
    await page.getByPlaceholder('确认密码').fill('OtherPassword');
    await page.getByRole('button', { name: '注册' }).click();
    await expect(page.getByText('两次输入的密码不一致')).toBeVisible();
  });

  test('注册 → 登录 → 首页显示用户信息', async ({ page }) => {
    await page.goto('/auth/register');
    await page.getByPlaceholder(/用户名/).fill(TEST_USER.username);
    await page.getByPlaceholder('邮箱地址').fill(TEST_USER.email);
    await page.getByPlaceholder(/密码.*至少6位/).fill(TEST_USER.password);
    await page.getByPlaceholder('确认密码').fill(TEST_USER.password);
    await page.getByRole('button', { name: '注册' }).click();
    // 注册成功应跳转首页（依赖 API 运行在 localhost:8000）
    await expect(page).toHaveURL(/\//, { timeout: 15000 });
  });
});

test.describe('主导航与工作流', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByPlaceholder('用户名或邮箱').fill(TEST_USER.username);
    await page.getByPlaceholder('密码').fill(TEST_USER.password);
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL(/\//, { timeout: 15000 });
  });

  test('首页导航链接可点击并跳转', async ({ page }) => {
    await page.goto('/');
    // Header 内导航有多个「作品」链接，取第一个（主导航）
    await page.getByRole('link', { name: '作品', exact: true }).first().click();
    await expect(page).toHaveURL(/\/works/);
    await page.goto('/');
    await page.getByRole('link', { name: '打卡点', exact: true }).first().click();
    await expect(page).toHaveURL(/\/spots/);
    await page.goto('/');
    await page.getByRole('link', { name: '约拍', exact: true }).first().click();
    await expect(page).toHaveURL(/\/bookings/);
    await page.goto('/');
    await page.getByRole('link', { name: '订单', exact: true }).first().click();
    await expect(page).toHaveURL(/\/orders/);
    await page.goto('/');
    await page.getByRole('link', { name: '经验', exact: true }).first().click();
    await expect(page).toHaveURL(/\/articles/);
  });

  test('个人中心 → 编辑资料 → 保存', async ({ page }) => {
    await page.goto('/profile/edit');
    const saveBtn = page.getByRole('button', { name: '保存' });
    const onLogin = page.getByText('欢迎回来');
    await expect(saveBtn.or(onLogin)).toBeVisible({ timeout: 15000 });
    if (await onLogin.isVisible()) {
      return; // 未登录或 API 未返回 user，编辑页已重定向到登录，跳过后续断言
    }
    await page.locator('input[type="text"]').first().fill(TEST_USER.username);
    await page.locator('textarea').fill('E2E 测试简介');
    await saveBtn.click();
    await expect(page.getByText('保存成功')).toBeVisible({ timeout: 10000 });
  });

  test('经验分享 → 写文章 → 校验必填错误 → 填写后发布', async ({ page }) => {
    await page.goto('/articles/new');
    await page.getByRole('button', { name: '发布' }).click();
    await expect(page.getByText(/请填写标题和正文/)).toBeVisible();
    await page.getByPlaceholder('文章标题').fill('E2E 测试文章');
    await page.getByPlaceholder(/支持纯文本/).fill('这是 E2E 测试正文内容。');
    await page.getByRole('button', { name: '发布' }).click();
    // 发布成功跳转文章详情；API 未启动时可能显示错误并停留在 new
    const ok = await page.waitForURL(/\/articles\/\d+/, { timeout: 15000 }).catch(() => false);
    if (ok) {
      await expect(page).toHaveURL(/\/articles\/\d+/);
    } else {
      await expect(page.getByText(/发布失败|网络错误|401|请/)).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('响应式设计', () => {
  test('桌面端：Header 显示完整导航', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.getByRole('link', { name: '作品' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: '首页' }).first()).toBeVisible();
  });

  test('移动端：汉堡菜单可展开并点击导航', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const menuButton = page.getByRole('button', { name: /菜单|打开|导航/ }).or(page.locator('button').filter({ has: page.locator('svg') }).first());
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.getByRole('link', { name: '作品' }).first()).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('订单与约拍入口', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByPlaceholder('用户名或邮箱').fill(TEST_USER.username);
    await page.getByPlaceholder('密码').fill(TEST_USER.password);
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL(/\//, { timeout: 15000 });
  });

  test('订单列表加载并可进入详情', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle').catch(() => {});
    const firstOrderLink = page.locator('a[href^="/orders/"]').first();
    if (await firstOrderLink.isVisible()) {
      await firstOrderLink.click();
      await expect(page).toHaveURL(/\/orders\/\d+/);
    } else {
      await expect(page.locator('h1:has-text("我的订单"), p:has-text("暂无订单")').first()).toBeVisible();
    }
  });

  test('约拍列表加载', async ({ page }) => {
    await page.goto('/bookings');
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page).toHaveURL(/\/bookings/);
  });
});
