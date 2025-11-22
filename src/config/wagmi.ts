import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
    argentWallet,
    trustWallet,
    ledgerWallet,
    coinbaseWallet,
    metaMaskWallet,
    rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http, createConnector } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import sdk from '@farcaster/frame-sdk';

const projectId = 'f1a0f0d91349a9ef2b0c913fb0a17505';

// Helper function to detect if we're in a Farcaster miniapp context
const isFarcasterMiniapp = (): boolean => {
    if (typeof window === 'undefined') return false;

    // Check if Farcaster SDK is available and can provide context
    try {
        // Check for Farcaster-specific window properties or user agent
        const userAgent = window.navigator.userAgent || '';
        const isFarcasterUA = userAgent.includes('Farcaster') || userAgent.includes('Warpcast');

        // Also check if we're in an iframe (common for miniapps)
        const isInFrame = window.self !== window.top;

        return isFarcasterUA || isInFrame;
    } catch {
        return false;
    }
};

// Custom Farcaster connector
const farcasterConnector = createConnector((config) => ({
    ...injected({
        target: (async () => {
            try {
                const provider = await sdk.wallet.ethProvider;
                return provider;
            } catch (e) {
                console.error('Error getting Farcaster provider:', e);
                return undefined;
            }
        }) as any
    })(config),
    id: 'farcaster-custom',
    name: 'Farcaster Wallet',
}));

// Create config with conditional connectors
const createWagmiConfig = () => {
    const inFarcasterMiniapp = isFarcasterMiniapp();

    // In Farcaster miniapp: only use Farcaster connector
    // In regular web: include all Rainbow connectors
    const allConnectors = inFarcasterMiniapp
        ? [farcasterConnector]
        : [
            ...connectorsForWallets(
                [
                    {
                        groupName: 'Recommended',
                        wallets: [
                            coinbaseWallet,
                            rainbowWallet,
                            metaMaskWallet,
                            argentWallet,
                            trustWallet,
                            ledgerWallet
                        ],
                    },
                ],
                {
                    appName: 'Time Capsules',
                    projectId,
                }
            ),
            farcasterConnector
        ];

    return createConfig({
        chains: [base],
        transports: {
            [base.id]: http(),
        },
        connectors: allConnectors,
        ssr: true,
    });
};

export const config = createWagmiConfig();
