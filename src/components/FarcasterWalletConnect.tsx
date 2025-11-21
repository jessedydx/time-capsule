'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useFarcaster } from './FarcasterProvider';
import sdk from '@farcaster/frame-sdk';

export function FarcasterWalletConnect() {
    const { isSDKLoaded } = useFarcaster();
    const { isConnected } = useAccount();
    const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null);

    useEffect(() => {
        const getFarcasterAddress = async () => {
            if (isSDKLoaded) {
                try {
                    const context = await sdk.context;
                    // Get user's connected address from Farcaster context
                    const walletAddress = (context.user as any)?.custody || (context.user as any)?.verifications?.[0];
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

    // Show info when in Farcaster mode and not connected
    if (isSDKLoaded && !isConnected && farcasterAddress) {
        return (
            <div className="fixed bottom-4 right-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
                <p className="text-sm mb-2 font-bold">
                    🎭 Farcaster Mini App
                </p>
                <p className="text-xs opacity-90 mb-2">
                    Click "Connect Wallet" and select any wallet to continue.
                </p>
                <div className="text-xs bg-black/20 p-2 rounded font-mono">
                    Your Farcaster: {farcasterAddress.slice(0, 6)}...{farcasterAddress.slice(-4)}
                </div>
            </div>
        );
    }

    return null;
}
