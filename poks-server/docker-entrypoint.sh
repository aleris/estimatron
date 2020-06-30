#!/bin/sh

certbot certonly --standalone --non-interactive --agree-tos -d estimatron.dev -m poks.agile.app@gmail.com --test-cert

exec "$@"
