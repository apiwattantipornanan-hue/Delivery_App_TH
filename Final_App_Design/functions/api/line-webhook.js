const LINE_REPLY_ENDPOINT = "https://api.line.me/v2/bot/message/reply";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function base64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

async function verifyLineSignature(rawBody, signature, channelSecret) {
  if (!channelSecret) return true;
  if (!signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(channelSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  return base64(new Uint8Array(signed)) === signature;
}

function firestoreBaseUrl(env) {
  const projectId = env.FIREBASE_PROJECT_ID || "bunlee-pickup-order";
  const apiKey = env.FIREBASE_WEB_API_KEY || "AIzaSyBiKVa5_xzkz_lpfj3XzZrvalyQf3-r1f8";
  return {
    apiKey,
    url: `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`,
  };
}

function valueForFirestore(value) {
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: value } : { doubleValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  return { stringValue: String(value ?? "") };
}

async function patchOrder(env, orderId, patch) {
  const { apiKey, url } = firestoreBaseUrl(env);
  const updateMask = Object.keys(patch)
    .map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`)
    .join("&");

  const response = await fetch(`${url}/orders/${encodeURIComponent(orderId)}?key=${apiKey}&${updateMask}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      fields: Object.fromEntries(Object.entries(patch).map(([key, value]) => [key, valueForFirestore(value)])),
    }),
  });

  return response.ok;
}

async function reply(env, replyToken, text) {
  if (!env.LINE_CHANNEL_ACCESS_TOKEN || !replyToken) return;

  await fetch(LINE_REPLY_ENDPOINT, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });
}

function findOrderId(text) {
  return String(text || "").match(/NB-\d{8}-\d{3}/i)?.[0]?.toUpperCase() || null;
}

async function handleEvent(env, event) {
  const replyToken = event.replyToken;
  const userId = event.source?.userId;

  if (event.type === "follow") {
    await reply(
      env,
      replyToken,
      "ขอบคุณที่เพิ่มเพื่อนนายบุ้นหลีครับ หลังสร้างออเดอร์แล้ว ส่งเลขออเดอร์ เช่น NB-20260626-001 มาในแชทนี้ เพื่อให้ร้านแจ้งกลับเมื่ออาหารพร้อมครับ",
    );
    return;
  }

  if (event.type !== "message" || event.message?.type !== "text" || !userId) {
    return;
  }

  const orderId = findOrderId(event.message.text);
  if (!orderId) {
    await reply(env, replyToken, "กรุณาส่งเลขออเดอร์ เช่น NB-20260626-001 เพื่อรับแจ้งเตือนเมื่ออาหารพร้อมครับ");
    return;
  }

  const linked = await patchOrder(env, orderId, {
    lineUserId: userId,
    lineLinkedAt: new Date().toISOString(),
    lineStatus: "linked",
    updatedAt: new Date().toISOString(),
  });

  await reply(
    env,
    replyToken,
    linked
      ? `ผูก LINE กับออเดอร์ ${orderId} เรียบร้อยครับ ถ้าอาหารพร้อมแล้ว ร้านจะแจ้งกลับทาง LINE นี้ครับ`
      : `ยังผูก LINE กับออเดอร์ ${orderId} ไม่สำเร็จ กรุณาตรวจเลขออเดอร์อีกครั้งครับ`,
  );
}

export async function onRequestPost(context) {
  const env = context.env || {};
  const rawBody = await context.request.text();
  const signature = context.request.headers.get("x-line-signature");
  const verified = await verifyLineSignature(rawBody, signature, env.LINE_CHANNEL_SECRET);

  if (!verified) {
    return json({ ok: false, message: "Invalid LINE signature." }, 401);
  }

  const body = JSON.parse(rawBody || "{}");
  const events = Array.isArray(body.events) ? body.events : [];

  await Promise.all(events.map((event) => handleEvent(env, event)));

  return json({ ok: true });
}

export async function onRequestGet() {
  return json({
    ok: true,
    message: "LINE webhook endpoint is ready. Configure this URL in LINE Official Account Manager.",
  });
}
