'use client';

import { useEffect } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { useFarcaster } from './FarcasterProvider';
import sdk from '@farcaster/frame-sdk';

export function FarcasterWalletConnect() {
    const { isSDKLoaded } = useFarcaster();
    const { isConnected } = useAccount();
    const { connect, connectors } = useConnect();

    useEffect(() => {
        // Auto-connect Farcaster wallet when SDK is ready and not already connected
        const connectFarcasterWallet = async () => {
            if (isSDKLoaded && !isConnected) {
                try {
                    // Get Farcaster's Ethereum provider
                    const provider = await sdk.wallet.ethProvider;
                    if (provider) {
                        // Request account access
                        const accounts = await provider.request({
                            method: 'eth_requestAccounts'
                        });
                        console.log('Farcaster wallet connected:', accounts[0]);
                    }
                } catch (error) {
                    console.log('Farcaster wallet connection skipped:', error);
                }
            }
        };

        connectFarcasterWallet();
    }, [isSDKLoaded, isConnected]);

    return null;
}
