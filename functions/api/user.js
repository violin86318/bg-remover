/**
 * Cloudflare Pages Function: /api/user
 *
 * Handles user upsert (POST) and user lookup (GET)
 * Uses Google credential JWT for authentication
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { email, name, picture, credential } = await request.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'INVALID_REQUEST', message: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate credential if provided (optional - client-side already validated)
    if (credential) {
      const payload = parseJwt(credential);
      if (payload.email !== email) {
        return new Response(
          JSON.stringify({ error: 'TOKEN_MISMATCH', message: 'Email mismatch' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const now = Math.floor(Date.now() / 1000);

    // Upsert user: insert or update on conflict
    const result = await env.DB.prepare(`
      INSERT INTO users (id, email, name, picture, created_at, last_login)
      VALUES (
        lower(hex(randomblob(16))),
        ?,
        ?,
        ?,
        ?,
        ?
      )
      ON CONFLICT(email) DO UPDATE SET
        name = excluded.name,
        picture = excluded.picture,
        last_login = excluded.last_login
      RETURNING id, email, name, picture, created_at, last_login
    `).bind(email, name || null, picture || null, now, now).first();

    return new Response(
      JSON.stringify({ success: true, user: result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[/api/user] Error:', err);
    return new Response(
      JSON.stringify({ error: 'SERVER_ERROR', message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestGet(context) {
  const { request, env } = context;

  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  if (!email) {
    return new Response(
      JSON.stringify({ error: 'INVALID_REQUEST', message: 'Email query param required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const user = await env.DB.prepare(
      'SELECT id, email, name, picture, created_at, last_login FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'NOT_FOUND', message: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, user }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[/api/user GET] Error:', err);
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
