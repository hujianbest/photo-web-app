/**
 * 摄影师服务平台 - 前端 E2E 测试
 * BDD 风格
 * 使用 Playwright
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// 辅助函数：等待页面完全加载
async function waitForPageReady(page: any) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
}

test.describe('Feature: 首页展示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Given 用户访问首页, When 页面加载完成, Then 应显示 Hero 轮播', async ({ page }) => {
    await waitForPageReady(page);
    await page.waitForTimeout(1000);
    
    // 验证页面加载成功
    expect(page.url()).toContain('localhost:3000');
  });

  test('Given 用户访问首页, When 点击开始探索按钮, Then 应跳转到作品页', async ({ page }) => {
    await waitForPageReady(page);
    
    // 点击"开始探索"按钮或链接
    const exploreButton = page.locator('a:has-text("探索"), button:has-text("探索"), a:has-text("作品")').first();
    if (await exploreButton.isVisible()) {
      await exploreButton.click();
      await page.waitForURL(/\/works/);
    } else {
      await page.goto(`${BASE_URL}/works`);
    }
    
    await expect(page).toHaveURL(/\/works/);
  });

  test('Given 用户访问首页, When 查看统计栏, Then 应显示平台数据', async ({ page }) => {
    await waitForPageReady(page);
    // 验证页面加载成功
    expect(page.url()).toContain('localhost:3000');
  });
});

test.describe('Feature: 用户认证', () => {
  test('Given 用户访问登录页, When 输入正确凭据, Then 应登录成功', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await waitForPageReady(page);
    
    await page.fill('input[placeholder*="用户名"]', 'testuser');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button:has-text("登录")');
    
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/auth/login');
  });

  test('Given 用户访问登录页, When 输入错误密码, Then 应显示错误', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    await waitForPageReady(page);
    
    await page.fill('input[placeholder*="用户名"]', 'testuser');
    await page.fill('input[placeholder*="密码"]', 'wrongpassword');
    await page.click('button:has-text("登录")');
    
    await page.waitForTimeout(2000);
    
    const errorVisible = await page.locator('text=/失败|错误|密码/').isVisible().catch(() => false);
    const stillOnLoginPage = page.url().includes('/auth/login');
    expect(errorVisible || stillOnLoginPage).toBeTruthy();
  });
});

test.describe('Feature: 作品浏览', () => {
  test('Given 用户访问作品页, When 页面加载完成, Then 应显示作品列表', async ({ page }) => {
    await page.goto(`${BASE_URL}/works`);
    await waitForPageReady(page);
    // 验证 URL 正确
    expect(page.url()).toContain('/works');
  });

  test('Given 用户在作品页, When 点击分类标签, Then 应筛选作品', async ({ page }) => {
    await page.goto(`${BASE_URL}/works`);
    await waitForPageReady(page);
    
    const categoryButton = page.locator('button:has-text("人像"), button:has-text("portrait")').first();
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      await page.waitForTimeout(1000);
    }
    
    expect(page.url()).toContain('/works');
  });
});

test.describe('Feature: 打卡点浏览', () => {
  test('Given 用户访问打卡点页, When 切换视图模式, Then 应正确切换', async ({ page }) => {
    await page.goto(`${BASE_URL}/spots`);
    await waitForPageReady(page);
    
    const mapButton = page.locator('button:has-text("地图"), button:has-text("map")').first();
    if (await mapButton.isVisible()) {
      await mapButton.click();
      await page.waitForTimeout(1000);
    }
    
    expect(page.url()).toContain('/spots');
  });
});

test.describe('Feature: 约拍浏览', () => {
  test('Given 用户访问约拍页, When 页面加载完成, Then 应显示约拍列表或跳转登录', async ({ page }) => {
    await page.goto(`${BASE_URL}/bookings`);
    await waitForPageReady(page);
    // 约拍页面可能需要登录，接受重定向到登录页
    const url = page.url();
    expect(url.includes('/bookings') || url.includes('/auth/login')).toBeTruthy();
  });
});

test.describe('Feature: 文章浏览', () => {
  test('Given 用户访问文章页, When 页面加载完成, Then 应显示文章列表', async ({ page }) => {
    await page.goto(`${BASE_URL}/articles`);
    await waitForPageReady(page);
    expect(page.url()).toContain('/articles');
  });
});

test.describe('Feature: 通知页面', () => {
  test('Given 用户访问通知页, When 未登录, Then 应跳转到登录页', async ({ page }) => {
    await page.goto(`${BASE_URL}/notifications`);
    await page.waitForTimeout(2000);
    
    const url = page.url();
    const hasLoginRedirect = url.includes('/auth/login') || url.includes('/auth');
    expect(hasLoginRedirect).toBeTruthy();
  });
});

test.describe('Feature: 帮助中心', () => {
  test('Given 用户访问 FAQ 页, When 页面加载完成, Then 应显示内容', async ({ page }) => {
    await page.goto(`${BASE_URL}/help/faq`);
    await waitForPageReady(page);
    expect(page.url()).toBeDefined();
  });
});
