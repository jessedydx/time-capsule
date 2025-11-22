import { getDefaultConfig, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import {
    argentWallet,
    trustWallet,
    ledgerWallet,
    coinbaseWallet,
    metaMaskWallet,
    rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConnector } from 'wagmi';
import { injected } from 'wagmi/connectors';
import sdk from '@farcaster/frame-sdk';

const { wallets } = getDefaultWallets();

export const config = getDefaultConfig({
    appName: 'Time Capsules',
    projectId: 'f1a0f0d91349a9ef2b0c913fb0a17505',
    chains: [base],
    ssr: true,
    wallets: [
        {
            groupName: 'Recommended',
            wallets: [
                coinbaseWallet,
                rainbowWallet,
                metaMaskWallet,
                ...wallets[0].wallets,
                argentWallet,
                trustWallet,
                ledgerWallet
            ],
        },
        ...wallets.slice(1),
    ],
});

// Add custom Farcaster connector that won't show in RainbowKit modal
// but can be used programmatically
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
    name: 'Farcaster Direct',
}));

// Manually add the connector to the config
(config.connectors as any).push(farcasterConnector);
