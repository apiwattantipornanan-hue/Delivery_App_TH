const EASYSLIP_ENDPOINT = "https://api.easyslip.com/v2/verify/bank";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function closeMoney(left, right) {
  return Math.abs(toNumber(left) - toNumber(right)) < 0.01;
}

function publicError(error) {
  if (!error) return "Verification failed.";
  if (typeof error === "string") return error;
  return error.message || "Verification failed.";
}

function manualFallback(reason) {
  return {
    status: "manual",
    message: reason,
    verification: {
      provider: "manual",
      verified: false,
      reason,
    },
  };
}

function makeDecision(normalized, expectedAmount) {
  if (normalized.status === "manual" || normalized.status === "unconfigured") {
    return manualFallback(normalized.message || "Slip verifier is not configured yet.");
  }

  if (!normalized.ok) {
    return {
      status: normalized.reject ? "rejected" : "needs_manual_check",
      message: normalized.message || "Slip could not be verified automatically.",
      verification: normalized,
    };
  }

  if (normalized.duplicate) {
    return {
      status: "rejected",
      message: "This slip was already used before.",
      verification: normalized,
    };
  }

  if (normalized.amountMatched === false || !closeMoney(normalized.amount, expectedAmount)) {
    return {
      status: "needs_manual_check",
      message: "Slip amount does not match the order amount.",
      verification: normalized,
    };
  }

  if (normalized.accountMatched === false) {
    return {
      status: "needs_manual_check",
      message: "Receiver account does not match the registered shop account.",
      verification: normalized,
    };
  }

  return {
    status: "verified",
    message: "Payment verified successfully.",
    verification: normalized,
  };
}

async function verifyEasySlip({ env, file, orderId, expectedAmount }) {
  if (!env.EASYSLIP_API_KEY) {
    return {
      status: "unconfigured",
      message: "EasySlip API key is not configured.",
    };
  }

  const body = new FormData();
  body.append("image", file, file.name || "payment-slip.jpg");
  body.append("remark", orderId);
  body.append("matchAccount", "true");
  body.append("matchAmount", String(expectedAmount));
  body.append("checkDuplicate", "true");

  const response = await fetch(EASYSLIP_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.EASYSLIP_API_KEY}`,
    },
    body,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const code = data?.error?.code;
    return {
      provider: "easyslip",
      ok: false,
      reject: code === "SLIP_NOT_FOUND" || code === "VALIDATION_ERROR",
      message: data?.error?.message || `EasySlip verification failed (${response.status}).`,
      rawCode: code || String(response.status),
    };
  }

  const slip = data.data || {};
  const rawSlip = slip.rawSlip || {};

  return {
    provider: "easyslip",
    ok: true,
    duplicate: Boolean(slip.isDuplicate),
    accountMatched: slip.matchedAccount ? true : false,
    amount: toNumber(slip.amountInSlip || rawSlip.amount?.amount || rawSlip.amount?.local?.amount),
    amountMatched: typeof slip.isAmountMatched === "boolean" ? slip.isAmountMatched : undefined,
    transRef: rawSlip.transRef || null,
    transferredAt: rawSlip.date || null,
    receiverName: rawSlip.receiver?.account?.name?.th || rawSlip.receiver?.account?.name?.en || null,
    senderName: rawSlip.sender?.account?.name?.th || rawSlip.sender?.account?.name?.en || null,
    rawCode: "OK",
  };
}

async function verifySlipOk({ env, file, orderId, expectedAmount }) {
  if (!env.SLIPOK_API_KEY || !env.SLIPOK_API_URL) {
    return {
      status: "unconfigured",
      message: "SlipOK API key or API URL is not configured.",
    };
  }

  const body = new FormData();
  body.append("files", file, file.name || "payment-slip.jpg");
  body.append("amount", String(expectedAmount));
  body.append("log", "true");
  body.append("remark", orderId);

  if (env.SLIPOK_BRANCH_ID) {
    body.append("branchId", env.SLIPOK_BRANCH_ID);
  }

  const authHeader = env.SLIPOK_AUTH_HEADER || "Authorization";
  const authValue =
    env.SLIPOK_AUTH_SCHEME === "raw" ? env.SLIPOK_API_KEY : `Bearer ${env.SLIPOK_API_KEY}`;

  const response = await fetch(env.SLIPOK_API_URL, {
    method: "POST",
    headers: {
      [authHeader]: authValue,
    },
    body,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false || data.status === false) {
    return {
      provider: "slipok",
      ok: false,
      reject: response.status === 400 || response.status === 404,
      message: data?.message || data?.error || `SlipOK verification failed (${response.status}).`,
      rawCode: data?.code || String(response.status),
    };
  }

  const payload = data.data || data;
  const amount =
    payload.amount ||
    payload.amountInSlip ||
    payload.slip?.amount ||
    payload.transAmount ||
    payload.transferAmount;
  const duplicate =
    payload.isDuplicate ||
    payload.duplicate ||
    payload.is_duplicate ||
    payload.slip_duplicate;
  const transRef =
    payload.transRef ||
    payload.trans_ref ||
    payload.ref ||
    payload.referenceNo ||
    payload.transactionId ||
    payload.slip?.transRef;

  return {
    provider: "slipok",
    ok: true,
    duplicate: Boolean(duplicate),
    accountMatched: payload.matchedAccount === false ? false : undefined,
    amount: toNumber(amount),
    amountMatched: closeMoney(amount, expectedAmount),
    transRef: transRef || null,
    transferredAt: payload.date || payload.transDate || payload.transferDate || null,
    receiverName: payload.receiver?.name || payload.receiverName || null,
    senderName: payload.sender?.name || payload.senderName || null,
    rawCode: "OK",
  };
}

export async function onRequestPost(context) {
  const form = await context.request.formData();
  const orderId = String(form.get("orderId") || "").trim();
  const expectedAmount = toNumber(form.get("expectedAmount"));
  const slip = form.get("slip");

  if (!orderId || !expectedAmount || !slip || typeof slip === "string") {
    return json(
      {
        status: "rejected",
        message: "Missing order ID, expected amount, or slip image.",
      },
      400,
    );
  }

  const env = context.env || {};
  const provider = String(env.PAYMENT_VERIFIER_PROVIDER || "slipok").toLowerCase();
  const input = { env, file: slip, orderId, expectedAmount };

  try {
    const normalized =
      provider === "easyslip" ? await verifyEasySlip(input) : await verifySlipOk(input);
    const decision = makeDecision(normalized, expectedAmount);
    return json({
      ...decision,
      orderId,
      provider,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return json(
      {
        status: "needs_manual_check",
        message: publicError(error),
        orderId,
        provider,
        checkedAt: new Date().toISOString(),
      },
      502,
    );
  }
}

export async function onRequestGet() {
  return json({
    ok: true,
    message: "Slip verification endpoint is ready. Use POST with orderId, expectedAmount, and slip.",
  });
}
