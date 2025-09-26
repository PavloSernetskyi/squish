import AuthButtons from "@/components/AuthButtons";
import Link from "next/link";

export default function Home() {
  return (
    <main className="p-8 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Squish</h1>
      <p className="text-gray-700">
        A simple AI voice meditation guide. Log in, pick a length, and begin.
      </p>
      
      <AuthButtons />
    </main>
  );
}
