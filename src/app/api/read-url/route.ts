// URL Scraper API — reads a landing page using Cheerio
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { SCRAPER_MAX_CONTENT_LENGTH, SCRAPER_TIMEOUT } from '@/lib/utils/constants';
import { rateLimit } from '@/lib/utils/rate-limit';

export async function POST(request: Request) {
  try {
    // 1. Rate Limit Check
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitRes = await rateLimit(ip, 10, 60); // Max 10 scraps per minute per IP
    if (!limitRes.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { url } = await request.json();


    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Fetch the page
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SCRAPER_TIMEOUT);

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DevDistro/1.0; +https://devdistro.com)',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        title: '',
        description: '',
        content: '',
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, nav, footer
    $('script, style, nav, footer, header, iframe, noscript').remove();

    // Extract metadata
    const title = $('title').text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('h1').first().text().trim() ||
      '';

    const description = $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';

    // Extract main content
    const mainContent = $('main, article, [role="main"], .content, #content')
      .first()
      .text()
      .trim();

    const bodyText = mainContent || $('body').text().trim();

    // Clean up whitespace
    const content = bodyText
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, SCRAPER_MAX_CONTENT_LENGTH);

    return NextResponse.json({
      success: true,
      title: title.slice(0, 200),
      description: description.slice(0, 500),
      content,
    });
  } catch (error) {
    console.error('URL scraper error:', error);
    return NextResponse.json({
      success: false,
      title: '',
      description: '',
      content: '',
      error: 'Failed to read URL. The page might be JavaScript-rendered or blocking scrapers.',
    });
  }
}
