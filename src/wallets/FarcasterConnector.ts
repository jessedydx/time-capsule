import { createConnector } from 'wagmi';
import sdk from '@farcaster/frame-sdk';
import { getAddress } from 'viem';

export function farcasterConnector() {
    return createConnector((config) => ({
        id: 'farcaster-custom',
        name: 'Farcaster Wallet',
        type: 'farcaster',

        async connect(parameters?: { chainId?: number; isReconnecting?: boolean }) {
            try {
                const provider = await sdk.wallet.ethProvider;
                if (!provider) throw new Error('Farcaster provider not found');

                const accounts = await provider.request({ method: 'eth_requestAccounts' });
                const chainId = await provider.request({ method: 'eth_chainId' });

                // Set up event listeners
                provider.on('accountsChanged', this.onAccountsChanged as any);
                provider.on('chainChanged', this.onChainChanged as any);
                provider.on('disconnect', this.onDisconnect as any);

                return {
                    accounts: accounts.map((x: string) => getAddress(x)),
                    chainId: Number(chainId),
                } as any;
            } catch (error) {
                console.error('Farcaster connect error:', error);
                throw error;
            }
        },

        async disconnect() {
            const provider = await sdk.wallet.ethProvider;
            if (provider) {
                provider.removeListener('accountsChanged', this.onAccountsChanged as any);
                provider.removeListener('chainChanged', this.onChainChanged as any);
                provider.removeListener('disconnect', this.onDisconnect as any);
            }
        },

        async getAccounts() {
            try {
                const provider = await sdk.wallet.ethProvider;
                if (!provider) return [];
                const accounts = await provider.request({ method: 'eth_accounts' });
                return accounts.map((x: string) => getAddress(x));
            } catch {
                return [];
            }
        },

        async getChainId() {
            try {
                const provider = await sdk.wallet.ethProvider;
                if (!provider) return 0;
                const chainId = await provider.request({ method: 'eth_chainId' });
                return Number(chainId);
            } catch {
                return 0;
            }
        },

        async getProvider() {
            return await sdk.wallet.ethProvider;
        },

        async isAuthorized() {
            try {
                const accounts = await this.getAccounts();
                return !!accounts.length;
            } catch {
                return false;
            }
        },

        onAccountsChanged(accounts: string[]) {
            if (accounts.length === 0) {
                config.emitter.emit('disconnect');
            } else {
                config.emitter.emit('change', { accounts: accounts.map((x) => getAddress(x)) });
            }
        },

        onChainChanged(chain: string) {
            config.emitter.emit('change', { chainId: Number(chain) });
        },

        onDisconnect() {
            config.emitter.emit('disconnect');
        },
    }));
}
