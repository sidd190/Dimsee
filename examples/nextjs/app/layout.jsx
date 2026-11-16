import React from 'react';

export const metadata = {
  title: 'Dimsee Next.js Demo',
  description: 'Authentication integration with Next.js App Router'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
