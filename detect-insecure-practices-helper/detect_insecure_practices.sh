#!/bin/bash
# Script for Challenge 4
# This script scans for insecure JavaScript practices in the app's source code.

# Set the paths to your app's source code
SOURCE_DIR="../src/public"
extracted_scripts_from_index=$SOURCE_DIR/../../extracted_scripts_from_index.js

# Define patterns for insecure JavaScript practices
patterns=(
  "innerHTML"
  "document.write"
  "eval("
)

echo "Starting security scan for JavaScript vulnerabilities..."

# Step 1: Check for insecure patterns using grep
echo "\nStep 1: Searching for insecure JavaScript patterns..."
for pattern in "${patterns[@]}"; do
  echo "Searching for pattern: $pattern"
  grep -nr --color=auto "$pattern" "$SOURCE_DIR" || echo "No occurrences of $pattern found."
done

# Step 2: Run Semgrep with custom rules if available
if command -v semgrep &> /dev/null; then
  echo -e "\nStep 2: Running Semgrep with custom rules..."

  # Extract <script> sections into a temp file for Semgrep to scan
  if [ -f "$SOURCE_DIR/index.html" ]; then
    echo "Extracting JavaScript content from <script> tags in index.html..."
    awk '/<script>/,/<\/script>/ {if (!/<script>/ && !/<\/script>/) print}' "$SOURCE_DIR/index.html" > "$extracted_scripts_from_index"

    if [ -s "$extracted_scripts_from_index" ]; then
      echo "JavaScript content extracted to $extracted_scripts_from_index for analysis."
    else
      echo "No JavaScript content found in <script> tags."
    fi
  else
    echo "index.html not found in $SOURCE_DIR."
  fi

  # Run Semgrep on the extracted file or JavaScript files
  if [ -s "$extracted_scripts_from_index" ]; then
    echo -e "\nRunning Semgrep on extracted scripts..."
    semgrep --config ./custom-security-rules.yml "$extracted_scripts_from_index"
  else
    echo -e "\nNo JavaScript content to analyze. Skipping Semgrep step."
  fi
else
  echo -e "\nSemgrep is not installed. Skipping Semgrep step."
fi



echo -e "\nSecurity scan complete."