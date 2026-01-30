#!/usr/bin/env bash
# Seed admin user (lubor.fedak@kyndryl.com) via Supabase Management API.
# Requires: SUPABASE_ACCESS_TOKEN, optional SUPABASE_PROJECT_REF (default: qxoxtkyeqwtvknektdly)
# Usage: SUPABASE_ACCESS_TOKEN=sbp_xxx ./scripts/seed-admin.sh

set -e
REF="${SUPABASE_PROJECT_REF:-qxoxtkyeqwtvknektdly}"
TOKEN="${SUPABASE_ACCESS_TOKEN:?Set SUPABASE_ACCESS_TOKEN}"

curl -s -X POST "https://api.supabase.com/v1/projects/${REF}/database/query" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"query": "INSERT INTO admin_users (user_id, email, name, is_active) SELECT id, '\''lubor.fedak@kyndryl.com'\'', '\''Lubor Fedak'\'', true FROM auth.users WHERE email = '\''lubor.fedak@kyndryl.com'\'' ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id, is_active = true, updated_at = NOW();"}' \
  | head -c 200
echo ""
