import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { Inter, Roboto, Playfair_Display, Montserrat, Oswald } from 'next/font/google'

// Configure fonts with CSS variables
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
})

const roboto = Roboto({ 
  weight: ['400', '700'], 
  subsets: ['latin'], 
  variable: '--font-roboto',
  display: 'swap',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair',
  display: 'swap',
})

const montserrat = Montserrat({ 
  subsets: ['latin'], 
  variable: '--font-montserrat',
  display: 'swap',
})

const oswald = Oswald({ 
  subsets: ['latin'], 
  variable: '--font-oswald',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${roboto.variable} ${playfair.variable} ${montserrat.variable} ${oswald.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}