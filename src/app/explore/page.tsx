'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import TimeCapsuleArtifact from '../../abis/TimeCapsule.json';
import { useState } from 'react';

const CONTRACT_ADDRESS = '0x100ddE00826C83BD9243F0AF0DE47769c40fB5d2';

type FilterType = 'all' | 'locked' | 'unlocked';

export default function ExploreCapsules() {
    const [filter, setFilter] = useState<FilterType>('all');

    // Get total number of capsules
    const { data: nextCapsuleId } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TimeCapsuleArtifact.abi as any,
        functionName: 'nextCapsuleId',
    });

    const totalCapsules = Number(nextCapsuleId || 0);

    // Prepare contract calls for all capsules
    const capsulesContract = {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TimeCapsuleArtifact.abi as any,
        functionName: 'getCapsule',
    } as const;

    const { data: capsulesData, isLoading } = useReadContracts({
        contracts: Array.from({ length: totalCapsules }, (_, i) => ({
            ...capsulesContract,
            args: [BigInt(i)],
        })),
        query: {
            enabled: totalCapsules > 0,
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl">Loading capsules...</p>
            </div>
        );
    }

    const capsules = capsulesData?.map((result) => result.result).filter(Boolean) || [];

    // Filter capsules based on lock status
    const filteredCapsules = capsules.filter((capsule: any) => {
        const unlockTime = Number(capsule.unlockTime) * 1000;
        const isLocked = Date.now() < unlockTime;

        if (filter === 'locked') return isLocked;
        if (filter === 'unlocked') return !isLocked;
        return true; // 'all'
    });

    return (
        <div className="min-h-screen p-8 flex flex-col gap-8 items-center">
            <h1 className="text-4xl font-bold">Explore Time Capsules</h1>

            {/* Filter buttons */}
            <div className="flex gap-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    All ({capsules.length})
                </button>
                <button
                    onClick={() => setFilter('locked')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'locked'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    Locked
                </button>
                <button
                    onClick={() => setFilter('unlocked')}
                    className={`px-4 py-2 rounded-lg transition-colors ${filter === 'unlocked'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    Unlocked
                </button>
            </div>

            {filteredCapsules.length === 0 ? (
                <p className="text-gray-400">No capsules found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                    {filteredCapsules.map((capsule: any, index: number) => {
                        if (!capsule) return null;

                        const unlockTime = Number(capsule.unlockTime) * 1000;
                        const isLocked = Date.now() < unlockTime;
                        const unlockDate = new Date(unlockTime).toLocaleString();

                        return (
                            <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-4 shadow-lg hover:border-gray-700 transition-colors">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-mono text-gray-500">ID: {capsule.id.toString()}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${isLocked ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
                                        {isLocked ? 'LOCKED' : 'UNLOCKED'}
                                    </span>
                                </div>

                                <div className="flex-grow">
                                    {isLocked ? (
                                        <div className="h-24 flex items-center justify-center bg-black/30 rounded border border-dashed border-gray-800">
                                            <span className="text-gray-600 text-sm">🔒 Message Hidden</span>
                                        </div>
                                    ) : (
                                        <p className="text-gray-200 whitespace-pre-wrap">{capsule.message}</p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-800">
                                    <p className="text-xs text-gray-500 mb-1">Creator</p>
                                    <p className="text-sm font-mono text-gray-400 truncate">{capsule.creator}</p>

                                    <p className="text-xs text-gray-500 mt-3">Unlock Time</p>
                                    <p className="text-sm font-medium text-white">{unlockDate}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
