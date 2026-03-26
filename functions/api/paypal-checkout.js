/**
 * Cloudflare Pages Function: /api/paypal-checkout
 *
 * Creates a PayPal order for credit pack or subscription purchase.
 * POST body: { type: 'credit' | 'subscription', packageId: string, email: string }
 *
 * Returns: { orderID, approvalUrl }
 */

// Use PAYPAL_MODE env var to switch between sandbox and live
// Defaults to sandbox for safety
function getPayPalApiBase(env) {
  if (env.PAYPAL_MODE === 'live') {
    return 'https://api-m.paypal.com';
  }
  return 'https://api-m.sandbox.paypal.com';
}

// Credit packages config (must match Pricing.jsx)
const CREDIT_PACKAGES = {
  starter: { credits: 10,  price: 4.99,  name: 'Starter - 10 Credits' },
  popular: { credits: 30,  price: 12.99, name: 'Popular - 30 Credits' },
  pro:     { credits: 80,  price: 29.99, name: 'Pro Pack - 80 Credits' },
};

// Subscription plans config
const SUBSCRIPTION_PLANS = {
  basic: { credits: 25,  price: 9.99,  name: 'Basic Monthly - 25 Credits' },
  pro:   { credits: 60,  price: 19.99, name: 'Pro Monthly - 60 Credits' },
};

// Capture credentials from environment
function getPayPalCredentials(env) {
  return {
    clientId: env.PAYPAL_CLIENT_ID,
    clientSecret: env.PAYPAL_CLIENT_SECRET,
  };
}

async function getAccessToken(clientId, clientSecret, paypalApiBase) {
  const auth = btoa(`${clientId}:${clientSecret}`);
  console.log(`[PayPal] Attempting auth to ${paypalApiBase}`);
  console.log(`[PayPal] Client ID prefix: ${clientId.slice(0, 8)}...`);
  const response = await fetch(`${paypalApiBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`[PayPal] Auth failed. Status: ${response.status}, Body: ${err}`);
    throw new Error(`PayPal auth failed: ${err}`);
  }

  const data = await response.json();
  console.log(`[PayPal] Auth success`);
  return data.access_token;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const { clientId, clientSecret } = getPayPalCredentials(env);
  if (!clientId || !clientSecret) {
    return new Response(
      JSON.stringify({ error: 'SERVER_CONFIG_ERROR', message: 'PayPal not configured on server.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'INVALID_REQUEST', message: 'Invalid JSON body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { type, packageId, email } = body;
  if (!type || !packageId) {
    return new Response(
      JSON.stringify({ error: 'INVALID_REQUEST', message: 'type and packageId are required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Resolve package details
  let pkg;
  if (type === 'credit') {
    pkg = CREDIT_PACKAGES[packageId];
  } else if (type === 'subscription') {
    pkg = SUBSCRIPTION_PLANS[packageId];
  }

  if (!pkg) {
    return new Response(
      JSON.stringify({ error: 'INVALID_PACKAGE', message: `Unknown package: ${packageId}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const accessToken = await getAccessToken(clientId, clientSecret);

    // Create PayPal order
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [{
        description: pkg.name,
        amount: {
          currency_code: 'USD',
          value: pkg.price.toFixed(2),
        },
        custom_id: JSON.stringify({ type, packageId, email }),
      }],
    };

    // For subscriptions, use billing agreement
    let orderResponse;
    if (type === 'subscription') {
      // Create subscription (Billing Agreement)
      const subPayload = {
        plan_id: `PLAN_${packageId}_${Date.now()}`, // In production, create billing plans in PayPal dashboard
        subscriber: email ? { email_address: email } : undefined,
        custom_id: JSON.stringify({ type, packageId, email }),
      };

      orderResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `sub_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        },
        body: JSON.stringify(subPayload),
      });
    } else {
      orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `order_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        },
        body: JSON.stringify(orderPayload),
      });
    }

    if (!orderResponse.ok) {
      const err = await orderResponse.text();
      console.error('[/api/paypal-checkout] PayPal error:', err);
      return new Response(
        JSON.stringify({ error: 'PAYPAL_ERROR', message: 'Failed to create PayPal order.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const orderData = await orderResponse.json();

    // Extract approval URL
    let approvalUrl;
    if (type === 'subscription') {
      approvalUrl = orderData.links?.find(l => l.rel === 'approve')?.href;
    } else {
      approvalUrl = orderData.links?.find(l => l.rel === 'approve')?.href;
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderID: orderData.id,
        approvalUrl,
        type,
        packageId,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[/api/paypal-checkout] Error:', err);
    return new Response(
      JSON.stringify({ error: 'SERVER_ERROR', message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
