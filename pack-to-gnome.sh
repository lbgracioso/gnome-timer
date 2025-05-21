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
  echo "Extensão empacotada com sucesso em $ZIP_NAME"
else
  echo "Falha ao empacotar a extensão."
  exit 1
fi

