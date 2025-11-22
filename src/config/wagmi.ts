import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
    argentWallet,
    trustWallet,
    ledgerWallet,
    coinbaseWallet,
    metaMaskWallet,
    rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { farcasterConnector } from '../wallets/FarcasterConnector';

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

// Create config with conditional connectors
const createWagmiConfig = () => {
    const inFarcasterMiniapp = isFarcasterMiniapp();

    // Initialize custom connector
    const farcaster = farcasterConnector();

    // In Farcaster miniapp: only use Farcaster connector
    // In regular web: include all Rainbow connectors
    const allConnectors = inFarcasterMiniapp
        ? [farcaster]
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
            farcaster
        ];

    return createConfig({
        chains: [base, mainnet],
        transports: {
            [base.id]: http(),
            [mainnet.id]: http(),
        },
        connectors: allConnectors,
        ssr: true,
    });
};

export const config = createWagmiConfig();
