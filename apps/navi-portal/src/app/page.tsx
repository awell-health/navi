import Image from "next/image";
import "./globals.css";
import { Domine, Source_Sans_3 } from "next/font/google";
import Link from "next/link";

const domine = Domine({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-domine",
});
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-source-sans",
});

export default function Home() {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen w-full flex items-center justify-center p-8 sm:p-20">
          <main className="flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-3">
              <Image
                src="/navi-logo.svg"
                alt="Navi logo"
                width={44}
                height={44}
                className="fill-blue-500"
                priority
              />
              <span className={`${domine.className} text-4xl text-foreground`}>
                Navi
              </span>
            </div>
            <h1
              className={`${sourceSans.className} text-3xl sm:text-5xl font-bold text-foreground max-w-3xl`}
            >
              Launch embedded care experiences{" "}
              <span className="text-blue-500">in minutes</span>
            </h1>
            <div className="flex gap-1">
              <Link
                href="https://developers.awellhealth.com/navi"
                className="text-blue-500 hover:text-blue-600 hover:underline"
              >
                Click here
              </Link>{" "}
              to get started and learn more
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
