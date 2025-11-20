import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Farcaster Time Capsule',
    projectId: 'f1a0f0d91349a9ef2b0c913fb0a17505',
    chains: [base],
    ssr: true, // If your dApp uses server side rendering (SSR)
});
