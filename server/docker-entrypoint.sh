#!/bin/sh

certbot certonly --standalone --non-interactive --agree-tos -d estimatron.dev -m estimatron.dev@gmail.com --test-cert

exec "$@"
