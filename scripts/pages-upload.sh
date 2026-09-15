#!/usr/bin/env bash
# Publish the built Angular bundle to Cloudflare Pages using only zip + curl (no wrangler).
#
# Uses the same "direct upload" endpoint the dashboard's drag-and-drop uploader calls:
#   POST /accounts/:account_id/pages/projects/:project_name/direct_uploads   (multipart, zip)
# That endpoint is not in Cloudflare's public API reference, so if it ever stops working,
# fall back to `pnpm run deploy:wrangler` or to Pages Git integration (see README).
#
# Required env:
#   CLOUDFLARE_API_TOKEN   API token with "Cloudflare Pages:Edit" + "Account:Read"
#   CLOUDFLARE_ACCOUNT_ID  dash.cloudflare.com -> right rail -> Account ID
# Optional env:
#   PAGES_PROJECT_NAME     Pages project name            (default: my-sandbox-app)
#   PAGES_BRANCH           branch for this deploy; must equal the project production branch
#   PAGES_OUTPUT_DIR       directory to publish          (default: dist/my-sandbox-app/browser)
#   PAGES_DRY_RUN=1        package and validate, but do not call the API
#   CLOUDFLARE_API_BASE_URL  override the API base (testing/mocks only)
set -euo pipefail

OUT_DIR="${PAGES_OUTPUT_DIR:-dist/my-sandbox-app/browser}"
PROJECT="${PAGES_PROJECT_NAME:-my-sandbox-app}"
BRANCH="${PAGES_BRANCH:-master}"
API="${CLOUDFLARE_API_BASE_URL:-https://api.cloudflare.com/client/v4}"

fail() {
	printf 'deploy-pages: error: %s\n' "$1" >&2
	exit 1
}

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

[ -f "$OUT_DIR/index.html" ] ||
	fail "no $OUT_DIR/index.html — build first: pnpm exec ng build"

if [ "${PAGES_DRY_RUN:-0}" != "1" ]; then
	[ -n "${CLOUDFLARE_API_TOKEN:-}" ] ||
		fail "CLOUDFLARE_API_TOKEN is not set (create a token with Pages:Edit + Account:Read)"
	[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ] ||
		fail "CLOUDFLARE_ACCOUNT_ID is not set (shown in the Cloudflare dashboard account rail)"
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
zip="$tmp/site.zip"

# Cloudflare serves the zip contents from the archive root, so the entries must be
# `index.html`, `main-*.js`, … and never `dist/my-sandbox-app/browser/index.html`.
(
	cd "$OUT_DIR"
	if command -v zip >/dev/null 2>&1; then
		zip -qrX "$zip" .
	elif command -v python3 >/dev/null 2>&1; then
		python3 - "$zip" <<'PY'
import os, sys, zipfile

out = sys.argv[1]
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for root, _, files in os.walk("."):
        for name in files:
            path = os.path.join(root, name)
            zf.write(path, os.path.relpath(path, "."))
PY
	else
		fail "neither 'zip' nor 'python3' is available to build the archive"
	fi
)

[ "$(find "$OUT_DIR" -type f | wc -l)" -gt 0 ] || fail "$OUT_DIR contains no files"
files="$(unzip -Z1 "$zip" 2>/dev/null | wc -l || echo "?")"
printf 'deploy-pages: %s (%s files, %s) -> project "%s" branch "%s"\n' \
	"$OUT_DIR" "$files" "$(du -h "$zip" | cut -f1)" "$PROJECT" "$BRANCH"

if [ "${PAGES_DRY_RUN:-0}" = "1" ]; then
	printf 'deploy-pages: PAGES_DRY_RUN=1, archive contents:\n'
	unzip -Z1 "$zip" | sed 's/^/  /'
	exit 0
fi

resp="$tmp/response.json"
# Never send the API token over plaintext, but allow an http:// base URL for local mocks.
tls_flags=(--tlsv1.2)
case "$API" in
	https://*) tls_flags+=(--proto '=https') ;;
esac
status="$(
	curl -sS "${tls_flags[@]}" \
		--retry 3 --retry-delay 2 --retry-all-errors --max-time 600 \
		-o "$resp" -w '%{http_code}' \
		-X POST "$API/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT/direct_uploads" \
		-H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
		-F "branch=$BRANCH" \
		-F "file=@$zip;type=application/zip"
)" || fail "the API request did not complete (network or DNS failure)"

summary="$(
	node -e '
const fs = require("node:fs");
const body = JSON.parse(fs.readFileSync(process.argv[1], "utf8") || "{}");
const r = body.result || {};
console.log([r.url || r.deployment_id || "", (body.errors || []).map((e) => e.message).join("; ")].join("\t"));
' "$resp" 2>/dev/null || true
)"
url="${summary%%$'\t'*}"
errors="${summary#*$'\t'}"

if [ "$status" != "200" ] && [ "$status" != "201" ]; then
	printf 'deploy-pages: error: HTTP %s from direct_uploads\n' "$status" >&2
	[ -n "$errors" ] && printf 'deploy-pages: %s\n' "$errors" >&2
	[ "$status" = "403" ] && printf 'deploy-pages: check the token scope, and note that Git-integrated Pages projects reject direct uploads — use "pnpm run deploy:wrangler" for those.\n' >&2
	sed -n '1,20p' "$resp" >&2
	exit 1
fi

printf 'deploy-pages: deployed. %s\n' "${url:-see the Cloudflare Pages deployment list}"

if [ -n "${url:-}" ]; then
	site="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 60 "$url" || echo "n/a")"
	printf 'deploy-pages: GET %s -> HTTP %s\n' "$url" "$site"
fi
