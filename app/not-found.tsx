import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen flex justify-center items-center flex-col">
      <Image src="/404.jpg" width={500} height={500} alt="404 error" />
      <Link href="/">
        <Button className="bg-black cursor-pointer">Return Home</Button>
      </Link>
    </div>
  );
}
