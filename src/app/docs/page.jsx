"use client";
import Head from "next/head";
import Script from "next/script";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import swaggerConfig from "../swagger-config.json";
import { Inter } from "next/font/google";
import styled from "styled-components";

const inter = Inter({ subsets: ["latin"] });

const Container = styled.main`
  font-family: ${inter.style.fontFamily};
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 1200px;
`;

const StyledSwaggerUI = styled(SwaggerUI)`
  .swagger-ui .opblock {
    border-radius: 12px;
    margin-bottom: 16px;
    border: 2px solid rgba(5, 105, 151, 0.5);
    box-shadow: 0 4px 6px rgba(5, 105, 151, 0.4);
    transition: all 0.3s ease;
  }

  .swagger-ui .opblock:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(11, 117, 153, 0.7);
  }

  .swagger-ui .opblock-summary {
    background: rgba(1, 36, 107, 0.9);
    color: #fff;
    border-bottom: 2px solid rgba(5, 105, 151, 0.6);
  }

  .swagger-ui .opblock-summary-path {
    color: rgba(224, 224, 255, 0.9);
    font-family: monospace;
  }
`;

export default function Home() {
  return (
    <>
      <Head>
        <title>VelynAPI</title>
        <meta name="title" content="VelynAPI - Documentation" />
        <meta name="description" content="VelynAPI is a free, simple REST API created for the common good." />
        <meta property="og:image" content="https://files.catbox.moe/962uqd.jpg" />
      </Head>

      <Script
        id="ld-json-script"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "http://schema.org",
            "@type": "WebSite",
            "name": "VelynAPI",
            "url": "https://ererexidchx.vercel.app",
            "description": "VelynAPI is a free, simple REST API created for the common good.",
          }),
        }}
      />

      <Container>
        <Analytics />
        <SpeedInsights />
        <Card>
          <StyledSwaggerUI spec={swaggerConfig} />
        </Card>
      </Container>
    </>
  );
}
