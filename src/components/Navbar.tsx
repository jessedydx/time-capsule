'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useFarcaster } from './FarcasterProvider';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';
import sdk from '@farcaster/frame-sdk';

export function Navbar() {
    const { isSDKLoaded, fid } = useFarcaster();
    const { connect, connectors } = useConnect();
    const { isConnected, address } = useAccount();
    const { disconnect } = useDisconnect();
    const [connecting, setConnecting] = useState(false);

    const handleFarcasterConnect = useCallback(async () => {
        if (connecting) {
            console.log('Already connecting, skipping...');
            return;
        }
        setConnecting(true);

        try {
            // Find our custom Farcaster connector
            const farcasterConnector = connectors.find(c => c.id === 'farcaster-custom');

            if (farcasterConnector) {
                console.log('Found Farcaster connector, connecting...');
                const result = await connect({ connector: farcasterConnector });
                console.log('✅ Connect result:', result);
                console.log('✅ Connected successfully to:', result.accounts?.[0]);
            } else {
                console.error('Farcaster connector not found in Wagmi config');
                console.log('Available connectors:', connectors.map(c => ({ id: c.id, name: c.name })));
                // Fallback: Try to find any injected connector if custom one fails
                const injected = connectors.find(c => c.id === 'injected');
                if (injected) {
                    console.log('Falling back to generic injected connector');
                    await connect({ connector: injected });
                }
            }
        } catch (error) {
            console.error('❌ Farcaster connection error:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                error
            });
        } finally {
            setConnecting(false);
        }
    }, [connecting, connectors, connect]);

    // Auto-connect in Farcaster context
    useEffect(() => {
        console.log('Auto-connect check:', { isSDKLoaded, isConnected, connecting });
        if (isSDKLoaded && !isConnected && !connecting) {
            console.log('Triggering auto-connect...');
            handleFarcasterConnect();
        }
    }, [isSDKLoaded, isConnected, connecting, handleFarcasterConnect]);

    return (
        <nav className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-100 fixed top-0 w-full z-10">
            <Link href="/" className="flex items-center">
                <img src="/logo.png" alt="Time Capsules" className="h-12" />
            </Link>

            <div className="flex items-center gap-4">
                <Link href="/create" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                    Create
                </Link>
                <Link href="/explore" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                    Explore
                </Link>
                <Link href="/capsules" className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                    My Capsules
                </Link>

                {isSDKLoaded && fid && (
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                        Farcaster ID: {fid}
                    </div>
                )}

                {/* In Farcaster context, use custom button */}
                {isSDKLoaded ? (
                    isConnected ? (
                        <button
                            onClick={() => disconnect()}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Disconnect
                        </button>
                    ) : (
                        <button
                            onClick={handleFarcasterConnect}
                            disabled={connecting}
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            {connecting ? 'Connecting...' : 'Connect Wallet'}
                        </button>
                    )
                ) : (
                    <ConnectButton
                        showBalance={{
                            smallScreen: false,
                            largeScreen: true,
                        }}
                        accountStatus={{
                            smallScreen: 'avatar',
                            largeScreen: 'full',
                        }}
                        chainStatus="icon"
                    />
                )}
            </div>
        </nav>
    );
}
