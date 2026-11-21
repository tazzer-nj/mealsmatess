export function renderErrorPage(options?: {
  status?: number;
  title?: string;
  message?: string;
}): string {
  const status = options?.status ?? 500;
  const title =
    options?.title ??
    (status === 503
      ? "MealMate is taking a quick breather"
      : status === 404
        ? "We couldn't find that kitchen page"
        : "Something went wrong in the kitchen");
  const message =
    options?.message ??
    (status === 503
      ? "Our kitchen servers are catching up right now. Your saved recipes, pantry, and meal plans are safe."
      : status === 404
        ? "That link may have moved or expired. Head back home to continue cooking."
        : "We hit an unexpected bump loading this page. Your saved data is safe—try refreshing or head home.");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title} · MealMate</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#fcfcfb" />
    <style>
      :root {
        --bg: #fcfcfb;
        --card: #f5f7f3;
        --border: #dfe7da;
        --ink: #17231b;
        --muted: #526256;
        --accent: #3d8b40;
        --accent-ink: #ffffff;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #0e110f;
          --card: #161b18;
          --border: #27302a;
          --ink: #f3f6f4;
          --muted: #a5b4aa;
          --accent: #68b86a;
          --accent-ink: #0e110f;
        }
      }
      * { box-sizing: border-box; }
      body {
        font: 15px/1.6 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: var(--bg);
        color: var(--ink);
        display: grid;
        place-items: center;
        min-height: 100vh;
        margin: 0;
        padding: 1.5rem;
      }
      .card {
        max-width: 30rem;
        width: 100%;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 1.25rem;
        padding: 2rem;
        text-align: center;
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        font-size: 0.875rem;
        color: var(--accent);
        margin-bottom: 1rem;
      }
      .code {
        font-size: 0.75rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
        margin-bottom: 0.35rem;
      }
      h1 {
        font-size: 1.4rem;
        line-height: 1.25;
        font-weight: 600;
        margin: 0 0 0.75rem;
      }
      p {
        color: var(--muted);
        margin: 0 0 1.5rem;
        font-size: 0.9375rem;
      }
      .actions {
        display: flex;
        gap: 0.625rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      a, button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0.625rem 1.125rem;
        border-radius: 0.75rem;
        font: inherit;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        text-decoration: none;
        border: 1px solid transparent;
      }
      .primary {
        background: var(--accent);
        color: var(--accent-ink);
      }
      .secondary {
        background: var(--bg);
        color: var(--ink);
        border-color: var(--border);
      }
      .support {
        margin-top: 1.25rem;
        font-size: 0.8125rem;
        color: var(--muted);
      }
      .support a {
        min-height: auto;
        padding: 0;
        color: var(--accent);
        border: none;
        display: inline;
      }
    </style>
  </head>
  <body>
    <main class="card" role="main">
      <div class="brand">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M12 3a6 6 0 0 0-6 6c0 1.8.8 3.4 2 4.5V19a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-5.5c1.2-1.1 2-2.7 2-4.5a6 6 0 0 0-6-6Z"/>
          <path d="M8 15h8"/>
        </svg>
        <span>MealMate · Discover. Plan. Eat. Enjoy.</span>
      </div>
      <div class="code">Status ${status}</div>
      <h1>${title}</h1>
      <p>${message}</p>
      <div class="actions">
        <button class="primary" type="button" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Back to MealMate</a>
      </div>
      <div class="support">
        Need help? <a href="/support">Visit Help Center</a>
      </div>
    </main>
  </body>
</html>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function renderErrorResponse(
  request: Request,
  options?: {
    status?: number;
    code?: string;
    title?: string;
    message?: string;
  },
): Response {
  const status = options?.status ?? 500;
  const code =
    options?.code ??
    (status === 404
      ? "NOT_FOUND"
      : status === 503
        ? "SERVICE_UNAVAILABLE"
        : "INTERNAL_SERVER_ERROR");
  const title = options?.title ?? "Something went wrong in the kitchen";
  const message = options?.message ?? "Please try again shortly.";
  const accept = (request.headers.get("accept") ?? "").toLowerCase();

  if (accept.includes("application/json")) {
    return new Response(JSON.stringify({ error: code, status, title, message }), {
      status,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  if (accept.includes("application/xml") || accept.includes("text/xml")) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<error>\n  <status>${status}</status>\n  <code>${escapeXml(code)}</code>\n  <title>${escapeXml(title)}</title>\n  <message>${escapeXml(message)}</message>\n</error>`;
    return new Response(xml, {
      status,
      headers: { "content-type": "application/xml; charset=utf-8" },
    });
  }

  if (accept.includes("text/plain") && !accept.includes("text/html")) {
    return new Response(`MealMate Error (${status} ${code}): ${title} — ${message}`, {
      status,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(renderErrorPage({ status, title, message }), {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
