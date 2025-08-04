# Challenge 2: Starting with an Insecure CSP and Migrating to a Secure One

## Scenario
Your application has a Content-Security-Policy (CSP) that prioritises functionality over security. Unfortunately, this CSP allows XSS attacks because it uses unsafe directives. Your task is to evaluate the CSP, identify its weaknesses, and incrementally improve it to secure the application.

### Current CSP
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self'; img-src 'self' data:;
```

### What It Does
- **`default-src 'self'`**:
  - Restricts all unspecified resource types to the same origin.
- **`script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net`**:
  - Allows inline scripts (e.g., `<script>` tags and `onerror` attributes), enabling potential XSS attacks.
  - Allows scripts from the trusted CDN `https://cdn.jsdelivr.net` (used for Bootstrap).
- **`style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net`**:
  - Allows inline styles and stylesheets from the trusted CDN.
- **`connect-src 'self'`**:
  - Restricts `fetch` and XHR requests to the same origin.
- **`img-src 'self' data:`**:
  - Allows images from the same origin and inline images encoded as `data:` URLs.

---

## Steps

### Step 1: Test the Insecure CSP
1. Evaluate the current CSP using [Google's CSP Evaluator](https://csp-evaluator.withgoogle.com/):
   - Paste the insecure CSP into the tool and review the results.
2. Submit the following XSS payload into the **Name** field in the VIP Guest List form:
   ```html
   <img src="#" onerror="console.log('XSS triggered via onerror'); document.body.style.backgroundColor = 'orange';" alt="XSS1">
   ```
3. **Expected Outcome**:
   - The payload executes successfully because the CSP allows inline scripts (`'unsafe-inline'`).

---

### Step 2: Introduce Nonces for Inline Scripts
1. Update the CSP to include a nonce:
   ```http
   Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-unique123' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self'; img-src 'self' data:;
   ```
2. Modify legitimate inline scripts in your HTML to include the nonce:
   ```html
   <script nonce="unique123">
       console.log('This script is allowed because it has a nonce!');
   </script>
   ```
3. Retest the XSS payload:
   ```html
   <img src="#" onerror="console.log('XSS triggered via onerror'); document.body.style.backgroundColor = 'orange';" alt="XSS1">
   ```
4. **Expected Outcome**:
   - The XSS payload fails because inline scripts without the required nonce are blocked by the CSP.

---

### Step 3: Enforce Subresource Integrity (SRI)
1. Calculate the SRI hash for the external script (e.g., Bootstrap):
   - Use the following bash command:
     ```bash
     openssl dgst -sha384 -binary bootstrap.bundle.min.js | openssl base64 -A
     ```
   - Alternatively, use the online tool [SRI Hash Generator](https://www.srihash.org/).
2. Update the `<script>` tag to include the `integrity` attribute:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" 
           integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" 
           crossorigin="anonymous"></script>
   ```
3. Update the CSP to enforce the SRI hash:
   ```http
   Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-unique123' 'sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self'; img-src 'self' data:;
   ```
4. Retest the application and verify that external scripts without the correct SRI hash are blocked.

---

## Lessons Learned
1. **Start with Compatibility**:
   - `'unsafe-inline'` allows inline scripts but leaves the application vulnerable to XSS.
   - Incrementally removing insecure directives makes the transition smoother.

2. **Introduce Nonces**:
   - Nonces allow secure inline scripts while blocking unauthorised ones.

3. **Use SRI for External Scripts**:
   - SRI ensures that only authorised, untampered scripts are executed.

4. **Gradually Harden the CSP**:
   - Begin with an insecure CSP for compatibility.
   - Incrementally replace `'unsafe-inline'` with nonces.
   - Use SRI to secure external resources.

---

### Bonus Challenge 2.1 (optional): Evaluating External Scripts from jsdelivr.net

#### Step 4: The Risk of Hosting JavaScript on jsdelivr.net

Your page currently includes a script hosted on jsdelivr.net for Bootstrap functionality:

```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

#### Task
1. **Evaluate the Risks**:
   - Why is hosting JavaScript on an external CDN (like jsdelivr.net) considered unsafe?
   - What can be done to mitigate the risks associated with external scripts?

#### Answer
1. **Why It's Unsafe**:
   - **Trust Dependency**:
     - The page relies on the integrity of jsdelivr.net to serve unmodified and secure versions of the script. If the CDN is compromised or serves malicious content, your application is vulnerable to attacks.
   - **No Control Over Updates**:
     - The script might change without notice, potentially introducing vulnerabilities or breaking functionality.
   - **Man-in-the-Middle (MITM) Attacks**:
     - Although HTTPS mitigates most MITM risks, a misconfigured or compromised CDN could still serve malicious scripts.

2. **Mitigation Strategies**:
   - **Subresource Integrity (SRI)**:
     - Use SRI to ensure that only the exact version of the script you trust is executed.
     - Example with SRI:
       ```html
       <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" 
               integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" 
               crossorigin="anonymous"></script>
       ```
       - The `integrity` attribute ensures the browser checks the hash of the script before executing it. If the script is modified, it won't run.

   - **Self-Hosting the Script**:
     - Download and host the script locally on your server.
     - Example:
       ```html
       <script src="/assets/bootstrap.bundle.min.js"></script>
       ```
     - This approach eliminates dependency on an external source.

   - **Content-Security-Policy (CSP)**:
     - Combine SRI with a strict CSP that limits external script execution to trusted sources:
       ```http
       Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-unique123' https://cdn.jsdelivr.net 'sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self'; img-src 'self' data:;
       ```

#### Reflection
- Hosting JavaScript on external CDNs introduces a **supply chain risk** that must be carefully managed.
- Always use **SRI** and consider **self-hosting** critical dependencies to retain full control over the code running on your application.
- External CDNs like jsdelivr.net introduce a trust dependency.
- Mitigate risks by using SRI, strict CSPs, or self-hosting scripts.

---

## Further Resources
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [MDN Web Docs - Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [Web.dev - Security headers quick reference](https://web.dev/articles/security-headers#csp)
