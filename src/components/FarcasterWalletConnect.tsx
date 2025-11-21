'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { useFarcaster } from './FarcasterProvider';
import sdk from '@farcaster/frame-sdk';
import { injected } from 'wagmi/connectors';

export function FarcasterWalletConnect() {
    const { isSDKLoaded } = useFarcaster();
    const { isConnected, address } = useAccount();
    const { connect } = useConnect();
    const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null);
    const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);

    useEffect(() => {
        const getFarcasterAddress = async () => {
            if (isSDKLoaded && !autoConnectAttempted) {
                try {
                    const context = await sdk.context;
                    // Get user's connected address from Farcaster context
                    const walletAddress = (context.user as any)?.custody || (context.user as any)?.verifications?.[0];
                    if (walletAddress) {
                        setFarcasterAddress(walletAddress);

                        // Auto-connect to wallet if in Farcaster and not already connected
                        if (!isConnected) {
                            try {
                                // Try to connect using injected connector (Farcaster wallet)
                                connect({ connector: injected() });
                            } catch (error) {
                                console.log('Auto-connect failed, user needs to connect manually:', error);
                            }
                        }
                        setAutoConnectAttempted(true);
                    }
                } catch (error) {
                    console.log('Could not get Farcaster address:', error);
                    setAutoConnectAttempted(true);
                }
            }
        };

        getFarcasterAddress();
    }, [isSDKLoaded, isConnected, connect, autoConnectAttempted]);

    // Show a subtle indicator when in Farcaster mode
    if (isSDKLoaded && !isConnected && farcasterAddress) {
        return (
            <div className="fixed bottom-4 right-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
                <p className="text-sm mb-2 font-bold">
                    🎭 Running in Farcaster
                </p>
                <p className="text-xs opacity-90">
                    Connect your wallet to interact with capsules.
                </p>
            </div>
        );
    }

    return null;
}
