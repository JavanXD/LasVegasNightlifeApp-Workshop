# Challenge 7: Deploying CSP in Report-Only Mode in Production Safely

## 🎯 Objective

Help teams safely deploy a CSP using `Content-Security-Policy-Report-Only` in production environments without breaking existing functionality.

---

## ❓ Why Use Report-Only in Production?

- ✅ No disruption to users — does **not block** anything.
- 👀 Provides **visibility** into unsafe content practices.
- 🛠️ Enables **incremental policy enforcement**.
- 🔍 Helps identify third-party dependencies and risky script sources.

---

## ✅ Best Practices for Production Deployment

### Example Header

```
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self'; report-uri /csp-report;
```

### Recommendations

- Don’t enforce too early — monitor first.
- Whitelist domains carefully (e.g., CDNs, analytics).
- Keep `report-uri` or `report-to` endpoints fast and reliable.

---

## 💡 Example Use Cases

- Audit inline scripts before introducing a nonce-based policy.
- Monitor CSP violations across legacy apps or multiple SPAs.

---

## 🔁 How to Iterate Safely

1. Start with a relaxed policy (`'self'`, known CDNs).
2. Watch for noise from browser extensions.
3. Use dashboards or filters to triage real issues.
4. Gradually lock down — page by page, route by route.


