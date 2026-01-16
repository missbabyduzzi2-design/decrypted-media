const DEFAULT_MAX_CHARS = 300000;

const decodeHtmlEntities = (input) => {
  if (!input) return '';
  const named = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  };
  let output = input.replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (m) => named[m] || m);
  output = output.replace(/&#(\d+);/g, (_m, num) => {
    const code = Number(num);
    return Number.isFinite(code) ? String.fromCharCode(code) : '';
  });
  output = output.replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => {
    const code = Number.parseInt(hex, 16);
    return Number.isFinite(code) ? String.fromCharCode(code) : '';
  });
  return output;
};

const extractTagContent = (html, tag) => {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1] : '';
};

const extractMetaContent = (html, prop) => {
  const match = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'));
  return match ? match[1] : '';
};

const extractLdJson = (html) => {
  const blocks = [];
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
};

const stripHtmlToText = (html) => {
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ');

  cleaned = cleaned.replace(/<\/(p|div|section|article|main|br|li|h1|h2|h3|h4|h5|h6)>/gi, '\n');
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');
  cleaned = decodeHtmlEntities(cleaned);
  cleaned = cleaned.replace(/\s+/g, ' ').replace(/\n\s+/g, '\n').trim();
  return cleaned;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let payload;
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (error) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const url = payload?.url;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url' });
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid url' });
  }

  if (!/^https?:$/.test(parsed.protocol)) {
    return res.status(400).json({ error: 'Only http/https urls are allowed' });
  }

  try {
    const upstream = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DecryptedMediaBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `Fetch failed: ${upstream.statusText}` });
    }

    const html = await upstream.text();
    const title =
      decodeHtmlEntities(extractTagContent(html, 'title')).trim() ||
      decodeHtmlEntities(extractMetaContent(html, 'og:title')).trim();

    let structuredText = '';
    for (const block of extractLdJson(html)) {
      try {
        const parsed = JSON.parse(block);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (item && typeof item === 'object') {
            if (typeof item.articleBody === 'string' && item.articleBody.length > structuredText.length) {
              structuredText = item.articleBody;
            }
          }
        }
      } catch (e) {
        // Ignore invalid JSON blocks
      }
    }

    const articleHtml =
      extractTagContent(html, 'article') ||
      extractTagContent(html, 'main') ||
      extractTagContent(html, 'body') ||
      html;

    let text = structuredText || stripHtmlToText(articleHtml);
    if (!structuredText && text.length < 2000) {
      const bodyText = stripHtmlToText(extractTagContent(html, 'body') || html);
      if (bodyText.length > text.length) {
        text = bodyText;
      }
    }
    const truncated = text.length > DEFAULT_MAX_CHARS;
    const outputText = truncated ? text.slice(0, DEFAULT_MAX_CHARS) : text;

    return res.status(200).json({
      url,
      title: title || null,
      text: outputText,
      truncated
    });
  } catch (error) {
    return res.status(502).json({ error: 'Failed to fetch or parse content' });
  }
}
