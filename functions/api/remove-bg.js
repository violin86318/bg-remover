/**
 * Cloudflare Pages Function: /api/remove-bg
 *
 * Receives an image from the frontend, forwards it to Remove.bg API,
 * returns the processed PNG. API key stays server-side.
 *
 * Requires Bearer token (Google credential JWT) for authenticated users.
 * deducts 1 credit per successful request.
 */

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

async function checkAndDeductCredit(env, email) {
  if (!env.DB || !email) return { allowed: false, reason: 'NO_DB' };

  try {
    const user = await env.DB.prepare(
      'SELECT credits, is_subscription_active, subscription_expires_at FROM users WHERE email = ?'
    ).bind(email).first();

    const now = Math.floor(Date.now() / 1000);

    // Check subscription first
    if (user?.is_subscription_active && user?.subscription_expires_at > now) {
      return { allowed: true, type: 'subscription', remaining: -1 }; // unlimited
    }

    // Check one-time credits
    const credits = user?.credits || 0;
    if (credits <= 0) {
      return { allowed: false, reason: 'NO_CREDITS' };
    }

    // Deduct 1 credit
    await env.DB.prepare(
      'UPDATE users SET credits = credits - 1 WHERE email = ?'
    ).bind(email).run();

    return { allowed: true, type: 'credit', remaining: credits - 1 };
  } catch (err) {
    console.error('[/api/remove-bg] Credit check error:', err);
    return { allowed: true }; // Fail open to not block users
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // --- Auth check ---
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  const payload = token ? parseJwt(token) : {};
  const userEmail = payload.email;

  // --- Credit check (skip for unauthenticated/non-credit users) ---
  if (userEmail) {
    const creditResult = await checkAndDeductCredit(env, userEmail);
    if (!creditResult.allowed) {
      const message = creditResult.reason === 'NO_CREDITS'
        ? 'No credits remaining. Please purchase a credit pack to continue.'
        : 'Unable to verify account. Please sign in again.';
      return new Response(
        JSON.stringify({ error: 'CREDITS_EXCEEDED', message }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (creditResult.remaining >= 0) {
      // Attach remaining credits to response headers for frontend to display
      context.remainingCredits = creditResult.remaining;
    }
  }

  // --- API key check ---
  const apiKey = env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'SERVER_CONFIG_ERROR', message: 'API key not configured on server.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // --- Parse image ---
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return new Response(
      JSON.stringify({ error: 'INVALID_REQUEST', message: 'Request must be multipart/form-data.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let imageFile;
  try {
    const formData = await request.formData();
    imageFile = formData.get('image');

    if (!imageFile || !(imageFile instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'NO_IMAGE', message: 'No image file provided.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const MAX_SIZE = 12 * 1024 * 1024;
    if (imageFile.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({ error: 'IMAGE_TOO_LARGE', message: 'Image must be under 12MB.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return new Response(
        JSON.stringify({ error: 'UNSUPPORTED_FORMAT', message: 'Only JPG, PNG, and WebP are supported.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'PARSE_ERROR', message: 'Failed to parse image data.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // --- Call Remove.bg ---
  const rbFormData = new FormData();
  rbFormData.append('image_file', imageFile);
  rbFormData.append('size', 'auto');
  rbFormData.append('format', 'png');

  let rbResponse;
  try {
    rbResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: rbFormData,
    });
  } catch (err) {
    console.error('[/api/remove-bg] Network error:', err.message);
    return new Response(
      JSON.stringify({
        error: 'NETWORK_ERROR',
        message: 'Cannot reach Remove.bg API. Please try again.',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!rbResponse.ok) {
    let errorDetail = `HTTP ${rbResponse.status}`;
    try {
      const rbError = await rbResponse.json();
      errorDetail = rbError.errors?.[0]?.title || rbError.errors?.[0]?.detail || errorDetail;
    } catch {}

    if (rbResponse.status === 402) {
      return new Response(
        JSON.stringify({ error: 'QUOTA_EXCEEDED', message: 'Remove.bg API quota exceeded.' }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (rbResponse.status === 429) {
      return new Response(
        JSON.stringify({ error: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.error('[/api/remove-bg] Remove.bg error:', errorDetail);
    return new Response(
      JSON.stringify({ error: 'API_ERROR', message: `Remove.bg error: ${errorDetail}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // --- Return result ---
  const resultBlob = await rbResponse.blob();
  const headers = new Headers();
  headers.set('Content-Type', 'image/png');
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (context.remainingCredits !== undefined) {
    headers.set('X-Remaining-Credits', String(context.remainingCredits));
  }

  return new Response(resultBlob, { status: 200, headers });
}
