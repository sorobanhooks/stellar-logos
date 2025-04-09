import './globals.css';
import Provider from './provider';



export const metadata = {
  title: 'Stellar Logo NFT',
  description: 'Own Your Stellar Identity! 10,000 unique logos for the Stellar community.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
