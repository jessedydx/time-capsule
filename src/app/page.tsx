import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-5xl font-bold text-center sm:text-left bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
          Time Capsules
        </h1>
        <p className="text-base text-center sm:text-left max-w-2xl text-gray-700">
          <span className="font-semibold text-lg">The internet forgets. Blockchain remembers. Lock a secret for the future you or someone special. Secured by smart contracts on Base.</span>
          <br />
          Your message is encrypted and stored on-chain, remaining unreadable until the exact date you choose.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/create"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-black text-white gap-2 hover:bg-gray-800 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Create Capsule
          </Link>
          <Link
            href="/capsules"
            className="rounded-full border border-solid border-black transition-colors flex items-center justify-center hover:bg-gray-100 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
          >
            View My Capsules
          </Link>
        </div>

        {/* README Section */}
        <div className="mt-8 max-w-2xl w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
            What is Time Capsules?
          </h2>

          <div className="space-y-4 text-gray-700">
            <p className="text-sm leading-relaxed">
              Time Capsules is a decentralized application built on the Base blockchain that allows you to create encrypted messages that can only be revealed at a specific future date and time.
            </p>

            <div>
              <h3 className="font-semibold text-base mb-2 text-black">✨ Key Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                <li><strong>Time-Locked Encryption:</strong> Messages are encrypted using Lit Protocol and can only be decrypted after your chosen unlock date</li>
                <li><strong>Private or Public:</strong> Create private capsules for specific wallet addresses or public ones anyone can view</li>
                <li><strong>On-Chain Storage:</strong> All capsules are permanently stored on the Base blockchain</li>
                <li><strong>Provably Secure:</strong> Smart contract guarantees ensure your message remains sealed until the unlock time</li>
                <li><strong>Farcaster Integration:</strong> Seamlessly create and view capsules within the Farcaster ecosystem</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-2 text-black">🔐 How It Works:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
                <li>Write your message and set a future unlock date</li>
                <li>Choose privacy settings (public or private with specific recipients)</li>
                <li>Your message is encrypted and stored on Base blockchain</li>
                <li>The message automatically unlocks at your chosen date</li>
                <li>Only authorized recipients can decrypt and read the message</li>
              </ol>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 italic">
                💡 Perfect for: Future reminders, time-locked secrets, birthday messages, investment predictions, or leaving messages for future generations.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
