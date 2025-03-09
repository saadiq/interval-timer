#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Install ESLint plugins specifically
echo "Installing ESLint plugins..."
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser

echo "Dependencies installed successfully!" 