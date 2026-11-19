export type ErrorPageOptions = {
  status?: number;
  code?: string;
  title?: string;
  message?: string;
  path?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeXml(value: string): string {
  return escapeHtml(value);
}

export function renderErrorPage(options: ErrorPageOptions = {}): string {
  const status = options.status ?? 500;
  const code = escapeHtml(options.code ?? "INTERNAL_SERVER_ERROR");
  const title = escapeHtml(options.title ?? "This page didn't load");
  const message = escapeHtml(
    options.message ??
      "Something unexpected happened in our kitchen. Try refreshing the page or head back home.",
  );
  const pathNote = options.path ? ` · ${escapeHtml(options.path)}` : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title} · MealMate</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <style>
      :root { color-scheme: light dark; }
      body {
        font: 15px/1.6 "Manrope", system-ui, -apple-system, sans-serif;
        background: #fafaf7;
        color: #13341b;
        display: grid;
        place-items: center;
        min-height: 100vh;
        margin: 0;
        padding: 1.5rem;
      }
      @media (prefers-color-scheme: dark) {
        body { background: #101511; color: #f3f5f0; }
        .card { background: #171e18; border-color: rgba(255, 255, 255, 0.12); }
        .muted, p { color: #a7b3a9; }
        .secondary { background: #202a22; color: #f3f5f0; border-color: rgba(255, 255, 255, 0.16); }
      }
      .card {
        max-width: 30rem;
        width: 100%;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 1.25rem;
        padding: 2.25rem 2rem;
        text-align: center;
        box-shadow: 0 12px 36px -20px rgba(19, 52, 27, 0.25);
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        font-size: 0.95rem;
        margin-bottom: 1.25rem;
      }
      .dot { color: #2f7d44; }
      .badge {
        display: inline-block;
        padding: 0.2rem 0.65rem;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        background: #edf3e9;
        color: #1f5c31;
        margin-bottom: 0.85rem;
      }
      h1 { font-size: 1.45rem; line-height: 1.25; margin: 0 0 0.6rem; letter-spacing: -0.02em; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.6rem; justify-content: center; flex-wrap: wrap; }
      a, button {
        padding: 0.65rem 1.15rem;
        border-radius: 0.75rem;
        font: inherit;
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        text-decoration: none;
        border: 1px solid transparent;
      }
      .primary { background: #13341b; color: #ffffff; }
      .secondary { background: #ffffff; color: #13341b; border-color: #d1d5db; }
      .muted { margin-top: 1.25rem; font-size: 0.75rem; color: #6b7280; }
    </style>
  </head>
  <body>
    <main class="card" role="main">
      <div class="brand">MealMate<span class="dot">.</span></div>
      <div><span class="badge">HTTP ${status} · ${code}</span></div>
      <h1>${title}</h1>
      <p>${message}</p>
      <div class="actions">
        <button type="button" class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
        <a class="secondary" href="/support">Support</a>
      </div>
      <div class="muted">MealMate by Taz Technologies${pathNote}</div>
    </main>
  </body>
</html>`;
}

export function renderErrorResponse(
  request: Request,
  options: Required<Pick<ErrorPageOptions, "status" | "code" | "title" | "message">>,
): Response {
  const url = new URL(request.url);
  const accept = (request.headers.get("accept") ?? "").toLowerCase();
  const baseHeaders = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };

  const wantsHtml =
    accept.includes("text/html") ||
    (!accept.includes("application/json") &&
      !accept.includes("application/xml") &&
      !accept.includes("text/xml") &&
      !accept.includes("text/plain") &&
      !url.pathname.startsWith("/api/"));

  if (wantsHtml) {
    const html = renderErrorPage({ ...options, path: url.pathname });
    return new Response(request.method === "HEAD" ? null : html, {
      status: options.status,
      headers: { ...baseHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (accept.includes("application/xml") || accept.includes("text/xml")) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <status>${options.status}</status>
  <code>${escapeXml(options.code)}</code>
  <title>${escapeXml(options.title)}</title>
  <message>${escapeXml(options.message)}</message>
  <path>${escapeXml(url.pathname)}</path>
</error>`;
    return new Response(request.method === "HEAD" ? null : xml, {
      status: options.status,
      headers: { ...baseHeaders, "Content-Type": "application/xml; charset=utf-8" },
    });
  }

  if (accept.includes("text/plain") && !accept.includes("application/json")) {
    const text = `MealMate Error (${options.status} ${options.code})\n${options.title}: ${options.message}\nPath: ${url.pathname}\n`;
    return new Response(request.method === "HEAD" ? null : text, {
      status: options.status,
      headers: { ...baseHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const payload = {
    error: options.code,
    status: options.status,
    title: options.title,
    message: options.message,
    path: url.pathname,
  };
  return new Response(request.method === "HEAD" ? null : JSON.stringify(payload), {
    status: options.status,
    headers: { ...baseHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}
