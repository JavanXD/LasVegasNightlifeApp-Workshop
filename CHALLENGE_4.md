# Challenge 4: Retrofitting Trusted Types for DOM-Based XSS

## Objective
Apply Trusted Types to prevent DOM-based XSS in a legacy JavaScript-heavy application.

---

## Part I: Identify Vulnerabilities Using Trusted Types

### Step 1: Set Trusted Types Header in Reporting Mode

Enable Trusted Types in reporting mode to fetch a list of XSS-prone DOM operators in the browser console.

- **Option 1: Set in the application code:**
  ```javascript
  app.use((req, res, next) => {
      // Add Trusted Types in Reporting mode (see browser console output)
      res.setHeader(
          'Content-Security-Policy-Report-Only',
          "require-trusted-types-for 'script';"
      );
      next();
  });
  ```

- **Option 2: Set in the HTML (`index.html`) directly:**
  ```html
  <meta http-equiv="Content-Security-Policy-Report-Only" content="require-trusted-types-for 'script';">
  ```

#### **Note**:
- This step works in Chrome and Edge only. Refer to [caniuse](https://caniuse.com/?search=require-trusted-types-for) for browser support.
- Optional: Use the [polyfill](https://github.com/w3c/trusted-types) to enable Trusted Types in other browsers (e.g., Safari, Firefox).

### Step 2: Monitor Console Logs

- The browser console will display warnings about unsafe DOM manipulations. Look for logs like:
  ```plaintext
  Uncaught TypeError: Failed to set the 'innerHTML' property on 'Element': This document requires 'Trusted Types' assignment.
  ```

- Use these logs to identify insecure JavaScript APIs like `innerHTML`, `outerHTML`, `document.write`, and `eval`.

---

## Part II: Detect Vulnerabilities Using Semgrep and Custom Scripts

### Step 3: Scan the Codebase

Use custom scripts and Semgrep rules to detect unsafe patterns in the codebase.

1. Run the provided `detect_insecure_practices.sh` script:
   ```bash
   ./detect-insecure-practices.sh
   ```

2. This script will:
   - Search for insecure JavaScript APIs (`innerHTML`, `document.write`, `eval`) in the `./src/public` directory.
   - Run Semgrep with a custom ruleset to find additional security issues.
   - Extract JavaScript content from `<script>` tags in `index.html` for targeted analysis.

3. Review the script's output to locate unsafe DOM manipulations.

### Example: Secure Method Using DOM Manipulation
The following example demonstrates a Trusted Types-compliant way to update the DOM:
```javascript
// Safe method using DOM manipulation
const li = document.createElement('li');
li.textContent = `${order.name} reserved for ${order.order}`;
ordersList.appendChild(li);
```

### Note (Optional): Trusted Types Policy for Legacy Code
For legacy codebases where refactoring is not feasible, you can create a Trusted Types policy to warn about unsafe DOM manipulations:
```javascript
const policy = TrustedTypes.createPolicy('default', {
    createHTML: (input) => {
        console.warn('Unsafe HTML detected:', input);
        return input; // Allow for compatibility
    },
});
```

---

## Part III: Implement Trusted Types 

### Step 4: Refactor Code
1. Replace insecure APIs (`innerHTML`, `document.write`) with Trusted Types-compliant alternatives (`textContent`, DOM manipulation).

### Step 5: Enforce Trusted Types 
1. Add the Trusted Types header to enforce strict policies:
   ```javascript
   app.use((req, res, next) => {
       // Add Trusted Types for strict enforcement
       res.setHeader(
           'Content-Security-Policy',
           "trusted-types default; require-trusted-types-for 'script';"
       );
       next();
   });
   ```

2. Test XSS attacks by entering a payload into the **Name** field and clicking on 'Search.'
   - The payload should fail to execute, confirming Trusted Types enforcement.

---

## Part IV: Discussion

### Challenges in Refactoring Legacy Code
- Refactoring may require significant effort in large or poorly documented codebases.
- Identifying and replacing all unsafe DOM manipulations can be time-intensive.

### Automation and Trusted Types Policies
- **Trusted Types Policies**:
  - A practical interim solution for legacy applications.
  - Allows unsafe DOM manipulations while logging warnings for developers.
  - Not a long-term solution but can help during gradual migration.

### Reflection Questions
- Could Trusted Types policies replace refactoring entirely in legacy applications?
- How can automation tools like Semgrep assist in scaling such refactors?

---

## Further Resources
- [caniuse - require-trusted-types-for](https://caniuse.com/?search=require-trusted-types-for)
