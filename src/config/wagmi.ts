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
