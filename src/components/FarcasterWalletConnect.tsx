'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useFarcaster } from './FarcasterProvider';
import sdk from '@farcaster/frame-sdk';

export function FarcasterWalletConnect() {
    const { isSDKLoaded } = useFarcaster();
    const { isConnected, address } = useAccount();
    const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null);

    useEffect(() => {
        const getFarcasterAddress = async () => {
            if (isSDKLoaded) {
                try {
                    const context = await sdk.context;
                    // Get user's connected address from Farcaster context
                    const walletAddress = context.user?.custody || context.user?.verifications?.[0];
                    if (walletAddress) {
                        setFarcasterAddress(walletAddress);
                    }
                } catch (error) {
                    console.log('Could not get Farcaster address:', error);
                }
            }
        };

        getFarcasterAddress();
    }, [isSDKLoaded]);

    // If we have a Farcaster address and not connected, show info
    if (isSDKLoaded && farcasterAddress && !isConnected) {
        return (
            <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
                <p className="text-sm mb-2">
                    🎯 You're using Farcaster! Connect your wallet to create capsules.
                </p>
                <p className="text-xs opacity-80">
                    Farcaster Address: {farcasterAddress.slice(0, 6)}...{farcasterAddress.slice(-4)}
                </p>
            </div>
        );
    }

    return null;
}
