// app/layout.js
"use client";
import "./globals.css";
import ThemeProvider from "../context/ThemeContext";
import { AppProvider } from "../context/AppContext";
import ToastProvider from "../context/ToastContext";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { useState } from "react";
import Head from "next/head";

export default function RootLayout({ children, feedback }) {
  const [openSideBar, setOpenSideBar] = useState(false);
  return (
    <html lang="en">
      <Head>
        <title>Sakaai Simulator</title>
        <meta name="description" content="AI quiz generator — MVP" />
      </Head>

      <body>
        <ThemeProvider>
          <AppProvider>
            <ToastProvider>
              <Header setOpenSideBar={setOpenSideBar} />
              <div className="app-layout">
                <aside>
                  <Sidebar openSideBar={openSideBar} />
                </aside>
                <main>{children}</main>
                {feedback}
              </div>
            </ToastProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
