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
        if (connecting) return;
        setConnecting(true);

        try {
            // Find our custom Farcaster connector
            const farcasterConnector = connectors.find(c => c.id === 'farcaster-custom');

            if (farcasterConnector) {
                console.log('Found Farcaster connector, connecting...');
                await connect({ connector: farcasterConnector });
                console.log('✅ Connected successfully to Farcaster wallet');
            } else {
                console.error('Farcaster connector not found in Wagmi config');
            }
        } catch (error) {
            console.error('❌ Farcaster connection error:', error);
        } finally {
            setConnecting(false);
        }
    }, [connecting, connectors, connect]);

    return (
        <nav className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#1a1d29] fixed top-0 w-full z-10 shadow-lg">
            <Link href="/" className="flex items-center">
                <img src="/logo.png" alt="Time Capsules" className="h-[120px] drop-shadow-[0_0_15px_rgba(100,200,255,0.3)]" />
            </Link>

            <div className="flex items-center gap-4">
                <Link href="/create" className="text-sm text-white hover:text-gray-300 transition-colors font-medium">
                    Create
                </Link>
                <Link href="/explore" className="text-sm text-white hover:text-gray-300 transition-colors font-medium">
                    Explore
                </Link>
                <Link href="/capsules" className="text-sm text-white hover:text-gray-300 transition-colors font-medium">
                    My Capsules
                </Link>

                {isSDKLoaded && fid && (
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-700 text-cyan-400 rounded-full text-xs font-medium border border-cyan-500/30">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
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
                            className="bg-black hover:bg-gray-800 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700"
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
