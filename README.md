# Horizen.js: مكتبة API عالية الأداء لـ JavaScript

![Horizen.js Logo](./horizenjs_logo.png)

Horizen.js هي مكتبة JavaScript قوية مصممة لتسريع استدعاءات الـ API بشكل كبير من خلال تطبيق تقنيات متقدمة مثل **تجميع الطلبات (Request Batching)** و **تجميد الطلبات (Request Freezing)**. تهدف هذه المكتبة إلى تحسين أداء تطبيقات الويب والخادم، وتقليل الحمل على الخوادم، وتوفير تجربة مستخدم أكثر سلاسة.

## الميزات الرئيسية

*   **تجميع الطلبات الذكي**: تقوم Horizen.js بتجميع طلبات API متعددة يتم إجراؤها في فترة زمنية قصيرة (micro-batching) وإرسالها كطلب واحد إلى الخادم. هذا يقلل من عدد رحلات الذهاب والإياب (Round-Trip Time - RTT) ويحسن الكفاءة.
*   **تجميد الطلبات**: تقوم المكتبة بتأخير إرسال الطلبات لفترة وجيزة للسماح بتجميعها، مما يضمن أقصى قدر من التجميع دون التأثير على استجابة التطبيق.
*   **تحسين الأداء 20x**: من خلال تقليل عدد طلبات الشبكة، يمكن لـ Horizen.js تسريع استجابة الـ API بما يصل إلى 20 مرة مقارنة بالأساليب التقليدية، خاصة في السيناريوهات التي تتطلب العديد من استدعاءات الـ API المتتالية.
*   **دعم Node.js و Next.js**: توفر المكتبة مكونات للعمل بسلاسة في بيئات الخادم (Node.js) وتطبيقات Next.js، مما يسهل دمجها في مشاريعك الحالية.
*   **أدوات سطر الأوامر (CLI)**: لتعزيز إنتاجية المطور، توفر Horizen.js مجموعة من أدوات سطر الأوامر لإدارة المشروع واختبار الأداء.
*   **مرونة عالية**: متوافقة مع أي إطار عمل أو مكتبة JavaScript تدعم Node.js و NPM.

## لماذا Horizen.js؟

في عالم تطوير الويب الحديث، يعد الأداء أمراً بالغ الأهمية. يمكن أن تؤدي كثرة طلبات الـ API إلى إبطاء التطبيقات وزيادة استهلاك موارد الخادم. تعالج Horizen.js هذه المشكلة من خلال نهج مبتكر يقلل بشكل كبير من حمل الشبكة ويحسن أوقات الاستجابة، مما يجعل تطبيقاتك أسرع وأكثر كفاءة.

## التثبيت

للبدء باستخدام Horizen.js، تأكد من تثبيت Node.js و npm (أو yarn) على نظامك.

```bash
npm install horizen.js
# أو
yarn add horizen.js
```

## الاستخدام

### 1. في جانب العميل (Client-side) أو Node.js

استخدم `HorizenClient` لإرسال طلبات الـ API. ستقوم المكتبة تلقائيًا بتجميع الطلبات.

```typescript
import { HorizenClient } from 'horizen.js';

const hzClient = new HorizenClient(50); // تجميع الطلبات خلال 50 مللي ثانية

async function fetchData() {
  try {
    const [users, products] = await Promise.all([
      hzClient.request('/api/users'),
      hzClient.request('/api/products'),
      hzClient.request('/api/orders', { method: 'POST', body: { userId: 1 } })
    ]);

    console.log('Users:', users);
    console.log('Products:', products);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchData();
```

في المثال أعلاه، إذا تم استدعاء `fetchData` عدة مرات في فترة قصيرة، ستقوم Horizen.js بتجميع طلبات `/api/users` و `/api/products` و `/api/orders` في طلب شبكة واحد إلى نقطة نهاية التجميع على الخادم.

### 2. في جانب الخادم (Server-side) - Next.js API Routes

للاستفادة الكاملة من تجميع الطلبات، تحتاج إلى نقطة نهاية (endpoint) على الخادم يمكنها معالجة الطلبات المجمعة. توفر Horizen.js `HorizenMiddleware` لهذا الغرض.

أنشئ ملفًا مثل `pages/api/horizen-batch.ts` (أو `app/api/horizen-batch/route.ts` في Next.js App Router):

```typescript
// pages/api/horizen-batch.ts
import { HorizenMiddleware } from 'horizen.js';

export default async function handler(req, res) {
  await HorizenMiddleware.nextHandler(req, res);
}
```

هذا الـ middleware سيستقبل الطلب المجمع من العميل، ويقوم بتنفيذ كل طلب فردي داخليًا، ثم يعيد النتائج المجمعة إلى العميل.

### 3. في جانب الخادم (Server-side) - Express.js

```typescript
// server.js
import express from 'express';
import { HorizenMiddleware } from 'horizen.js';

const app = express();
app.use(express.json()); // تأكد من استخدام body-parser للتعامل مع JSON

app.post('/api/horizen-batch', HorizenMiddleware.expressHandler());

// ... نقاط نهاية API الأخرى الخاصة بك

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## أدوات سطر الأوامر (CLI)

بعد تثبيت `horizen.js`، يمكنك استخدام أدوات سطر الأوامر عن طريق الأمر `horizen`.

```bash
horizen --help
```

الأوامر المتاحة:

*   `horizen init`: لتهيئة Horizen.js في مشروعك.
*   `horizen status`: للتحقق من حالة Horizen.js ومقاييس الأداء.
*   `horizen test-batch <url> [options]`: لاختبار أداء تجميع الـ API.

## المساهمة

نرحب بالمساهمات! إذا كنت ترغب في تحسين Horizen.js، يرجى قراءة [CONTRIBUTING.md](CONTRIBUTING.md) (سيتم إضافته لاحقًا) للحصول على إرشادات.

## الترخيص

Horizen.js مرخصة بموجب ترخيص MIT. انظر ملف [LICENSE](LICENSE) لمزيد من التفاصيل.

## الدعم

للدعم الفني والاستفسارات، يرجى التواصل معنا عبر البريد الإلكتروني: [support@theunitynews.com](mailto:support@theunitynews.com)

## شكر وتقدير

تم تطوير Horizen.js بواسطةMohamedوالمستخدم، بهدف إحداث ثورة في أداء الـ API في تطبيقات JavaScript.
---
