import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENAI_API_KEY!,
});

const VISION_MODEL = 'google/gemini-2.0-flash-lite-001';
const TEXT_MODEL = 'google/gemini-2.0-flash-lite-001';

export async function analyzeProductImage(imageUrl: string, context?: {
  title?: string; category?: string; subcategory?: string;
  productType?: string; material?: string; style?: string; occasion?: string;
}) {
  const ctx = context || {};
  const contextBlock = [
    ctx.title && `Product Title: ${ctx.title}`,
    ctx.category && `Category: ${ctx.category}`,
    ctx.subcategory && `Subcategory: ${ctx.subcategory}`,
    ctx.productType && `Product Type: ${ctx.productType}`,
    ctx.material && `Material: ${ctx.material}`,
    ctx.style && `Style: ${ctx.style}`,
    ctx.occasion && `Occasion: ${ctx.occasion}`,
  ].filter(Boolean).join('\n');

  const prompt = `You are a product copywriter for a premium Indian handicraft, antique, and ethnic store.

The user has already filled in the following product details — treat these as FACTS, do not change or contradict them:
${contextBlock || '(no additional context provided)'}

Analyze the product image carefully and write:
1. A compelling 2-3 sentence full description highlighting craftsmanship, material, cultural/spiritual significance, and decor value.
2. A 1-sentence short description (max 120 chars).

Rules:
- Use the provided title and category as ground truth
- Do NOT suggest a different product name or category
- Sound premium and authentic
- Avoid hallucinations or invented history

Return ONLY valid JSON:
{
  "description": "",
  "shortDescription": ""
}`;

  try {
    const res = await client.chat.completions.create({
      model: VISION_MODEL,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageUrl } },
          { type: 'text', text: prompt },
        ],
      }],
    });
    const raw = res.choices[0].message.content || '{}';
    const text = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (e: any) {
    console.error('[analyzeProductImage Error]', e?.message || e);
    throw e;
  }
}

function productContext(p: any) {
  return `Title: ${p.title || ''}
Category: ${p.category || ''}
Subcategory: ${p.subcategory || ''}
Material: ${p.material || ''}
Style: ${p.style || ''}
Occasion: ${p.occasion || ''}`;
}

export async function generateDescription(product: { title: string; category?: string; material?: string; style?: string; occasion?: string; images?: string[] }) {
  // Step 1: Vision analysis — identify product from image first
  let visualContext = '';
  let visionResult: any = {};

  if (product.images?.length) {
    try {
      visionResult = await analyzeProductImage(product.images[0]);
      if (visionResult.suggestedTitle || visionResult.description) {
        visualContext = `Visual Analysis Result:
- Identified Product: ${visionResult.suggestedTitle || ''}
- Material: ${visionResult.material || visionResult.suggestedMaterial || ''}
- Style: ${visionResult.style || visionResult.suggestedStyle || ''}
- Category: ${visionResult.category || visionResult.suggestedCategory || ''}
- Short Description: ${visionResult.shortDescription || ''}`;
      }
    } catch {
      // fallback to text-only if vision fails
    }
  }

  // Step 2: Use vision result as primary context, user input as secondary hint
  const messages: any[] = [{ role: 'user', content: [] as any[] }];

  if (product.images?.length) {
    messages[0].content.push({ type: 'image_url', image_url: { url: product.images[0] } });
  }

  const userHint = product.title ? `\nUser-provided title (treat as hint only — if image shows a different product, CORRECT the title): "${product.title}"` : '';
  const formContext = [product.category, product.material, product.style, product.occasion].filter(Boolean).join(', ');

  messages[0].content.push({
    type: 'text',
    text: `You are a product copywriter for a premium Indian handicraft, antique, and ethnic store.

${visualContext || 'Analyze the image carefully to identify the product.'}
${userHint}
${formContext ? `Additional context: ${formContext}` : ''}

Write a compelling 2-3 sentence product description based primarily on what you SEE in the image.
- Highlight the actual product, craftsmanship, material, and cultural significance
- Use evocative but factual language
- Do NOT invent details not visible in the image

Return plain text only.`,
  });

  try {
    const res = await client.chat.completions.create({ model: VISION_MODEL, max_tokens: 512, messages });
    return res.choices[0].message.content?.trim() || '';
  } catch {
    const res = await client.chat.completions.create({
      model: TEXT_MODEL,
      max_tokens: 512,
      messages: [{ role: 'user', content: `Write a 2-3 sentence product description for: ${product.title || 'Indian handicraft product'}. Return plain text only.` }],
    });
    return res.choices[0].message.content?.trim() || '';
  }
}

export async function generateShortDescription(product: { title: string; category?: string; material?: string }) {
  const res = await client.chat.completions.create({
    model: TEXT_MODEL,
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: `Write a 1-sentence short description (max 120 chars) for this product:
${productContext(product)}
Return plain text only.`,
    }],
  });
  return res.choices[0].message.content?.trim() || '';
}

export async function generateTags(product: { title: string; description?: string; category?: string; material?: string; occasion?: string }) {
  const res = await client.chat.completions.create({
    model: TEXT_MODEL,
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: `Generate 8-10 SEO-optimized product tags for this Indian handicraft/ethnic store product.

${productContext(product)}
Description: ${product.description || ''}

Rules:
- Include: product type, material, style, occasion, cultural terms, use-case
- Use lowercase, searchable keywords
- Return JSON array only: ["tag1", "tag2", ...]`,
    }],
  });
  const text = res.choices[0].message.content?.replace(/```json|```/g, '').trim() || '[]';
  try { return JSON.parse(text); } catch { return []; }
}

export async function generateSEO(product: { title: string; description?: string; category?: string; tags?: string[] }) {
  const res = await client.chat.completions.create({
    model: TEXT_MODEL,
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Generate SEO metadata for this product listing.

${productContext(product)}
Description: ${product.description || ''}

Return JSON only:
{
  "seoTitle": "max 60 chars, keyword-rich title",
  "seoDescription": "max 160 chars meta description",
  "searchKeywords": ["keyword1", "keyword2", ...]
}`,
    }],
  });
  const text = res.choices[0].message.content?.replace(/```json|```/g, '').trim() || '{}';
  try { return JSON.parse(text); } catch { return {}; }
}

export async function generateFeatures(product: { title: string; category?: string; material?: string; description?: string }) {
  const res = await client.chat.completions.create({
    model: TEXT_MODEL,
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: `Generate 4-6 key product features/highlights for this product.

${productContext(product)}

Examples: "Handcrafted by artisans", "Made in India", "Brass finish", "Eco-friendly material"

Return JSON array only: ["feature1", "feature2", ...]`,
    }],
  });
  const text = res.choices[0].message.content?.replace(/```json|```/g, '').trim() || '[]';
  try { return JSON.parse(text); } catch { return []; }
}
