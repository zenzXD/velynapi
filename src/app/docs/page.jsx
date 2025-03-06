"use client";
import Head from "next/head";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import swaggerConfig from "../swagger-config.json";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [totalEndpoints, setTotalEndpoints] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let count = 0;
    const categoryCount = {};

    if (swaggerConfig && swaggerConfig.paths) {
      Object.entries(swaggerConfig.paths).forEach(([path, methods]) => {
        Object.entries(methods).forEach(([method, details]) => {
          if (details && details.tags) {
            count++;
            details.tags.forEach((tag) => {
              if (!categoryCount[tag]) {
                categoryCount[tag] = 0;
              }
              categoryCount[tag]++;
            });
          }
        });
      });
    }

    setTotalEndpoints(count);
    setCategories(
      Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    );
  }, [swaggerConfig]);

  return (
    <>
      <Head>
        <title>VelynAPI</title>
        <meta name="description" content="VelynApi is a free, simple REST API." />
      </Head>

      <main className={`min-h-screen flex flex-col items-center ${inter.className}`} style={{ backgroundColor: "#0d0d1a", color: "white" }}>
        <Analytics />
        <SpeedInsights />

        <div className="container">
          {/* Total Endpoints Header */}
          <div className="endpoints-header">
            <h1 className="total-endpoints">
              Total Endpoints: 
              <span className="endpoint-count">{totalEndpoints}</span>
            </h1>
          </div>

          {/* Category Buttons Grid */}
          <div className="category-grid">
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <button
                  key={index}
                  className={`category-card ${selectedCategory === category.name ? "active" : ""}`}
                  onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                >
                  {selectedCategory === category.name && (
                    <span className="close-icon">✖</span>
                  )}
                  <div className="category-content">
                    <span className="category-name">{category.name}</span>
                    <span className="category-endpoint-count">{category.count} endpoint</span>
                  </div>
                  <span className="expand-icon">
                    {selectedCategory === category.name ? "▲" : "▶"}
                  </span>
                </button>
              ))
            ) : (
              <p>Tidak ada kategori tersedia</p>
            )}
          </div>

          {/* Modal Swagger UI */}
          {selectedCategory && (
            <div className="swagger-modal">
              <div className="swagger-modal-content">
                <span 
                  onClick={() => setSelectedCategory(null)} 
                  className="close-modal-button"
                >
                  ✖
                </span>

                <SwaggerUI
                  spec={{
                    ...swaggerConfig,
                    info: {},
                    paths: Object.fromEntries(
                      Object.entries(swaggerConfig.paths).filter(([_, value]) =>
                        Object.values(value).some((method) => method.tags?.includes(selectedCategory))
                      )
                    ),
                  }}
                  docExpansion="none"
                  defaultModelsExpandDepth={-1}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`                 
        .container {
          width: 90%;
          max-width: 1200px;
          text-align: center;
        }

        .total-endpoints {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .endpoint-count {
          background: #5a0ca3;
          padding: 5px 15px;
          border-radius: 8px;
          font-size: 22px;
        }

        .category-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          justify-content: center;
          align-items: center;
        }

        .category-card {
          width: 90%;
          background: #181842;
          padding: 15px;
          border-radius: 8px;
          color: white;
          font-size: 18px;
          font-weight: bold;
          border: none;
          cursor: pointer;
          transition: 0.3s ease-in-out;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 6px rgba(90, 12, 163, 0.4);
        }

        .category-card:hover {
          background: #20205a;
          transform: scale(1.05);
        }

        .category-card.active {
          background: #251d6d;
          transform: translateY(-5px);
        }

        .category-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex-grow: 1;
        }

        .swagger-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 1000px;
          height: 80vh;
          background: rgb(1, 12, 21);
          border-radius: 15px;
          padding: 20px;
          z-index: 1000;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        }

        .close-modal-button {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 20px;
          cursor: pointer;
          color: white;
        }
      `}</style>

      <style jsx global>{`
       /* Swagger UI Styling with Modern, Soft Design */
        .swagger-ui {
          background: transparent !important;
          color: white !important;
        }

        .swagger-ui .topbar {
          display: none;
        }

        .swagger-ui .opblock {
          border-radius: 12px !important;
          margin-bottom: 16px !important;
          overflow: hidden !important;
          box-shadow: 0 4px 6px rgb(5, 105, 151) !important;
          transition: all 0.3s ease !important;
        }

        .swagger-ui .opblock:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 6px 12px rgba(11, 117, 153, 0.89) !important;
        }

        .swagger-ui .opblock-summary {
          padding: 12px 16px !important;
          background: rgba(1, 36, 107, 0.99) !important;
        }

        .swagger-ui .opblock-summary-method {
          border-radius: 6px !important;
          font-weight: bold !important;
          padding: 6px 12px !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
        }

        .swagger-ui .opblock-summary-method-get {
          background: rgba(14, 68, 128, 0.46) !important;
          color:rgb(184, 197, 213) !important;
          border: 1px solid rgba(74, 144, 226, 0.5) !important;
        }

        .swagger-ui .opblock-summary-method-post {
          background: rgba(46, 204, 113, 0.2) !important;
          color: #2ecc71 !important;
          border: 1px solid rgba(46, 204, 113, 0.5) !important;
        }

        .swagger-ui .opblock-summary-path {
          color: rgba(224, 224, 255, 0.7) !important;
          font-family: 'monospace' !important;
        }

        .swagger-ui .btn {
          background:rgb(29, 12, 46) !important;
          color: white !important;
          border-radius: 8px !important;
          transition: all 0.3s ease !important;
        }

        .swagger-ui .btn:hover {
          background:rgb(4, 70, 121) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 6px rgba(0,0,0,0.2) !important;
        }
      `}</style>
    </>
  );
}
