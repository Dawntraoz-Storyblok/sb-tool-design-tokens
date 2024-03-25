import Head from "next/head";
import { lightTheme } from "@storyblok/mui";
import { CssBaseline, ThemeProvider } from "@mui/material";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Head>
        <title>Design Tokens Reference Tool</title>
        <meta
          name="description"
          content="A Storyblok tool to be able to preview & handle Design Tokens from one place in your stories"
        />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
