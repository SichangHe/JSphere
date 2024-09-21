#!/bin/env bash
set -e

SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR"
node server.js
