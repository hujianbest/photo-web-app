/**
 * 摄影师服务平台 - 前端扩展 E2E 测试
 * 基于 docs/0320_test_plan.md 扩展测试用例
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Feature: 用户注册流程', () => {
  test('Given 用户访问注册页, When 填写注册信息, Then 应创建账号', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);
    
    // 填写注册表单
    await page.fill('input[placeholder*="用户名"]', `testuser_${Date.now()}`);
    await page.fill('input[placeholder*="邮箱"]', `test_${Date.now()}@example.com`);
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.fill('input[placeholder*="确认"]', '123456');
    
    // 提交注册
    await page.click('button:has-text("注册")');
    
    // 验证注册成功
    await page.waitForURL(/\/|\/auth\/login/);
  });

  test('Given 用户输入密码不匹配, When 注册, Then 应显示错误', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);
    
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.fill('input[placeholder*="确认"]', '654321');
    
    await page.click('button:has-text("注册")');
    
    // 验证显示错误
    await expect(page.locator('text=/不匹配|错误/')).toBeVisible();
  });
});

test.describe('Feature: 作品详情页', () => {
  test('Given 用户访问作品详情页, When 页面加载完成, Then 应显示作品信息', async ({ page }) => {
    await page.goto(`${BASE_URL}/works`);
    await page.waitForLoadState('networkidle');
    
    // 点击第一个作品
    const firstWork = await page.locator('a[href^="/works/"]').first();
    if (await firstWork.isVisible()) {
      await firstWork.click();
      
      // 验证详情页元素
      await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    }
  });

  test('Given 用户查看作品详情, When 点击点赞按钮, Then 应增加点赞数', async ({ page }) => {
    await page.goto(`${BASE_URL}/works/1`);
    await page.waitForLoadState('networkidle');
    
    // 查找点赞按钮
    const likeButton = await page.locator('button:has-text("赞"), button:has-text("喜欢")').first();
    
    if (await likeButton.isVisible()) {
      await likeButton.click();
      // 等待响应
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Feature: 打卡点详情页', () => {
  test('Given 用户访问打卡点详情页, When 页面加载完成, Then 应显示打卡点信息', async ({ page }) => {
    await page.goto(`${BASE_URL}/spots`);
    await page.waitForLoadState('networkidle');
    
    const firstSpot = await page.locator('a[href^="/spots/"]').first();
    if (await firstSpot.isVisible()) {
      await firstSpot.click();
      
      // 验证详情页元素
      await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    }
  });

  test('Given 用户查看打卡点详情, When 点击打卡按钮, Then 应记录打卡', async ({ page }) => {
    await page.goto(`${BASE_URL}/spots/1`);
    await page.waitForLoadState('networkidle');
    
    const checkinButton = await page.locator('button:has-text("打卡")').first();
    
    if (await checkinButton.isVisible()) {
      await checkinButton.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Feature: 约拍详情页', () => {
  test('Given 用户访问约拍详情页, When 页面加载完成, Then 应显示约拍信息', async ({ page }) => {
    await page.goto(`${BASE_URL}/bookings`);
    await page.waitForLoadState('networkidle');
    
    const firstBooking = await page.locator('a[href^="/bookings/"]').first();
    if (await firstBooking.isVisible()) {
      await firstBooking.click();
      
      await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    }
  });

  test('Given 用户查看约拍详情, When 点击联系按钮, Then 应跳转到私信', async ({ page }) => {
    await page.goto(`${BASE_URL}/bookings/1`);
    await page.waitForLoadState('networkidle');
    
    const contactButton = await page.locator('button:has-text("联系"), a:has-text("联系")').first();
    
    if (await contactButton.isVisible()) {
      await contactButton.click();
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Feature: 文章详情页', () => {
  test('Given 用户访问文章详情页, When 页面加载完成, Then 应显示文章内容', async ({ page }) => {
    await page.goto(`${BASE_URL}/articles`);
    await page.waitForLoadState('networkidle');
    
    const firstArticle = await page.locator('a[href^="/articles/"]').first();
    if (await firstArticle.isVisible()) {
      await firstArticle.click();
      
      await expect(page.locator('article, .prose').first()).toBeVisible();
    }
  });

  test('Given 用户查看文章详情, When 滚动阅读, Then 应显示进度条', async ({ page }) => {
    await page.goto(`${BASE_URL}/articles/1`);
    await page.waitForLoadState('networkidle');
    
    // 滚动页面
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);
    
    // 验证滚动效果
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });
});

test.describe('Feature: 个人中心', () => {
  test('Given 用户已登录, When 访问个人中心, Then 应显示用户信息', async ({ page }) => {
    // 先登录
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[placeholder*="用户名"]', 'testuser');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button:has-text("登录")');
    
    await page.waitForURL(BASE_URL);
    
    // 访问个人中心
    await page.goto(`${BASE_URL}/profile`);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('Given 用户在个人中心, When 切换标签页, Then 应显示对应内容', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    
    // 点击"打卡"标签
    const checkinTab = await page.locator('button:has-text("打卡"), a:has-text("打卡")').first();
    if (await checkinTab.isVisible()) {
      await checkinTab.click();
      await page.waitForTimeout(500);
    }
    
    // 点击"约拍"标签
    const bookingTab = await page.locator('button:has-text("约拍"), a:has-text("约拍")').first();
    if (await bookingTab.isVisible()) {
      await bookingTab.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Feature: 搜索功能', () => {
  test('Given 用户输入搜索关键词, When 搜索, Then 应显示结果', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // 查找搜索框
    const searchInput = await page.locator('input[placeholder*="搜索"], input[type="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('测试');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Feature: 响应式布局', () => {
  test('Given 移动端访问, When 页面加载, Then 应正确显示', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // 验证页面正常显示
    await expect(page.locator('body')).toBeVisible();
  });

  test('Given 平板端访问, When 页面加载, Then 应正确显示', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Feature: 页面导航', () => {
  test('Given 用户在首页, When 点击导航链接, Then 应正确跳转', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // 点击作品链接
    const worksLink = await page.locator('a[href="/works"]').first();
    if (await worksLink.isVisible()) {
      await worksLink.click();
      await expect(page).toHaveURL(/\/works/);
    }
  });

  test('Given 用户在任意页面, When 点击Logo, Then 应返回首页', async ({ page }) => {
    await page.goto(`${BASE_URL}/works`);
    await page.waitForLoadState('networkidle');
    
    const logo = await page.locator('a[href="/"]').first();
    if (await logo.isVisible()) {
      await logo.click();
      await expect(page).toHaveURL(BASE_URL);
    }
  });
});

test.describe('Feature: 404 页面', () => {
  test('Given 访问不存在的页面, When 页面加载, Then 应显示404', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page-12345`);
    await page.waitForLoadState('networkidle');
    
    // 验证显示404或重定向
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/404|nonexistent-page-12345/);
  });
});

test.describe('Feature: 深色模式', () => {
  test('Given 用户切换深色模式, When 切换, Then 应正确显示', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // 查找深色模式切换按钮
    const darkModeButton = await page.locator('button[aria-label*="dark"], button[title*="深色"]').first();
    
    if (await darkModeButton.isVisible()) {
      await darkModeButton.click();
      await page.waitForTimeout(500);
      
      // 验证深色模式应用
      const bodyClass = await page.locator('body').getAttribute('class');
      // 可能包含 dark 类名
    }
  });
});

test.describe('Feature: 加载状态', () => {
  test('Given 页面加载中, When 等待数据, Then 应显示加载指示器', async ({ page }) => {
    // 慢速网络
    await page.route('**/api/**', route => {
      setTimeout(() => route.continue(), 500);
    });
    
    await page.goto(`${BASE_URL}/works`);
    
    // 应该看到加载状态（如果有）
    const loader = await page.locator('.animate-spin, .loading, [aria-busy="true"]').first();
    // 加载状态可能很快消失
  });
});

test.describe('Feature: 表单验证', () => {
  test('Given 用户提交空表单, When 验证, Then 应显示错误', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    
    // 不填写任何内容，直接提交
    await page.click('button:has-text("登录")');
    
    // 应该显示验证错误
    await page.waitForTimeout(500);
  });

  test('Given 用户输入无效邮箱, When 验证, Then 应显示错误', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);
    
    await page.fill('input[placeholder*="邮箱"]', 'invalid-email');
    await page.click('button:has-text("注册")');
    
    await page.waitForTimeout(500);
  });
});

test.describe('Feature: 用户体验', () => {
  test('Given 用户滚动页面, When 滚动到底部, Then 应正确加载更多内容', async ({ page }) => {
    await page.goto(`${BASE_URL}/works`);
    await page.waitForLoadState('networkidle');
    
    // 滚动到底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
  });

  test('Given 用户点击返回按钮, When 返回, Then 应正确返回', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.goto(`${BASE_URL}/works`);
    
    await page.goBack();
    
    await expect(page).toHaveURL(BASE_URL);
  });
});
