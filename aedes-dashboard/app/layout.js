import "./globals.css";

export const metadata = {
  title: "serv_aerial - Vector Habitat Surveillance",
  description: "Autonomous Edge-AI Dengue Breeding Site Detection System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ margin: 0, padding: 0, background: '#0f172a', color: '#fff' }}>
        {children}
      </body>
    </html>
  );
}
