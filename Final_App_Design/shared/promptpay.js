(function () {
  function formatField(id, value) {
    const text = String(value);
    return `${id}${String(text.length).padStart(2, "0")}${text}`;
  }

  function crc16Ccitt(payload) {
    let crc = 0xffff;

    for (let i = 0; i < payload.length; i += 1) {
      crc ^= payload.charCodeAt(i) << 8;

      for (let bit = 0; bit < 8; bit += 1) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xffff;
      }
    }

    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  function normalizePromptPayId(promptPayId) {
    const raw = String(promptPayId || "").replace(/[^0-9]/g, "");

    if (raw.length === 10 && raw.startsWith("0")) {
      return `0066${raw.slice(1)}`;
    }

    return raw;
  }

  function buildPromptPayPayload(promptPayId, amount) {
    const target = normalizePromptPayId(promptPayId);
    const merchantAccount = [
      formatField("00", "A000000677010111"),
      formatField("01", target),
    ].join("");

    const body = [
      formatField("00", "01"),
      formatField("01", "11"),
      formatField("29", merchantAccount),
      formatField("53", "764"),
      formatField("54", Number(amount).toFixed(2)),
      formatField("58", "TH"),
    ].join("");

    const withCrcHeader = `${body}6304`;
    return `${withCrcHeader}${crc16Ccitt(withCrcHeader)}`;
  }

  async function renderQr(canvas, payload) {
    if (window.QRCode?.toCanvas) {
      await window.QRCode.toCanvas(canvas, payload, {
        width: 230,
        margin: 1,
        color: {
          dark: "#111111",
          light: "#ffffff",
        },
      });
      return true;
    }

    if (window.qrcode) {
      const qr = window.qrcode(0, "M");
      qr.addData(payload);
      qr.make();

      const ctx = canvas.getContext("2d");
      const moduleCount = qr.getModuleCount();
      const size = canvas.width;
      const margin = 14;
      const cellSize = (size - margin * 2) / moduleCount;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#111111";

      for (let row = 0; row < moduleCount; row += 1) {
        for (let col = 0; col < moduleCount; col += 1) {
          if (qr.isDark(row, col)) {
            ctx.fillRect(
              Math.round(margin + col * cellSize),
              Math.round(margin + row * cellSize),
              Math.ceil(cellSize),
              Math.ceil(cellSize),
            );
          }
        }
      }

      return true;
    }

    return false;
  }

  window.PromptPayTools = {
    buildPromptPayPayload,
    renderQr,
  };
})();
