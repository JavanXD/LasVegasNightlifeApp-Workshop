# Challenge 7: Deploying CSP in Report-Only Mode in Production Safely

## Objective

Help product engineering teams safely deploy a CSP using `Content-Security-Policy-Report-Only` in production environments without breaking existing functionality.

---

## Why Use Report-Only in Production?

- No disruption to users - does **not block** anything.
- Provides central **visibility** into unsafe content practices, across services, marketing sites, etc.
- Enables **incremental policy enforcement**, reducing violation reports over time by incrementally adding whitelisted sources.
- Helps identify third-party dependencies and risky script sources, e.g. (where in my application stack is polyfills.io being used?).

---

## Best Practices for Production Deployment

### Example Header

Start with a strong CSP to report all violations (catch all) without enforcing them:
```
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self'; report-uri /csp-report;
```

### Recommendations

- Don’t enforce too early, monitor first.
- Whitelist domains carefully (e.g., CDNs, analytics).
- If you add new third party URLs: Verify whitelisted domains against csp evaluator, to verify that the CDN cannot host malicious third parties, or use subresource integrity (SRI) for added security.
- Keep `report-uri` or `report-to` endpoints fast and reliable.

---

## How to Iterate Safely

1. Start with a relaxed policy (`'self'`, known CDNs).
2. Watch for noise from browser extensions.
3. Use dashboards or filters to triage real issues.
4. Gradually lock down: Page by page, route by route.


