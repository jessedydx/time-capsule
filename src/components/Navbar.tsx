'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Navbar() {
    return (
        <nav className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-100 fixed top-0 w-full z-10">
            <Link href="/" className="flex items-center">
                <img src="/logo.png" alt="Time Capsule" className="h-8" />
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
            </div>
        </nav>
    );
}
