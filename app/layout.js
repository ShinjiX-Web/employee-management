import "./globals.css";

const themeScript = `
  (() => {
    const storageKey = "employee-management-theme";
    const root = document.documentElement;

    try {
      const storedTheme = window.localStorage.getItem(storageKey);
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : systemPrefersDark ? "dark" : "light";

      root.classList.toggle("dark", theme === "dark");
      root.style.colorScheme = theme;
    } catch {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
  })();
`;

export const metadata = {
  title: "Employee Management System",
  description: "A Next.js and shadcn/ui employee management system for handling employee records and HR transactions."
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
