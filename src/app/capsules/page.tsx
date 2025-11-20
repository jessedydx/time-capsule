'use client';

import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import TimeCapsuleArtifact from '../../abis/TimeCapsule.json';
import { useEffect, useState } from 'react';

const CONTRACT_ADDRESS = '0x100ddE00826C83BD9243F0AF0DE47769c40fB5d2';

export default function ViewCapsules() {
    const { address } = useAccount();

    // 1. Get User's Capsule IDs
    const { data: capsuleIds } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TimeCapsuleArtifact.abi as any,
        functionName: 'getUserCapsules',
        args: [address],
        query: {
            enabled: !!address,
        }
    });

    // 2. Prepare contract calls for each ID
    const capsulesContract = {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TimeCapsuleArtifact.abi as any,
        functionName: 'getCapsule',
    } as const;

    const { data: capsulesData, isLoading } = useReadContracts({
        contracts: (capsuleIds as bigint[] || []).map((id) => ({
            ...capsulesContract,
            args: [id],
        })),
        query: {
            enabled: !!capsuleIds && (capsuleIds as bigint[]).length > 0,
        }
    });

    if (!address) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl">Please connect your wallet to view your capsules.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl">Loading capsules...</p>
            </div>
        );
    }

    const capsules = capsulesData?.map((result) => result.result) || [];

    return (
        <div className="min-h-screen p-8 flex flex-col gap-8 items-center">
            <h1 className="text-4xl font-bold">My Time Capsules</h1>

            {capsules.length === 0 ? (
                <p className="text-gray-400">You haven't created any capsules yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                    {capsules.map((capsule: any, index: number) => {
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
                                            <span className="text-gray-600 text-sm">Message Hidden</span>
                                        </div>
                                    ) : (
                                        <p className="text-gray-200 whitespace-pre-wrap">{capsule.message}</p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-800">
                                    <p className="text-xs text-gray-500">Unlock Time</p>
                                    <p className="text-sm font-medium">{unlockDate}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
