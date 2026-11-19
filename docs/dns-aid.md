# DNS for AI Discovery (DNS-AID) Configuration

DNS-AID records (`SVCB` / `HTTPS`) and DNSSEC signatures must be published in your domain's authoritative DNS zone (for example, Cloudflare DNS) because HTTP application servers cannot serve DNS resource records directly.

## Recommended DNS Zone Records (`mealsmates.site`)

```dns
; DNS-AID Agent Index (discovery directory)
_index._agents.mealsmates.site. 3600 IN HTTPS 1 mealsmates.site. alpn="h2,h3" port=443 key65400="https://mealsmates.site/.well-known/agent-card.json"

; A2A Agent Endpoint
_a2a._agents.mealsmates.site.   3600 IN SVCB  1 mealsmates.site. alpn="a2a,h2" port=443 mandatory=alpn,port key65400="https://mealsmates.site/.well-known/agent-card.json"

; MCP Streamable HTTP Endpoint
_mcp._agents.mealsmates.site.   3600 IN SVCB  1 mealsmates.site. alpn="mcp,h2" port=443 mandatory=alpn,port key65400="https://mealsmates.site/.well-known/mcp/server-card.json"
```

## DNSSEC

1. Enable **DNSSEC** in your DNS provider (e.g., Cloudflare Dashboard → DNS → Settings → Enable DNSSEC).
2. Add the generated `DS` record at your domain registrar so validating DoH resolvers (`cloudflare-dns.com`, `dns.google`) return `AD: true`.
