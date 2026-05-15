import "./styles.css";

export const metadata = {
  title: "Paper Trails",
  description: "A private note printer for two people"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
