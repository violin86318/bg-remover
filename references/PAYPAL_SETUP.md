# PayPal 接入配置指南

## 环境变量配置

在 Cloudflare Pages → Settings → Environment Variables 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `PAYPAL_CLIENT_ID` | 你的 PayPal Sandbox Client ID | 来自 developer.paypal.com |
| `PAYPAL_CLIENT_SECRET` | 你的 PayPal Sandbox Client Secret | 来自 developer.paypal.com |
| `PAYPAL_WEBHOOK_ID` | 你的 Webhook ID | 在 PayPal Dashboard 创建 |
| `PAYPAL_MODE` | `sandbox` | 上线后改为 `live` |

---

## 第一步：创建 PayPal App

1. 访问 [developer.paypal.com](https://developer.paypal.com)
2. Dashboard → My Apps → Create App
3. 选择 **Sandbox** 类型（开发阶段）
4. 复制 **Client ID** 和 **Secret**

---

## 第二步：配置 Webhook（支付回调）

1. PayPal Dashboard → My Apps → 你的 App → Webhooks
2. Add Webhook
3. Webhook URL: `https://bg-remover.beyondmotion.net/api/paypal-webhook`
4. 勾选以下事件：
   - `PAYMENT.CAPTURE.COMPLETED`
   - `SUBSCRIPTION.ACTIVATED`
   - `SUBSCRIPTION.EXPIRED`
   - `SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.REACTIVATED`
5. 保存 Webhook，复制 Webhook ID 到 `PAYPAL_WEBHOOK_ID`

---

## 第三步：订阅产品配置（可选）

如果你使用 PayPal Subscription Billing：

1. PayPal Dashboard → Commerce → Subscriptions
2. 创建 Billing Plans（按月计划）
3. 记录 Plan ID，填入代码 `SUBSCRIPTION_PLANS` 配置

---

## 第四步：本地测试

```bash
# 本地测试需要 Wrangler v2+
npx wrangler pages dev dist

# .dev.vars 文件（gitignored）
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-client-secret
PAYPAL_WEBHOOK_ID=your-webhook-id
PAYPAL_MODE=sandbox
```

---

## 第五步：上线检查清单

- [ ] `.dev.vars` 迁移到 Cloudflare Pages Environment Variables
- [ ] `PAYPAL_MODE` 改为 `live`
- [ ] PayPal App 切换为 Live 模式
- [ ] Webhook URL 改为生产域名
- [ ] 信用卡包 ID 和订阅 Plan ID 更新为生产版本

---

## 数据库迁移

执行 D1 迁移以添加积分和订阅字段：

```bash
# 预览迁移
npx wrangler d1 execute image-background-remover --file=./migrations/0001_add_billing.sql --dry-run

# 执行迁移
npx wrangler d1 execute image-background-remover --file=./migrations/0001_add_billing.sql
```

SQL 内容：
```sql
ALTER TABLE users ADD COLUMN credits INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN subscription_type TEXT;
ALTER TABLE users ADD COLUMN subscription_expires_at INTEGER;
ALTER TABLE users ADD COLUMN is_subscription_active INTEGER NOT NULL DEFAULT 0;
```
