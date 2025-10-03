import Link from "next/link";
import Image from "next/image";
import { NAV_ITEMS } from "@/lib/Constants";
import { UserMenu } from "./user-menu";
import SearchCommand from "./SearchCommand";
import { searchStocks } from "@/lib/actions/finnhub.actions";

export async function Navbar() {
    const initialStocks = await searchStocks();

    return (
        <header className="sticky top-0 z-50 w-full flex items-center justify-center h-[70px] bg-gray-800">
            <div className="container flex flex-row justify-between items-center px-6 py-4 text-gray-500">
                <Link href="/">
                    <Image
                        src="/logo.svg"
                        alt="DexBit logo"
                        width={140}
                        height={32}
                        className="h-8 w-auto cursor-pointer"
                    />
                </Link>

                <nav className="hidden sm:block w-full">
                    <ul className="flex flex-row items-center justify-between gap-10 font-medium">
                        <span className="flex flex-row items-center gap-10">

                            {NAV_ITEMS.map(({ href, label }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className="hover:text-yellow-500 transition-colors text-gray-400"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </span>
                        <li key="search-trigger">
                            <SearchCommand
                                renderAs="input"
                                initialStocks={initialStocks}
                            />
                        </li>
                    </ul>
                </nav>

                <UserMenu />
            </div>
        </header>
    );
}