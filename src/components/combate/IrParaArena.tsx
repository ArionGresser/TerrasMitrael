"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/** O endereço antigo do combate leva para a arena. */
export function IrParaArena() {
  const router = useRouter();
  useEffect(() => router.replace("/combate/"), [router]);
  return (
    <p className="text-pergaminho-100 px-4 pt-32 text-center">
      O combate agora fica na <Link href="/combate/" className="underline">arena</Link>.
    </p>
  );
}
