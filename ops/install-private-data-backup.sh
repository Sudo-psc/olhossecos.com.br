#!/usr/bin/env bash
set -euo pipefail

script_directory=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
install -d -o root -g root -m 0755 /usr/local/libexec/olhossecos
install -o root -g root -m 0755 \
  "${script_directory}/backup/backup-private-data.mjs" \
  /usr/local/libexec/olhossecos/backup-private-data.mjs
