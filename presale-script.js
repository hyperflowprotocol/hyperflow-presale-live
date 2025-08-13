// HyperFlow Presale JavaScript

class HyperFlowPresale {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.provider = null;
        this.walletConnectProvider = null;
        this.presaleData = {
            hardCap: 2000,
            tokensPerHype: 25000, // 1 HYPE = 25,000 FLOW tokens
            totalTokens: 50000000,
            raisedAmount: 0,
            participantCount: 0,
            tokensRemaining: 50000000
        };
        
        this.init();
    }

    init() {
        this.initLoadingBar();
        this.setupEventListeners();
        this.updateProgress();
        
        // Initialize timer immediately and then every second
        this.updateTimer();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    initLoadingBar() {
        // Hide loading bar after page content is loaded
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loadingBar = document.getElementById('loadingBar');
                if (loadingBar) {
                    loadingBar.classList.add('hidden');
                    // Remove from DOM after transition
                    setTimeout(() => {
                        loadingBar.remove();
                    }, 500);
                }
            }, 1000); // Show loading for at least 1 second
        });
    }

    setupEventListeners() {
        const connectButton = document.getElementById('connectWallet');
        const ethAmountInput = document.getElementById('ethAmount');
        const purchaseButton = document.getElementById('purchaseButton');

        if (connectButton) {
            connectButton.addEventListener('click', () => this.connectWallet());
        }

        if (ethAmountInput) {
            ethAmountInput.addEventListener('input', (e) => this.updateConversion(e.target.value));
        }

        if (purchaseButton) {
            purchaseButton.addEventListener('click', () => this.purchaseTokens());
        }
    }

    async connectWallet() {
        // Detect mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // On mobile, check for wallet apps first
            if (typeof window.ethereum !== 'undefined') {
                // Mobile has a wallet browser/app
                this.connectMetaMask();
            } else {
                // No wallet detected, show mobile-specific connection
                this.connectMobileWallet();
            }
        } else {
            // Desktop - show modal
            this.showWalletModal();
        }
    }

    showWalletModal() {
        const modal = document.createElement('div');
        modal.className = 'wallet-modal';
        modal.innerHTML = `
            <div class="wallet-modal-content">
                <div class="wallet-modal-header">
                    <h3>Connect Your Wallet</h3>
                    <button class="wallet-modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="wallet-options">
                    <button class="wallet-option" onclick="window.presale.connectMetaMask()">
                        <div class="wallet-icon">🦊</div>
                        <div class="wallet-info">
                            <div class="wallet-name">MetaMask</div>
                            <div class="wallet-desc">Browser Extension</div>
                        </div>
                    </button>
                    <button class="wallet-option" onclick="window.presale.connectWalletConnect()">
                        <div class="wallet-icon">📱</div>
                        <div class="wallet-info">
                            <div class="wallet-name">WalletConnect</div>
                            <div class="wallet-desc">Mobile Wallets</div>
                        </div>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async connectMobileWallet() {
        // Create mobile wallet connection options
        const mobileModal = document.createElement('div');
        mobileModal.className = 'wallet-modal';
        mobileModal.innerHTML = `
            <div class="wallet-modal-content">
                <div class="wallet-modal-header">
                    <h3>Connect Mobile Wallet</h3>
                    <button class="wallet-modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="mobile-wallet-instructions">
                    <p>Choose your preferred wallet:</p>
                    <div class="mobile-wallet-links">
                        <a href="https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}" class="mobile-wallet-link">
                            <span class="wallet-icon">🦊</span>
                            <span>Open in MetaMask</span>
                        </a>
                        <a href="https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(window.location.href)}" class="mobile-wallet-link">
                            <span class="wallet-icon">🛡️</span>
                            <span>Open in Trust Wallet</span>
                        </a>
                        <a href="https://rainbow.me" class="mobile-wallet-link">
                            <span class="wallet-icon">🌈</span>
                            <span>Open in Rainbow</span>
                        </a>
                        <a href="https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}" class="mobile-wallet-link">
                            <span class="wallet-icon">🔵</span>
                            <span>Open in Coinbase Wallet</span>
                        </a>
                    </div>
                    <div class="mobile-wallet-qr">
                        <button onclick="window.presale.connectWalletConnect()" class="qr-button">
                            📱 Show QR Code for Other Wallets
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(mobileModal);
    }

    async connectMetaMask() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                
                this.provider = window.ethereum;
                this.web3 = new Web3(window.ethereum);
                this.account = accounts[0];
                this.updateWalletStatus(true, 'MetaMask');
                this.showPresaleForm();
                this.closeModal();
                
                // Listen for account changes
                window.ethereum.on('accountsChanged', (accounts) => {
                    if (accounts.length === 0) {
                        this.disconnectWallet();
                    } else {
                        this.account = accounts[0];
                        this.updateWalletStatus(true, 'MetaMask');
                    }
                });
                
            } catch (error) {
                console.error('Error connecting MetaMask:', error);
                this.showError('Failed to connect MetaMask. Please try again.');
            }
        } else {
            this.showError('MetaMask not detected. Please install MetaMask extension.');
        }
    }

    async connectWalletConnect() {
        try {
            // Initialize WalletConnect provider
            this.walletConnectProvider = new WalletConnectProvider.default({
                projectId: "ca21cf0275758f8258a17ae99f6148d4", // HyperFlow Protocol Project ID
                rpc: {
                    1: "https://mainnet.infura.io/v3/8043bb2cf99347b1bfadfb233c5325c0",
                    5: "https://goerli.infura.io/v3/8043bb2cf99347b1bfadfb233c5325c0",
                    11155111: "https://sepolia.infura.io/v3/8043bb2cf99347b1bfadfb233c5325c0"
                },
                chainId: 1,
                qrcodeModalOptions: {
                    mobileLinks: [
                        "metamask",
                        "trust",
                        "rainbow",
                        "argent",
                        "coinbase",
                        "imtoken",
                        "pillar"
                    ]
                }
            });

            // Enable session (triggers QR Code modal)
            const accounts = await this.walletConnectProvider.enable();
            
            this.provider = this.walletConnectProvider;
            this.web3 = new Web3(this.walletConnectProvider);
            this.account = accounts[0];
            this.updateWalletStatus(true, 'WalletConnect');
            this.showPresaleForm();
            this.closeModal();

            // Listen for account changes
            this.walletConnectProvider.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnectWallet();
                } else {
                    this.account = accounts[0];
                    this.updateWalletStatus(true, 'WalletConnect');
                }
            });

            // Listen for disconnection
            this.walletConnectProvider.on('disconnect', () => {
                this.disconnectWallet();
            });

        } catch (error) {
            console.error('Error connecting WalletConnect:', error);
            this.showError('Failed to connect via WalletConnect. Please try again.');
        }
    }

    closeModal() {
        const modal = document.querySelector('.wallet-modal');
        if (modal) {
            modal.remove();
        }
    }

    disconnectWallet() {
        // Disconnect WalletConnect if active
        if (this.walletConnectProvider && this.walletConnectProvider.connected) {
            this.walletConnectProvider.disconnect();
        }
        
        this.account = null;
        this.provider = null;
        this.web3 = null;
        this.walletConnectProvider = null;
        this.updateWalletStatus(false);
        this.hidePresaleForm();
    }

    updateWalletStatus(connected, walletType = '') {
        const walletStatus = document.getElementById('walletStatus');
        const connectButton = document.getElementById('connectWallet');
        
        if (connected && this.account) {
            const walletTypeText = walletType ? ` via ${walletType}` : '';
            walletStatus.innerHTML = `
                <div class="status-connected">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>Connected${walletTypeText}: ${this.account.substring(0, 6)}...${this.account.substring(38)}</span>
                </div>
            `;
            connectButton.textContent = 'Disconnect Wallet';
            connectButton.onclick = () => this.disconnectWallet();
        } else {
            walletStatus.innerHTML = `
                <div class="status-disconnected">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 16V8A2 2 0 0019 6H5A2 2 0 003 8V16A2 2 0 005 18H19A2 2 0 0021 16Z" stroke="currentColor" stroke-width="2"/>
                        <path d="M7 2V6M17 2V6" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>Wallet Not Connected</span>
                </div>
            `;
            connectButton.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 16V8A2 2 0 0019 6H5A2 2 0 003 8V16A2 2 0 005 18H19A2 2 0 0021 16Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M7 2V6M17 2V6" stroke="currentColor" stroke-width="2"/>
                </svg>
                Connect Wallet
            `;
            connectButton.onclick = () => this.connectWallet();
        }
    }

    showPresaleForm() {
        const presaleForm = document.getElementById('presaleForm');
        if (presaleForm) {
            presaleForm.style.display = 'block';
        }
    }

    hidePresaleForm() {
        const presaleForm = document.getElementById('presaleForm');
        if (presaleForm) {
            presaleForm.style.display = 'none';
        }
    }

    updateConversion(ethAmount) {
        const flowAmount = document.getElementById('flowAmount');
        const usdAmount = document.getElementById('usdAmount');
        const purchaseButton = document.getElementById('purchaseButton');
        
        if (ethAmount && parseFloat(ethAmount) > 0) {
            const tokens = parseFloat(ethAmount) * this.presaleData.tokensPerEth;
            const usdValue = tokens * this.presaleData.tokenPrice;
            
            if (flowAmount) {
                flowAmount.textContent = `${tokens.toLocaleString()} FLOW tokens`;
            }
            
            if (usdAmount) {
                usdAmount.textContent = `≈ $${usdValue.toFixed(2)}`;
            }
            
            if (purchaseButton) {
                purchaseButton.disabled = false;
            }
        } else {
            if (flowAmount) flowAmount.textContent = '0 FLOW tokens';
            if (usdAmount) usdAmount.textContent = '≈ $0.00';
            if (purchaseButton) purchaseButton.disabled = true;
        }
    }

    async purchaseTokens() {
        const ethAmount = document.getElementById('ethAmount').value;
        
        if (!this.account) {
            this.showError('Please connect your wallet first.');
            return;
        }
        
        if (!ethAmount || parseFloat(ethAmount) <= 0) {
            this.showError('Please enter a valid ETH amount.');
            return;
        }

        try {
            // Show loading state
            const purchaseButton = document.getElementById('purchaseButton');
            const originalText = purchaseButton.textContent;
            purchaseButton.textContent = 'Processing...';
            purchaseButton.disabled = true;

            // Simulate transaction (replace with actual smart contract call)
            await this.simulateTransaction(ethAmount);
            
            // Update local state
            const tokens = parseFloat(ethAmount) * this.presaleData.tokensPerEth;
            const usdValue = tokens * this.presaleData.tokenPrice;
            
            this.presaleData.raisedAmount += usdValue;
            this.presaleData.tokensRemaining -= tokens;
            this.presaleData.participantCount += 1;
            
            this.updateProgress();
            
            // Reset form
            document.getElementById('ethAmount').value = '';
            this.updateConversion('');
            
            this.showSuccess(`Successfully purchased ${tokens.toLocaleString()} FLOW tokens!`);
            
            // Reset button
            purchaseButton.textContent = originalText;
            purchaseButton.disabled = true;
            
        } catch (error) {
            console.error('Purchase error:', error);
            this.showError('Transaction failed. Please try again.');
            
            // Reset button
            const purchaseButton = document.getElementById('purchaseButton');
            purchaseButton.textContent = 'Purchase FLOW Tokens';
            purchaseButton.disabled = false;
        }
    }

    async simulateTransaction(ethAmount) {
        // Simulate network delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 95% success rate
                if (Math.random() > 0.05) {
                    resolve();
                } else {
                    reject(new Error('Transaction failed'));
                }
            }, 2000);
        });
    }

    updateProgress() {
        const raisedAmountEl = document.getElementById('raisedAmount');
        const participantCountEl = document.getElementById('participantCount');
        const tokensRemainingEl = document.getElementById('tokensRemaining');
        const progressFill = document.getElementById('progressFill');
        const progressPercentage = document.getElementById('progressPercentage');
        
        // Calculate progress based on HYPE raised vs hardCap
        const progressPercent = (this.presaleData.raisedAmount / this.presaleData.hardCap) * 100;
        
        if (raisedAmountEl) {
            raisedAmountEl.textContent = `${this.presaleData.raisedAmount.toLocaleString()} HYPE`;
        }
        
        if (participantCountEl) {
            participantCountEl.textContent = this.presaleData.participantCount.toLocaleString();
        }
        
        if (tokensRemainingEl) {
            tokensRemainingEl.textContent = this.presaleData.tokensRemaining.toLocaleString();
        }
        
        if (progressFill) {
            progressFill.style.width = `${Math.min(progressPercent, 100)}%`;
        }
        
        if (progressPercentage) {
            progressPercentage.textContent = `${progressPercent.toFixed(1)}% Complete`;
        }
    }

    updateTimer() {
        // Set presale launch date to exactly 30 days from now
        const now = new Date();
        const launchDate = new Date('2025-09-12T00:00:00Z'); // Fixed date 30 days from August 13, 2025
        const timeDiff = launchDate.getTime() - now.getTime();
        
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        

        
        if (timeDiff > 0) {
            if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
        } else {
            // Presale has started
            if (daysEl) daysEl.textContent = '00';
            if (hoursEl) hoursEl.textContent = '00';
            if (minutesEl) minutesEl.textContent = '00';
            if (secondsEl) secondsEl.textContent = '00';
            
            const timerStatus = document.querySelector('.timer-status');
            if (timerStatus) {
                timerStatus.textContent = 'Presale is now live!';
                timerStatus.style.color = 'var(--success-green)';
            }
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.onclick = () => this.removeNotification(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);
    }

    removeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// Initialize the presale app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HyperFlowPresale();
});

// Additional CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .status-connected {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        color: var(--success-green);
        font-size: 1.1rem;
    }
    
    .status-connected svg {
        width: 24px;
        height: 24px;
    }
`;

document.head.appendChild(notificationStyles);