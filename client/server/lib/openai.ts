import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeProductImage(imageUrl: string) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: imageUrl } },
        { type: 'text', text: 'Analyze this product image. Return JSON: { "title": "", "category": "", "material": "", "tags": [], "description": "" }' },
      ],
    }],
    response_format: { type: 'json_object' },
  });
  return JSON.parse(res.choices[0].message.content || '{}');
}

export async function generateDescription(product: { title: string; material: string; category: string }) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `Write a concise 2-sentence product description for a spiritual/devotional store. Product: ${product.title}, Material: ${product.material || 'N/A'}, Category: ${product.category}. Return plain text only, no JSON.`,
    }],
  });
  return res.choices[0].message.content || '';
}

export async function generateTags(product: { title: string; description: string; category: string }) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `Generate 6 relevant tags for this product: ${product.title} (${product.category}). Return as a JSON object: { "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"] }`,
    }],
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(res.choices[0].message.content || '{"tags":[]}');
  return parsed.tags || [];
}
