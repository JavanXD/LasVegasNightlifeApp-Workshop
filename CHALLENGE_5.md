# Challenge 5: Clickjacking Prevention with `X-Frame-Options` and CSP

## Objective
Prevent visual clickjacking attacks using `X-Frame-Options` and `Content-Security-Policy` (`frame-ancestors`) headers.

---

## Attack Scenario

### Malicious Clickjacking Page
The attacker hosts the following malicious page to perform a clickjacking attack on the application:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>evil-site.com</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            position: relative;
        }

        iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 1024px; /* Fixed width for iframe */
            height: 768px; /* Fixed height for iframe */
            border: none;
            opacity: 0.1; /* Make the iframe nearly invisible */
            z-index: 1; /* Ensure iframe is above fake content */
        }

        .fake-button {
            position: absolute;
            top: 360px; /* Match the real button's position in iframe */
            left: 80px; /* Match the real button's position in iframe */
            z-index: 2; /* Ensure fake button is above iframe */
            background: red;
            color: white;
            padding: 20px;
            font-size: 18px;
            cursor: pointer;
            pointer-events: none; /* Make this button unclickable */
        }
    </style>
</head>
<body>
    <h1 style="text-align: center;">evil-site.com Malicious Page</h1>
    <p style="text-align: center;">This is a simulated clickjacking attack. Below is an invisible iframe attempting to capture user interaction.</p>
    <div class="fake-button">Click Me</div>
    <iframe src="http://localhost:3000"></iframe>
</body>
</html>
```
(see [`attacks/attack-clickjacking.html`](./attacks/attack-clickjacking.html))

### Steps to Reproduce
1. Open the malicious page file [`attacks/attack-clickjacking.html`](./attacks/attack-clickjacking.html) in a browser.
2. Visit the malicious page while your Las Vegas Nightlife App is running on `http://localhost:3000`.
3. Interact with the fake button on the malicious page.
   - The iframe overlaps the fake button, capturing clicks intended for the real application.

---

## Protection Steps

### Step 1: Add `X-Frame-Options` Header
Use the `X-Frame-Options` header to control how your page can be embedded in iframes:

#### Example: Secure Header
```javascript
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Allow embedding only from the same origin
    next();
});
```
- **`SAMEORIGIN`**: Allows embedding only on pages from the same origin.
- **`DENY`**: Disallows embedding in any frame.

### Step 2: Use `Content-Security-Policy` with `frame-ancestors`
For more granular control over iframe embedding, use the `frame-ancestors` directive in your CSP:

#### Example: CSP Header
```javascript
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self';"); // Allow embedding only from the same origin
    next();
});
```
- **`'self'`**: Allows embedding only from the same origin.
- **Specific domains**: Specify trusted domains (e.g., `frame-ancestors 'self' https://trusted.com;`).

---

### Step 3: Retest the Attack
1. Reload the malicious page (`attack-clickjacking.html`).
2. Verify that:
   - The iframe fails to load the Las Vegas Nightlife App.
   - Browser developer tools show an error indicating the page cannot be embedded due to `X-Frame-Options` or CSP.


## Discussion: Scaling and Application to Legacy vs. New Applications

### Scaling Across Multiple Applications
- **Centralized Enforcement**:
   - Use a reverse proxy (e.g., Nginx, Apache) or an API gateway to enforce `X-Frame-Options` and CSP headers across all applications.
   - Define header rules globally to ensure consistency.

- **Challenges**:
   - Legacy systems may rely on iframe embedding for certain workflows.
   - Refactoring to remove iframe dependencies can be time-intensive.

- **Incremental Implementation**:
   - Start with `Report-Only` mode for CSP to identify potential issues without breaking functionality.
   - Gradually refactor workflows to eliminate reliance on iframe embedding.

- **Fallback**:
   - Use `X-Frame-Options` (`DENY`) for critical pages while allowing selective iframe embedding via CSP for less sensitive workflows.
