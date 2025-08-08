// app/layout.js
import "./globals.css";
import ThemeProvider from "../context/ThemeContext";
import { AppProvider } from "../context/AppContext";
import ToastProvider from "../context/ToastContext";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";

export const metadata = {
  title: "Sakaai Simulator",
  description: "AI quiz generator — MVP",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AppProvider>
            <ToastProvider>
              <Header />
              <div className="app-layout">
                <aside>
                  <Sidebar />
                </aside>
                <main>{children}</main>
              </div>
            </ToastProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
