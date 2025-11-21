import { Wallet } from '@rainbow-me/rainbowkit';
import sdk from '@farcaster/frame-sdk';
import { createConnector } from 'wagmi';
import { injected } from 'wagmi/connectors';

export const farcasterWallet = (): Wallet => ({
    id: 'farcaster',
    name: 'Farcaster Wallet',
    iconUrl: 'https://farcaster.xyz/favicon.ico',
    iconBackground: '#855DCD',
    downloadUrls: {
        android: 'https://play.google.com/store/apps/details?id=xyz.farcaster.mobile',
        ios: 'https://apps.apple.com/us/app/warpcast/id1600555445',
        mobile: 'https://warpcast.com',
        qrCode: 'https://warpcast.com',
    },
    installed: async () => {
        try {
            // Only show as installed if we're in Farcaster context
            const context = await sdk.context;
            return !!context.user;
        } catch {
            return false;
        }
    },
    createConnector: (walletDetails) => {
        return createConnector((config) => ({
            ...injected({
                target: () => {
                    // Return the Farcaster SDK provider directly
                    return {
                        id: 'farcaster',
                        name: 'Farcaster Wallet',
                        provider: sdk.wallet.ethProvider,
                    };
                },
            })(config),
            ...walletDetails,
        }));
    },
});
