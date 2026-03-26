/**
 * Cloudflare Pages Function: /api/history
 *
 * GET: Returns usage history for the authenticated user.
 * Requires Authorization: Bearer <credential> header.
 */

export async function onRequestGet(context) {
  const { request, env } = context;

  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let userEmail;
  try {
    const payload = parseJwt(authHeader.slice(7));
    userEmail = payload.email;
    if (!userEmail) throw new Error('No email in token');
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'INVALID_TOKEN', message: 'Invalid or expired credential' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!env.DB) {
    return new Response(
      JSON.stringify({ error: 'SERVER_ERROR', message: 'Database not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const history = await env.DB.prepare(`
      SELECT id, original_filename, created_at
      FROM usage_history
      WHERE user_email = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).bind(userEmail).all();

    return new Response(
      JSON.stringify({
        success: true,
        history: history.results || [],
        count: history.results?.length || 0,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[/api/history] Error:', err);
    return new Response(
      JSON.stringify({ error: 'SERVER_ERROR', message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

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
