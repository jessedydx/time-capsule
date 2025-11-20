'use client';

import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import TimeCapsuleArtifact from '../../abis/TimeCapsule.json';

const CONTRACT_ADDRESS = '0x100ddE00826C83BD9243F0AF0DE47769c40fB5d2';

export default function CreateCapsule() {
    const [message, setMessage] = useState('');
    const [unlockDate, setUnlockDate] = useState('');

    const { writeContract, isPending, isSuccess } = useWriteContract();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message || !unlockDate) return;

        const timestamp = Math.floor(new Date(unlockDate).getTime() / 1000);

        writeContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: TimeCapsuleArtifact.abi as any,
            functionName: 'createCapsule',
            args: [message, BigInt(timestamp)],
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
            <h1 className="text-4xl font-bold">Create Time Capsule</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
                <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="p-3 rounded bg-white text-black border border-gray-300 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Write your message for the future..."
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="date" className="text-sm font-medium">Unlock Date</label>
                    <input
                        type="datetime-local"
                        id="date"
                        value={unlockDate}
                        onChange={(e) => setUnlockDate(e.target.value)}
                        className="p-3 rounded bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition-colors disabled:opacity-50"
                >
                    {isPending ? 'Creating...' : 'Seal Capsule'}
                </button>

                {isSuccess && (
                    <div className="p-4 bg-green-900/50 text-green-200 rounded border border-green-800">
                        Capsule created successfully!
                    </div>
                )}
            </form>
        </div>
    );
}
