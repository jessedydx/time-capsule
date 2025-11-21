import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-5xl font-bold text-center sm:text-left text-black">
          Farcaster Time Capsule
        </h1>
        <p className="text-xl text-center sm:text-left max-w-2xl text-gray-700">
          Write a message to the future. Store it on the Base blockchain.
          It will remain locked until the date you choose.
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
      </main>
    </div>
  );
}
