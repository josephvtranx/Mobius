#!/usr/bin/env bash
set -e
for url in $(psql "$REGISTRY_URL" -At \
             -c "SELECT conn_string FROM institutions"); do
  flyway -url="$url" migrate
done 