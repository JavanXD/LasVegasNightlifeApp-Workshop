
# Challenge 3: Leveraging `strict-dynamic` for Modern Script Management

## Objective
Use the `strict-dynamic` directive in CSP to enable trusted dynamically loaded scripts while blocking untrusted ones. This challenge will highlight how `strict-dynamic` simplifies script management in modern applications and ensures security without requiring an exhaustive list of trusted domains.

---

## Scenario

Your Las Vegas Nightlife App includes a trusted Bootstrap script embedded using a static `<script>` tag. For demonstration purposes, you will modify this setup to dynamically load Bootstrap via JavaScript. This setup allows you to explore how `strict-dynamic` propagates trust in dynamically loaded scripts and simplifies CSP management.

---

## Preparation

If you completed Challenge 2, your CSP may currently look like one of the following:

### Case A: Completed Challenge 2 Successfully
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-unique123' 'sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self'; img-src 'self' data:;
```

### Case B: Did Not Fully Complete Challenge 2
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self'; img-src 'self' data:;
```

Both CSP configurations are valid starting points for Challenge 3.

---

## Steps

### Step 1: Modify the Bootstrap Script Setup

#### Original Setup
The Bootstrap script is currently embedded statically:
```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

#### Updated Setup for Demo
Replace the static `<script>` tag with a dynamically loaded script. You need to place this script at the end of the HTML file before the `</body>` tag.
```html
<script nonce="unique123">
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
    document.body.appendChild(script);
</script>
```

This modification mimics real-world applications where scripts are dynamically loaded, helping to demonstrate the effectiveness of `strict-dynamic`.

---

### Step 2: Apply `strict-dynamic`

Update the CSP to replace the static whitelist with `strict-dynamic`. 

Steps that you need to apply to your existing CSP:
- Remove any `'sha384-...'` hashes or static domain whitelists from `script-src`.
- Retain the `nonce` to bootstrap trust propagation.

Your updated CSP will look like: 
```http
Content-Security-Policy: default-src 'self'; script-src 'strict-dynamic' 'nonce-unique123'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self'; img-src 'self' data:;
```

---

### Step 3: Test the Updated CSP

1. Load the page with the updated CSP and the dynamically loaded Bootstrap script.
2. Verify that the Bootstrap script is successfully loaded and functional.
3. Optionally, inspect the browser's developer tools to confirm the CSP violations and ensure only trusted scripts are loaded.

---

## Expected Outcome

1. The dynamically loaded Bootstrap script is executed successfully because the initial trusted script includes a valid `nonce`.
2. Any other dynamically added scripts (without valid nonces or hashes) will be blocked by the browser, even if they originate from previously whitelisted domains.

---

## Lessons Learned

1. **Simplifying Script Management**:
   - `strict-dynamic` eliminates the need for exhaustive domain whitelists, reducing the risk of supply chain attacks.

2. **Trust Propagation**:
   - Dynamically added scripts inherit the trust of the parent script only if the parent script is explicitly trusted via a `nonce` or `hash`.

3. **Blocking Untrusted Scripts**:
   - Scripts without valid nonces or hashes are blocked, even if they come from previously trusted sources.

4. **Modern Web Security**:
   - `strict-dynamic` is particularly effective for applications with dynamic imports or frequent use of third-party libraries.

---

## Further Resources
- [web.dev - Mitigate cross-site scripting (XSS) with a strict Content Security Policy (CSP)](https://web.dev/articles/strict-csp)
- [MDN Web Docs - Content-Security-Policy sript-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#strict-dynamic)
- [caniuse - strict-dynamic](https://caniuse.com/?search=strict-dynamic)