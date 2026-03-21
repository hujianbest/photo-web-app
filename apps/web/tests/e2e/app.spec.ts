/**
 * 摄影师服务平台 - 前端 E2E 测试
 * BDD 风格
 * 使用 Playwright
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Feature: 首页展示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Given 用户访问首页, When 页面加载完成, Then 应显示 Hero 轮播', async ({ page }) => {
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 验证 Hero 轮播存在
    const heroSection = await page.locator('section').first();
    await expect(heroSection).toBeVisible();
  });

  test('Given 用户访问首页, When 点击开始探索按钮, Then 应跳转到作品页', async ({ page }) => {
    // 点击"开始探索"按钮
    await page.click('text=开始探索');
    
    // 验证跳转到作品页
    await expect(page).toHaveURL(/\/works/);
  });

  test('Given 用户访问首页, When 查看统计栏, Then 应显示平台数据', async ({ page }) => {
    // 验证统计数据存在
    const statsBar = await page.locator('text=作品').first();
    await expect(statsBar).toBeVisible();
  });
});

test.describe('Feature: 用户认证', () => {
  test('Given 用户访问登录页, When 输入正确凭据, Then 应登录成功', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    
    // 填写登录表单
    await page.fill('input[placeholder*="用户名"]', 'testuser');
    await page.fill('input[placeholder*="密码"]', '123456');
    
    // 点击登录
    await page.click('button:has-text("登录")');
    
    // 验证登录成功（跳转到首页）
    await page.waitForURL(BASE_URL);
  });

  test('Given 用户访问登录页, When 输入错误密码, Then 应显示错误', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    
    await page.fill('input[placeholder*="用户名"]', 'testuser');
    await page.fill('input[placeholder*="密码"]', 'wrongpassword');
    
    await page.click('button:has-text("登录")');
    
    // 验证显示错误信息
    await expect(page.locator('text=/失败|错误/')).toBeVisible();
  });
});

test.describe('Feature: 作品浏览', () => {
  test('Given 用户访问作品页, When 页面加载完成, Then 应显示瀑布流布局', async ({ page }) => {
    await page.goto(`${BASE_URL}/works`);
    
    // 等待作品加载
    await page.waitForLoadState('networkidle');
    
    // 验证瀑布流布局
    const worksGrid = await page.locator('.columns-2, .columns-3, .columns-4').first();
    await expect(worksGrid).toBeVisible();
  });

  test('Given 用户在作品页, When 点击分类标签, Then 应筛选作品', async ({ page }) => {
    await page.goto(`${BASE_URL}/works`);
    
    // 点击"人像"分类
    await page.click('button:has-text("人像")');
    
    // 等待作品更新
    await page.waitForTimeout(1000);
    
    // 验证 URL 包含分类参数
    await expect(page).toHaveURL(/category=portrait/);
  });
});

test.describe('Feature: 打卡点浏览', () => {
  test('Given 用户访问打卡点页, When 切换视图模式, Then 应正确切换', async ({ page }) => {
    await page.goto(`${BASE_URL}/spots`);
    
    // 点击地图视图
    await page.click('button:has-text("地图视图")');
    
    // 验证地图区域显示
    const mapArea = await page.locator('text=/地图功能/').first();
    await expect(mapArea).toBeVisible();
  });
});

test.describe('Feature: 约拍浏览', () => {
  test('Given 用户访问约拍页, When 页面加载完成, Then 应显示约拍卡片', async ({ page }) => {
    await page.goto(`${BASE_URL}/bookings`);
    
    await page.waitForLoadState('networkidle');
    
    // 验证约拍卡片存在
    const bookingCard = await page.locator('.rounded-2xl').first();
    await expect(bookingCard).toBeVisible();
  });
});

test.describe('Feature: 文章浏览', () => {
  test('Given 用户访问文章页, When 页面加载完成, Then 应显示文章列表', async ({ page }) => {
    await page.goto(`${BASE_URL}/articles`);
    
    await page.waitForLoadState('networkidle');
    
    // 验证文章存在
    const articleCard = await page.locator('article, .rounded-xl').first();
    await expect(articleCard).toBeVisible();
  });
});

test.describe('Feature: 通知页面', () => {
  test('Given 用户访问通知页, When 未登录, Then 应跳转到登录页', async ({ page }) => {
    await page.goto(`${BASE_URL}/notifications`);
    
    // 验证跳转到登录页
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.describe('Feature: 帮助中心', () => {
  test('Given 用户访问 FAQ 页, When 页面加载完成, Then 应显示问题列表', async ({ page }) => {
    await page.goto(`${BASE_URL}/help/faq`);
    
    // 验证 FAQ 内容存在
    const faqContent = await page.locator('h1, h2').first();
    await expect(faqContent).toBeVisible();
  });
});
