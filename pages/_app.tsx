import type { AppProps } from 'next/app'
import '../src/index.css'
import App from '../src/App'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <App />
}