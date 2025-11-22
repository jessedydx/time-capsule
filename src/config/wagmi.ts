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

const connectors = connectorsForWallets(
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
);

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
    name: 'Farcaster Direct',
}));

export const config = createConfig({
    chains: [base],
    transports: {
        [base.id]: http(),
    },
    connectors: [
        ...connectors,
        farcasterConnector
    ],
    ssr: true,
});
