(function () {
  const refreshConfig = window.APP_CONFIG?.dailyPageRefresh;

  if (!refreshConfig?.enabled || !refreshConfig.time) {
    return;
  }

  const [hour, minute] = String(refreshConfig.time).split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return;
  }

  function nextRefreshAt() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(hour, minute, 0, 0);

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }

  function scheduleRefresh() {
    const target = nextRefreshAt();
    const delay = target.getTime() - Date.now();

    window.setTimeout(() => {
      window.location.reload();
    }, delay);
  }

  scheduleRefresh();
})();
