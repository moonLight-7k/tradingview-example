import Link from "next/link";
import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="auth-layout">
            <section className="auth-left-section scrollbar-hide-default">


                <div className="pb-6 lg:pb-8 flex-1">{children}</div>
            </section>


        </main>
    )
}
export default Layout