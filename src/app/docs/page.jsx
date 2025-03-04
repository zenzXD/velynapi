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
    setCategories(Object.entries(categoryCount).map(([name, count]) => ({ name, count })));
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
          {/* Total Endpoints */}
          <h1 className="total-endpoints">Total Endpoints: {totalEndpoints}</h1>

          {/* Category Buttons */}
          <div className="category-container">
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <button
                  key={index}
                  className={`category-button ${selectedCategory === category.name ? "active" : ""}`}
                  onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                >
                  {category.name} ({category.count})
                  <span className="arrow">{selectedCategory === category.name ? "▲" : "▶"}</span>
                </button>
              ))
            ) : (
              <p>Tidak ada kategori tersedia</p>
            )}
          </div>

          {/* Modal Swagger UI */}
          {selectedCategory && (
            <div className="modal">
              <span className="close-btn" onClick={() => setSelectedCategory(null)}>✖</span>

              <div className="swagger-container">
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
          padding: 20px;
        }

        .total-endpoints {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .category-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          justify-content: center;
          align-items: center;
        }

        .category-button {
          width: 80%;
          background: #181842;
          padding: 14px 18px;
          border-radius: 8px;
          color: white;
          font-size: 18px;
          font-weight: bold;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease-in-out;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 6px rgba(90, 12, 163, 0.4);
        }

        .category-button:hover {
          background: #20205a;
          transform: scale(1.05);
        }

        .category-button.active {
          background: #251d6d;
          box-shadow: 0 6px 10px rgba(74, 12, 131, 0.5);
        }

        .arrow {
          font-size: 16px;
          transition: transform 0.3s ease-in-out;
        }

        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 95%;
          max-width: 900px;
          height: 80vh;
          background: #220f40;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
          overflow-y: auto;
          z-index: 1000;
          animation: fadeIn 0.3s ease-in-out;
        }

        .swagger-container {
          padding: 10px;
          background: #1a1a3d;
          border-radius: 10px;
          max-height: 100%;
          overflow-y: auto;
        }

        .close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
          color: white;
          background: red;
          padding: 5px;
          border-radius: 50%;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -60%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        @media (max-width: 768px) {
          .category-button {
            width: 100%;
            font-size: 16px;
          }

          .modal {
            width: 100%;
            height: 90vh;
          }

          .swagger-container {
            padding: 5px;
          }
        }
      `}</style>
    </>
  );
}
