import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }
  render() {
    return (
      <Html lang="en-EN">
        <Head>
          <meta charset="utf-8" />
          <link rel="icon" href="/favicon.ico" />
          <meta name="theme-color" content="#000000" />
          <meta name="title" content="MOOD" />
          <meta
            name="description"
            content="MOOD is a social media app where you can share your current mood with everyone!"
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="twitter:domain" content="mood-23f44.web.app" />
          <meta
            property="twitter:url"
            content="https://mood-23f44.web.app/home"
          />
          <meta name="twitter:title" content="MOOD" />
          <meta
            name="twitter:description"
            content="MOOD is a social media app where you can share your current mood with everyone!"
          />
          <meta
            name="twitter:image"
            content="https://i.ibb.co/Dw0r08f/logo512.png"
          />
          <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
          <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
        </Head>
        <body className="bg-secondary dark:bg-black overflow-x-hidden ">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
