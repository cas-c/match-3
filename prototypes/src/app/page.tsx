import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-centerfont-sans bg-white dark:bg-purple-800/50">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16  sm:items-start">
        <Link href="/v1" className="hover:text-blue-400">
          version 1
        </Link>
      </main>
    </div>
  );
}
