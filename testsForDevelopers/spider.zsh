#!/usr/bin/env zsh
# Link checker spider - verifies all links in /betterNexus/static/*.txt return 200
# Usage: zsh spider.zsh


SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATIC_DIR="${SCRIPT_DIR}/../static"

if [[ ! -d "${STATIC_DIR}" ]]; then
  echo "Error: static directory not found at ${STATIC_DIR}" >&2
  exit 2
fi

echo "🕷️  Link-checker starting..."
echo "Scanning: ${STATIC_DIR}"
echo ""

total=0
ok=0
broken_count=0

# Create temp file for broken links
tmp_broken=$(mktemp)
trap "rm -f $tmp_broken" EXIT

# Find and process all .txt files
for f in "$STATIC_DIR"/*.txt; do
    [[ -f "$f" ]] || continue
    basename=$(basename "$f")
    echo "📄 Processing: $basename"

    # Read each line from the file
    while IFS= read -r line; do
        # Skip blank lines and comment lines (start with // or #)
        [[ -z "$line" ]] && continue
        [[ "$line" =~ ^[[:space:]]*(//|#) ]] && continue

        # Trim leading/trailing whitespace
        line="${line## }"
        line="${line%% }"
        [[ -z "$line" ]] && continue

        # Extract URL (first token) and name (rest)
        url_token="${line%% *}"
        name="${line#* }"
        [[ -z "$name" ]] && name="(no label)"

        # Skip if URL is too short (likely malformed)
        if [[ ${#url_token} -lt 5 ]]; then
            (( broken_count++ ))
            echo "$f|$name|$url_token|malformed" >> "$tmp_broken"
            continue
        fi

            # Skip extremely long URLs (> 500 chars) that might cause timeouts
            if [[ ${#url_token} -gt 500 ]]; then
                (( broken_count++ ))
                echo "$f|$name|$url_token|toolong" >> "$tmp_broken"
                continue
            fi

        # Normalize URL - add https:// if no scheme
        if [[ "$url_token" != http*://* ]]; then
            url="https://${url_token}"
        else
            url="$url_token"
        fi

        (( total++ ))


        # Check HTTP status with curl (3 second timeout per URL)
        # Suppress curl's progress meter and error messages
        http_status=$(curl -s -L -o /dev/null -w "%{http_code}" --connect-timeout 3 -m 3 "$url" 2>/dev/null || echo "timeout")

        if [[ "$http_status" == "200" ]]; then
            (( ok++ ))
            echo "  ✅ $basename: $name"
        else
            (( broken_count++ ))
            echo "$f|$name|$url|$http_status" >> "$tmp_broken"
            echo "  ❌ $basename: $name ($http_status)"
        fi
    done < "$f"

    echo ""
done


# Summary report
echo "============================================================"
echo "📊 SPIDER SUMMARY"
echo "============================================================"
echo "Total links checked: $total"
echo "Valid (200): $ok"
echo "Broken/Invalid: $broken_count"

if [[ $broken_count -gt 0 ]]; then
    echo ""
    echo "⚠️  Broken links details:"
    while IFS='|' read -r file name url http_code; do
        echo "  - File: $(basename "$file")"
        echo "    Name: $name"
        echo "    URL : $url"
        echo "    HTTP: $http_code"
        echo ""
    done < "$tmp_broken"
    exit 1
else
    echo ""
    echo "✅ All links returned 200 OK."
    exit 0
fi