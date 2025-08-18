// app/layout.js
"use client";
import "./globals.css";
import ThemeProvider from "../context/ThemeContext";
import { AppProvider } from "../context/AppContext";
import ToastProvider from "../context/ToastContext";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { Suspense, useState } from "react";
import Loader from "@/components/Loader/Loader";
import { DataProvider } from "@/context/DataContext";

export default function RootLayout({ children, feedback }) {
  const [openSideBar, setOpenSideBar] = useState(false);
  return (
    <html lang="en">
      <head>
        <title>Sakaai Simulator</title>
        <meta name="description" content="AI quiz generator — MVP" />
      </head>

      <body>
        <ThemeProvider>
          {/* <AppProvider> */}
          <ToastProvider>
            <DataProvider>
              <Header setOpenSideBar={setOpenSideBar} />
              <Loader />
              <div className="app-layout">
                <Suspense fallback={null}>
                  <aside>
                    <Sidebar
                      openSideBar={openSideBar}
                      setOpenSideBar={setOpenSideBar}
                    />
                  </aside>
                  <main>{children}</main>
                  {feedback}
                </Suspense>
              </div>
            </DataProvider>
          </ToastProvider>
          {/* </AppProvider> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
