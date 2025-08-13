# WalletConnect (Reown) Setup Guide

## 🔗 Quick Setup Steps

### Step 1: Create Reown Account
1. **Go to:** `https://cloud.reown.com/`
2. **Sign up** with your email
3. **Verify email** and login

### Step 2: Create Project
1. **Click "Create Project"**
2. **Project Name:** `HyperFlow Presale`
3. **Project Type:** Select "Web3Modal" or "WalletConnect"
4. **Platform:** Web
5. **Click "Create"**

### Step 3: Get Project ID
1. **Copy your Project ID** (format: `abc123def456...`)
2. **Add allowed domain:** `hyperflow-presale-live-shal.vercel.app`
3. **Save settings**

### Step 4: Update Code
1. **Edit file:** `presale-script.js`
2. **Find line 140:** `projectId: "YOUR_REOWN_PROJECT_ID"`
3. **Replace with:** `projectId: "YOUR_ACTUAL_PROJECT_ID"`
4. **Deploy update to Vercel**

## 📱 What This Enables

**Current (MetaMask only):**
- ❌ Desktop browsers only
- ❌ Requires MetaMask extension
- ❌ Limited wallet support

**After WalletConnect:**
- ✅ **All mobile wallets** (Trust, Rainbow, Coinbase, etc.)
- ✅ **QR code scanning** from mobile
- ✅ **Universal compatibility** across devices
- ✅ **Professional wallet selection modal**

## 🔧 Technical Details

**New Features Added:**
- Wallet selection modal with MetaMask + WalletConnect options
- Mobile-friendly QR code scanning
- Support for 20+ popular wallets
- Automatic disconnection handling
- Professional UI with teal mint design

**Files Updated:**
- `index.html` - Added WalletConnect libraries
- `presale-script.js` - Universal wallet connection logic
- `presale-styles.css` - Wallet modal styling

## 🚀 Deployment

1. **Get your Reown Project ID**
2. **Update the Project ID in code**
3. **Redeploy to Vercel** (automatic via GitHub)
4. **Test on mobile devices**

Your presale will then support all major wallets across all devices!