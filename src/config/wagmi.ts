import { getDefaultConfig, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import { farcasterWallet } from '../wallets/farcasterWallet';
import {
    argentWallet,
    trustWallet,
    ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';

const { wallets } = getDefaultWallets();

export const config = getDefaultConfig({
    appName: 'Farcaster Time Capsule',
    projectId: 'f1a0f0d91349a9ef2b0c913fb0a17505',
    chains: [base],
    ssr: true,
    wallets: [
        {
            groupName: 'Recommended',
            wallets: [farcasterWallet, ...wallets[0].wallets],
        },
        ...wallets.slice(1),
    ],
});
