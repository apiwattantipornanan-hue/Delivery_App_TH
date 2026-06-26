const LINE_PUSH_ENDPOINT = "https://api.line.me/v2/bot/message/push";

function corsHeaders(env = {}) {
  return {
    "access-control-allow-origin": env.ALLOWED_ORIGIN || "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store",
  };
}

function json(body, status = 200, env = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(env),
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function firestoreBaseUrl(env) {
  const projectId = env.FIREBASE_PROJECT_ID || "bunlee-pickup-order";
  const apiKey = env.FIREBASE_WEB_API_KEY || "AIzaSyBiKVa5_xzkz_lpfj3XzZrvalyQf3-r1f8";
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
}

function readValue(value) {
  if (!value || typeof value !== "object") return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(readValue);
  if ("mapValue" in value) return readFields(value.mapValue.fields || {});
  return null;
}

function readFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, readValue(value)]));
}

async function getOrder(env, orderId) {
  const response = await fetch(
    `${firestoreBaseUrl(env)}/orders/${encodeURIComponent(orderId)}?key=${
      env.FIREBASE_WEB_API_KEY || "AIzaSyBiKVa5_xzkz_lpfj3XzZrvalyQf3-r1f8"
    }`,
  );

  if (!response.ok) {
    return null;
  }

  const doc = await response.json();
  return readFields(doc.fields || {});
}

async function pushLineMessage(env, lineUserId, text) {
  const response = await fetch(LINE_PUSH_ENDPOINT, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [
        {
          type: "text",
          text,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `LINE push failed (${response.status})`);
  }
}

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(context.env),
  });
}

export async function onRequestPost(context) {
  const env = context.env || {};

  if (!env.LINE_CHANNEL_ACCESS_TOKEN) {
    return json(
      {
        status: "unconfigured",
        message: "LINE_CHANNEL_ACCESS_TOKEN is not configured.",
      },
      200,
      env,
    );
  }

  const body = await context.request.json().catch(() => ({}));
  const orderId = String(body.orderId || "").trim();

  if (!orderId) {
    return json({ status: "rejected", message: "Missing orderId." }, 400, env);
  }

  const order = await getOrder(env, orderId);
  if (!order) {
    return json({ status: "not_found", message: "Order not found." }, 404, env);
  }

  if (!order.lineUserId) {
    return json(
      {
        status: "needs_line_link",
        message: "Customer has not linked this order with LINE yet.",
      },
      200,
      env,
    );
  }

  const message = [
    "อาหารพร้อมรับแล้วครับ จากร้านปอเปี๊ยะนายบุ้นหลี",
    `เลขออเดอร์ ${orderId}`,
    order.pickupTime ? `รอบรับสินค้า ${order.pickupTime}` : "",
    "ขอบคุณครับ",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await pushLineMessage(env, order.lineUserId, message);
    return json(
      {
        status: "sent",
        message: "LINE ready message sent.",
        orderId,
        sentAt: new Date().toISOString(),
      },
      200,
      env,
    );
  } catch (error) {
    return json(
      {
        status: "failed",
        message: error.message || "Could not send LINE message.",
        orderId,
      },
      502,
      env,
    );
  }
}

export async function onRequestGet(context) {
  return json(
    {
      ok: true,
      message: "LINE ready endpoint is ready. Use POST with orderId.",
    },
    200,
    context.env,
  );
}
