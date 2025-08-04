# Insecure Code Detection Script - a Trusted Types Migration Helper

Here's a simple bash script that automates the detection of insecure JavaScript practices like `innerHTML`, `eval`, and `document.write` using Semgrep and grep. This is helpful when trying to find insecure patterns that block the enablement of Trusted Types. 

## Prerequisites
1. **Install Semgrep:**
   - Install Semgrep via pip: `pip install semgrep`
   - Or use Homebrew (macOS): `brew install semgrep`

## Detection Script

1. Save the script as `detect_insecure_practices.sh`.
2. Make it executable: `chmod +x detect_insecure_practices.sh`.
3. Run the script: `./detect_insecure_practices.sh`.

## What It Does

1. **Grep for Insecure Patterns:**
   - Searches the `./src/public` directory for the following insecure JavaScript APIs:
     - `innerHTML`
     - `document.write`
     - `eval`

2. **Run Semgrep:**
   - Scans the code using Semgrep with a custom `custom-security-rules.yml` ruleset.

3. **Extract `<script>` Content from HTML:**
   - Extracts JavaScript from `<script>` tags in `index.html` for targeted analysis.

4. **Report Findings:**
   - Provides detailed output of detected issues for further remediation.

## Script Output Example

```bash
Starting security scan for JavaScript vulnerabilities...

Step 1: Searching for insecure JavaScript patterns...
Searching for pattern: innerHTML
./src/public/index.html:93:            ordersList.innerHTML = '';
./src/public/index.html:98:                // Persistent XSS vulnerability: unsanitised data rendered with innerHTML
./src/public/index.html:99:                ordersList.innerHTML += `<li class="list-group-item">${order.name} reserved for ${order.order}</li>`;
./src/index.html:109:            // DOM-based XSS: unsanitised input rendered with innerHTML
./src/public/index.html:110:            searchResults.innerHTML = `<p>Search results for: <b>${searchQuery}</b></p>`;
./src/public/useruploads/attack.js:15:banner.innerHTML = 'Hacked by XSS! External script loaded.';
Searching for pattern: document.write
No occurrences of document.write found.
Searching for pattern: eval(
No occurrences of eval( found.

Step 2: Running Semgrep with custom rules...
Extracting JavaScript content from <script> tags in index.html...
JavaScript content extracted to ./src/public/index-script.js for analysis.

Running Semgrep on extracted scripts...

┌──── ○○○ ────┐
│ Semgrep CLI │
└─────────────┘

Scanning 1 file (only git-tracked) with 8 Code rules:

  CODE RULES
  Scanning 1 file with 8 js rules.

  SUPPLY CHAIN RULES

  No rules to run.

PROGRESS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00

┌─────────────────┐
│ 2 Code Findings │
└─────────────────┘

    src/public/index-script.js
    ❯❱ detect-unsafe-template-literals
          Be cautious when injecting variables into template literals that manipulate the DOM. Use Trusted
          Types or escape user input.                                                                                     
                                                                                                           
           31┆ ordersList.innerHTML += `<li class="list-group-item">${order.name} reserved for
               ${order.order}</li>`;                                                     
            ⋮┆----------------------------------------
           42┆ searchResults.innerHTML = `<p>Search results for: <b>${searchQuery}</b></p>`;

┌──────────────┐
│ Scan Summary │
└──────────────┘

Ran 8 rules on 1 file: 2 findings.

Security scan complete.
```

## Outlook: Customisation
- **Add More Patterns:** Extend the `patterns` array in the script to include other insecure practices (e.g., `Function` or `setTimeout` with strings).
- **Target More Directories:** Modify the `SOURCE_DIR` variable to include other directories or backend code.
- **CI Integration:** Add the script to your CI pipeline (e.g., GitHub Actions, Jenkins) for automated scans.
- **Enhance Ruleset:** Update `custom-security-rules.yml` to include additional Semgrep rules for specific security issues.
