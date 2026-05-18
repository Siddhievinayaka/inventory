import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function analyzeProductImage(imageUrl: string) {
  const response = await client.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
          {
            type: 'text',
            text: `Analyze this product image and provide ONLY factual, visible information. Do NOT make cultural, spiritual, or lifestyle assumptions.

Return valid JSON with these fields based on what you can actually see:
- title: Simple product name (e.g. "Blue Cotton Shirt", "Winter Jacket")
- category: Basic clothing category (e.g. "Shirts", "Jackets", "Dresses")
- material: Only if clearly identifiable from image (otherwise leave empty)
- tags: 4-5 factual tags about visible features
- description: 1 sentence about what you see

Do NOT include: spiritual terms, cultural assumptions, meditation, yoga, devotional purposes

Return JSON only: {"title": "", "category": "", "material": "", "tags": [], "description": ""}`,
          },
        ],
      },
    ],
  });

  const text = response.choices[0].message.content?.replace(/```json|```/g, '').trim() || '{}';
  return JSON.parse(text);
}

export async function generateDescription(product: { title: string; material?: string; category?: string; images?: string[] }) {
  if (!product.images || product.images.length === 0) {
    throw new Error('Product images are required for description generation');
  }

  const response = await client.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: product.images[0] },
          },
          {
            type: 'text',
            text: `Look at this product image. The product name is: "${product.title}"

Write a factual ecommerce description based ONLY on:
1. What you see in the image
2. The product name given

Do NOT use or reference:
- Category information
- Material assumptions
- Cultural/spiritual context
- Lifestyle assumptions

Write 1-2 sentences describing:
- What type of item it is (based on image)
- Visible features (color, style, design elements)
- Basic functionality (based on what you see)

Return plain text only.`,
          },
        ],
      },
    ],
  });

  return response.choices[0].message.content?.trim() || '';
}

export async function generateTags(product: { title: string; description: string; category: string }) {
  const response = await client.chat.completions.create({
    model: 'openai/gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: `Generate 5-6 factual product tags based ONLY on the given information. Do NOT add assumptions or unrelated terms.

Product: ${product.title}
Category: ${product.category}
Description: ${product.description || 'None'}

Rules:
- Only use factual, searchable keywords
- Focus on: clothing type, style, gender (if obvious), season, material (if stated)
- Do NOT include: spiritual terms, cultural assumptions, lifestyle terms, meditation, yoga
- Use simple, common ecommerce terms
- Return as JSON array: ["tag1", "tag2", "tag3", "tag4", "tag5"]

Return JSON array only, no explanation.`,
      },
    ],
  });

  const text = response.choices[0].message.content?.replace(/```json|```/g, '').trim() || '[]';
  return JSON.parse(text);
}
