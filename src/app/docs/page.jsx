"use client";
import Head from "next/head";
import Script from "next/script";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import swaggerConfig from "../swagger-config.json";
import { Inter } from "next/font/google";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const swaggerUIConfig = {
    defaultModelRendering: "model",
    docExpansion: "none", // Menyembunyikan endpoint secara default agar lebih rapi
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      body {
        background-color: #ffffff !important;
        font-family: 'Inter', sans-serif;
      }

      .swagger-ui .info {
        text-align: center;
        margin-bottom: 20px;
      }

      .swagger-ui .info h1 {
        font-size: 26px;
        font-weight: bold;
        color: #222;
      }

      .swagger-ui .info p {
        font-size: 14px;
        color: #555;
      }

      .swagger-ui .info a {
        color: #007bff;
        font-weight: bold;
        text-decoration: none;
      }

      /* Styling endpoint container */
      .swagger-ui .opblock {
        border-radius: 8px;
        border: 1px solid #ddd;
        margin-bottom: 10px;
        transition: all 0.3s ease-in-out;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
      }

      .swagger-ui .opblock:hover {
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
      }

      .swagger-ui .opblock-tag {
        font-size: 18px;
        font-weight: bold;
        color: #333;
        margin-bottom: 5px;
        padding-left: 10px;
      }

      /* Styling untuk tombol metode HTTP */
      .swagger-ui .opblock-summary-method {
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold;
        padding: 6px 12px;
        min-width: 60px;
        text-align: center;
        margin-right: 10px;
      }

      .swagger-ui .opblock-summary-method-get {
        background-color: #007bff !important;
        color: white !important;
      }

      .swagger-ui .opblock-summary-method-post {
        background-color: #28a745 !important;
        color: white !important;
      }

      /* Styling untuk nama endpoint */
      .swagger-ui .opblock-summary-path {
        font-size: 16px;
        font-weight: bold;
        color: #222;
        flex-grow: 1;
        text-align: left;
      }

      /* Styling untuk tombol Try */
      .swagger-ui .opblock-summary-control {
        margin-left: auto;
      }

      .swagger-ui .try-out {
        background-color: #007bff !important;
        color: white !important;
        font-weight: bold !important;
        padding: 6px 12px !important;
        border-radius: 20px !important;
        transition: all 0.3s ease-in-out;
      }

      .swagger-ui .try-out:hover {
        background-color: #0056b3 !important;
      }

      /* Menyesuaikan input form agar tetap terlihat setelah eksekusi API */
      .swagger-ui .opblock .execute-wrapper {
        display: flex;
        flex-direction: column;
      }

      .swagger-ui .opblock .execute-wrapper input,
      .swagger-ui .opblock .execute-wrapper select {
        border-radius: 5px;
        padding: 6px;
        border: 1px solid #ccc;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <Head>
        <title>VelynAPI Documentation</title>
        <meta name="title" content="VelynAPI - Documentation" />
        <meta name="description" content="VelynAPI is a free, simple REST API for everyone. Enjoy using it without any cost!" />
        <meta property="og:title" content="VelynAPI - Documentation" />
        <meta property="og:description" content="VelynAPI is a free, simple REST API for everyone." />
        <meta property="og:type" content="website" />
      </Head>

      <Script
        id="ld-json-script"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "http://schema.org",
            "@type": "WebSite",
            "name": "VelynAPI",
            "url": "https://apivelyn.vercel.app",
            "description": "VelynAPI is a free, simple REST API for everyone.",
          }),
        }}
      />

      <main className={`p-6 ${inter.className}`}>
        <Analytics />
        <SpeedInsights />
        <div className="bg-white shadow-md rounded-lg p-4">
          <SwaggerUI spec={swaggerConfig} {...swaggerUIConfig} />
        </div>
      </main>
    </>
  );
}
