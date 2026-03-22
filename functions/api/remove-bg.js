/**
 * Cloudflare Pages Function: /api/remove-bg
 *
 * Receives an image from the frontend, forwards it to Remove.bg API,
 * returns the processed PNG. API key stays server-side.
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  const apiKey = env.REMOVE_BG_API_KEY || env.REMOVE_BG_API_KEY?.value;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'SERVER_CONFIG_ERROR', message: 'API key not configured on server.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

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

  // Forward to Remove.bg
  const rbFormData = new FormData();
  rbFormData.append('image_file', imageFile);
  rbFormData.append('size', 'auto');
  rbFormData.append('format', 'png');

  let rbResponse;
  try {
    rbResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: rbFormData,
    });
  } catch (err) {
    // Network error - Cloudflare can't reach Remove.bg
    console.error('[/api/remove-bg] Network error reaching Remove.bg:', err.message);
    return new Response(
      JSON.stringify({
        error: 'NETWORK_ERROR',
        message: 'Cannot reach Remove.bg API from server. Please try again.',
        detail: err.message,
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!rbResponse.ok) {
    let errorDetail = `HTTP ${rbResponse.status}`;
    try {
      const rbError = await rbResponse.json();
      errorDetail = rbError.errors?.[0]?.title || rbError.errors?.[0]?.detail || `HTTP ${rbResponse.status}`;
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
    if (rbResponse.status === 401 || rbResponse.status === 403) {
      return new Response(
        JSON.stringify({ error: 'AUTH_ERROR', message: 'Invalid Remove.bg API key.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.error('[/api/remove-bg] Remove.bg API error:', errorDetail);
    return new Response(
      JSON.stringify({ error: 'API_ERROR', message: `Remove.bg error: ${errorDetail}` }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Stream back the result
  const resultBlob = await rbResponse.blob();
  const headers = new Headers();
  headers.set('Content-Type', 'image/png');
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

  return new Response(resultBlob, { status: 200, headers });
}
