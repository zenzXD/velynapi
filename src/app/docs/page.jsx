"use client";
import Head from "next/head";
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
        background-color: #f9f9f9;
        font-family: 'Inter', sans-serif;
      }

      .container {
        max-width: 900px;
        margin: 20px auto;
        padding: 20px;
        background: white;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
      }

      .swagger-ui .opblock {
        border-radius: 8px;
        margin-bottom: 10px;
      }

      .swagger-ui .opblock-summary-method {
        background-color: #444 !important;
        color: white !important;
        border-radius: 5px;
        padding: 5px 10px;
      }

      .swagger-ui .opblock-summary-control {
        background-color: #1e90ff !important;
        color: white !important;
        border-radius: 5px;
        padding: 5px 10px;
      }

      .title {
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
      }

      /* Styling untuk input agar tetap terlihat */
      .swagger-ui .opblock .opblock-section {
        display: block !important;
      }

      .swagger-ui .opblock .parameters-container {
        display: block !important;
        background: #f5f5f5;
        padding: 15px;
        border-radius: 5px;
      }

      .swagger-ui .execute-wrapper {
        margin-top: 10px;
      }

      .swagger-ui .response {
        margin-top: 15px;
        background: #eef6ff;
        padding: 10px;
        border-radius: 5px;
      }

      /* Style tambahan untuk input */
      .swagger-ui input[type="text"],
      .swagger-ui input[type="email"],
      .swagger-ui input[type="file"],
      .swagger-ui input[type="password"],
      .swagger-ui input[type="search"],
      .swagger-ui textarea {
        width: 100%;
        padding: 10px;
        margin: 5px 0;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 14px;
      }

      .swagger-ui input:focus,
      .swagger-ui textarea:focus {
        border-color: #1e90ff;
        outline: none;
        box-shadow: 0 0 5px rgba(30, 144, 255, 0.5);
      }

      .swagger-ui .btn.execute {
        background-color: #1e90ff !important;
        color: white !important;
        border-radius: 5px;
        padding: 8px 15px;
        font-size: 14px;
        cursor: pointer;
        border: none;
      }

      .swagger-ui .btn.execute:hover {
        background-color: #0078e7 !important;
      }

      .swagger-ui .btn.cancel {
        background-color: #ff4d4d !important;
        color: white !important;
        border-radius: 5px;
        padding: 8px 15px;
        font-size: 14px;
        cursor: pointer;
        border: none;
      }

      .swagger-ui .btn.cancel:hover {
        background-color: #cc0000 !important;
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
        <meta name="title" content="VelynAPI - Documentation" />
        <meta name="description" content="VelynAPI is a free and simple REST API for developers." />
      </Head>

      <main className={`p-6 ${inter.className}`}>
        <Analytics />
        <SpeedInsights />
        
        <div className="container">
          <h1 className="title">SazxOfficial API</h1>
          <SwaggerUI spec={swaggerConfig} />
        </div>
      </main>
    </>
  );
}
