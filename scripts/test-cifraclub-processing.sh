#!/bin/bash

# Script para testar processamento do CifraClub

TRACK_ID="$1"
SUPABASE_URL="https://sffebcfgkthjcfnpgjvz.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZmViY2ZnYnRoamNmbnBnanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwNDk1NzgsImV4cCI6MjA0OTYyNTU3OH0.VrfPkH0gGJW5LcqmfPVL1JJJlJZb1EYBXbmOzVMi-Bw"

if [ -z "$TRACK_ID" ]; then
  echo "Usage: $0 <track_id>"
  exit 1
fi

echo "Processando track: $TRACK_ID"
echo ""

# Chamar a Edge Function
curl -X POST \
  "${SUPABASE_URL}/functions/v1/process-cifraclub" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"trackId\": \"${TRACK_ID}\"}"

echo ""
echo ""
echo "Processamento concluído!"
