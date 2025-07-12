// "use client";

// import "./globals.css";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import { AuthProvider } from "../context/auth-context";

// import { usePathname } from "next/navigation";
// import { Geist, Geist_Mono } from "next/font/google";

// const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname();
//   const isAdmin = pathname.startsWith("/admin"); // 👈 check if it's admin page

//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black min-h-screen`}
//       >
//         <AuthProvider>
//           {!isAdmin && <Navbar />}
//           {children}
//           {!isAdmin && <Footer />}
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }

"use client"
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "../context/auth-context";

import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from "next/navigation";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <title>Luxoro</title>
        {/* Optional meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black min-h-screen`}
      >
        <AuthProvider>
          {!isAdmin && <Navbar />}
          {children}
          {!isAdmin && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}