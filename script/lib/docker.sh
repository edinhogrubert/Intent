#!/usr/bin/env bash
application_health(){
  docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' || return 1
  local url
  for url in http://127.0.0.1:8080/health/live http://127.0.0.1:8080/health/ready http://127.0.0.1:3000/healthz http://127.0.0.1:3000/api/health/ready; do
    curl --connect-timeout 5 --max-time 20 --fail --silent --show-error "$url" >/dev/null || return 1
  done
}
