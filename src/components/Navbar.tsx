'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useFarcaster } from './FarcasterProvider';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';

export function Navbar() {
    const { isSDKLoaded, fid } = useFarcaster();
    const { connect, connectors } = useConnect();
    const { isConnected, address } = useAccount();
    const { disconnect } = useDisconnect();
    const [connecting, setConnecting] = useState(false);

    // Auto-connect in Farcaster context
    useEffect(() => {
        if (isSDKLoaded && !isConnected && !connecting) {
            handleFarcasterConnect();
        }
    }, [isSDKLoaded, isConnected]);

    const handleFarcasterConnect = async () => {
        if (connecting) return;
        setConnecting(true);

        try {
            // Get provider from Farcaster SDK
            const provider = await sdk.wallet.ethProvider;
            if (!provider) {
                console.error('No Farcaster provider found');
                setConnecting(false);
                return;
            }

            // Request accounts
            const accounts = await provider.request({ method: 'eth_requestAccounts' });
            console.log('Farcaster connected:', accounts[0]);

            // Connect using injected connector with Farcaster provider
            const injectedConnector = connectors.find(c => c.id === 'injected');
            if (injectedConnector) {
                await connect({ connector: injectedConnector });
            }
        } catch (error) {
            console.error('Farcaster connection error:', error);
        } finally {
            setConnecting(false);
        }
    };

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
