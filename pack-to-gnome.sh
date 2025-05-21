#!/bin/bash

ZIP_NAME="timer@lbgracioso.net.zip"

FILES=(
  "alarm.ogg"
  "extension.js"
  "LICENSE"
  "metadata.json"
  "stylesheet.css"
)

rm -f "$ZIP_NAME"

zip "$ZIP_NAME" "${FILES[@]}"

if [[ $? -eq 0 ]]; then
  echo "Timer packaged - $ZIP_NAME"
else
  echo "Failed to package."
  exit 1
fi

