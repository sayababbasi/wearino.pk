# Fix Node.js Version Issue

## Problem
```
You are using Node.js 18.20.5. For Next.js, Node.js version ">=20.9.0" is required.
```

## Solution Options

### Option 1: Using nvm (Node Version Manager) - Recommended

**Check if nvm is installed:**
```bash
nvm --version
```

**If nvm is installed:**
```bash
# Install Node.js 20
nvm install 20

# Use Node.js 20
nvm use 20

# Set as default (optional)
nvm alias default 20

# Verify
node --version  # Should show v20.x.x
```

**If nvm is NOT installed, install it:**
```bash
# Mac/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Then restart terminal or run:
source ~/.nvm/nvm.sh

# Install Node.js 20
nvm install 20
nvm use 20
```

---

### Option 2: Install Node.js 20 from Official Website

1. Visit: https://nodejs.org/
2. Download **Node.js 20.x LTS** version
3. Install the downloaded package
4. Restart terminal
5. Verify: `node --version`

---

### Option 3: Using Homebrew (Mac)

```bash
# Install Node.js 20
brew install node@20

# Link it
brew link node@20 --force

# Verify
node --version
```

---

### Option 4: Using n (Node Version Manager)

```bash
# Install n (if not installed)
npm install -g n

# Install Node.js 20
sudo n 20

# Verify
node --version
```

---

## After Updating Node.js

1. **Verify version:**
   ```bash
   node --version  # Should be >= 20.9.0
   npm --version
   ```

2. **Reinstall dependencies (recommended):**
   ```bash
   cd product_listing_app
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Start the frontend:**
   ```bash
   cd product_listing_app
   npm run dev
   ```

---

## Quick Check Commands

```bash
# Check current Node version
node --version

# Check if nvm is available
command -v nvm

# Check available Node versions (if using nvm)
nvm list

# Check Node installation path
which node
```

---

## Troubleshooting

### If nvm command not found:
```bash
# Add to ~/.zshrc or ~/.bash_profile
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

Then restart terminal or run:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

### If multiple Node versions installed:
```bash
# List all versions
nvm list

# Switch between versions
nvm use 20
nvm use 18
```

---

**Once Node.js 20+ is installed, you can run:**
```bash
cd product_listing_app
npm run dev
```

