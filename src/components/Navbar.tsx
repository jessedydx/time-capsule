'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useFarcaster } from './FarcasterProvider';
import { useAccount } from 'wagmi';

export function Navbar() {
    const { isSDKLoaded } = useFarcaster();
    const { address, isConnected } = useAccount();

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

                {/* Only show ConnectButton if NOT in Farcaster */}
                {!isSDKLoaded ? (
                    <ConnectButton
                        showBalance={{
                            smallScreen: false,
                            largeScreen: true,
                        }}
                        accountStatus={{
                            smallScreen: 'avatar',
                            largeScreen: 'full',
                        }}
                    />
                ) : (
                    <div className="px-3 py-2 bg-green-100 text-green-800 text-xs font-medium rounded-lg border border-green-300">
                        {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Farcaster Connected'}
                    </div>
                )}
            </div>
        </nav>
    );
}
