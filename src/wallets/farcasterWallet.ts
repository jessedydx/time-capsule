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
    createConnector: (walletDetails) => {
        return createConnector((config) => ({
            // @ts-ignore - Farcaster SDK provider type compatibility
            ...injected({
                target: async () => {
                    try {
                        const provider = await sdk.wallet.ethProvider;
                        return provider;
                    } catch (error) {
                        console.error('Failed to get Farcaster eth provider:', error);
                        return undefined;
                    }
                },
            })(config),
            ...walletDetails,
        }));
    },
});
