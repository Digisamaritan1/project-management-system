#!/bin/bash
if command -v xdg-mime >/dev/null 2>&1; then
  xdg-mime default alianhubtimetracker.desktop x-scheme-handler/myapp
fi
