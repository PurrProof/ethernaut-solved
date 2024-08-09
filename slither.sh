#!/bin/sh

# Check for the existence of slither and other tools
if ! which slither > /dev/null 2>&1; then
    echo "Error: slither not found. Please install it and try again."
    exit 1
fi
if ! which solc > /dev/null 2>&1; then
    echo "Error: solc not found. Please install it and try again."
    exit 1
fi

# 1. Basic slither check
echo "[Basic Slither Check]"
echo "---------------------"
slither .

# 2. Human summary check
echo "\n\n[Human Summary Check]"
echo "----------------------"
slither . --ignore-compile --skip-clean --print human-summary

#echo "\n\nAll checks completed. Report saved to $REPORT_FILE"
echo "\n\nAll checks completed."
