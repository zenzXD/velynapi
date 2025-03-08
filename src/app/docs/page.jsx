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
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      body {
        background-color: #ffffff;
        font-family: 'Inter', sans-serif;
      }

      .swagger-ui .info .title {
        font-size: 28px;
        font-weight: bold;
        color: #000;
        margin-bottom: 10px;
      }

      .swagger-ui .info {
        text-align: center;
      }

      .swagger-ui .opblock {
        border-radius: 10px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 12px;
      }

      .swagger-ui .opblock .opblock-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8f8f8;
        padding: 10px 15px;
        border-radius: 10px;
      }

      .swagger-ui .opblock-summary-method {
        background: #444;
        color: white;
        font-weight: bold;
        padding: 8px 15px;
        border-radius: 8px;
      }

      .swagger-ui .opblock-summary-description {
        flex-grow: 1;
        margin-left: 10px;
        font-size: 16px;
      }

      .swagger-ui .try-out {
        background: #3498db;
        color: white;
        font-weight: bold;
        padding: 8px 12px;
        border-radius: 8px;
      }

      .swagger-ui .opblock:hover {
        border-color: #ddd;
      }

      .swagger-ui .scheme-container {
        display: none;
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
        <title>VelynAPI</title>
        <meta name="description" content="Dokumentasi API Velyn yang responsif dan modern." />
      </Head>
      <Script
        id="ld-json-script"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "http://schema.org",
            "@type": "WebSite",
            "name": " VelynAPI",
            "url": "https://velyn.vercel.app",
            "description": "Dokumentasi API Velyn dengan tampilan modern dan mudah digunakan.",
          }),
        }}
      />
      <main className={`p-6 ${inter.className}`}>
        <Analytics />
        <SpeedInsights />
        <div className="bg-white shadow-md rounded-lg p-4">
          <SwaggerUI spec={swaggerConfig} />
        </div>
      </main>
    </>
  );
}
