import styles from "./pricing.module.css";
import { FaCheckCircle } from "react-icons/fa";

export const metadata = {
  title: "Pricing Page",
  description: "Pricing description",
};

const PricingPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.textContainer}>
        <h2 className={styles.subtitle}>Pilih Paket Harga Kami</h2>
        <p className={styles.desc}>
          Dapatkan akses ke API Velyn dengan performa terbaik dan tanpa batasan. 
          Pilih paket yang sesuai dengan kebutuhan Anda dan nikmati layanan API berkualitas tinggi.
        </p>
      </div>

      <div className={styles.pricingBoxes}>
        {[ 
          {
            title: "Free Plan",
            price: "Rp 0 / 5 day",
            features: [
              "3,000 / Limit",
              "Akses ke semua endpoint"
          ],
            button: "Mulai Sekarang"
          },
          {
            title: "Pro Plan",
            price: "Rp 15,000 / 15 day",
            features: [
              "10,000 / Limit",
              "Akses ke semua endpoint",
              "Dukungan prioritas 24/7",
              "Standard plan User"
            ],
            button: "Langganan",
            highlight: true
          },
          {
            title: "Premium Plan",
            price: "Rp 25,000 / 30 day",
            features: [
              "20,000 / Limit",
              "Akses ke endpoint dasar",
              "Dukungan prioritas 24/8",
              "Premium User",
              "fast respon Endpoint"
            ],
            button: "Langganan",
            highlight: true
          },
        ].map((plan, index) => (
          <div key={index} className={`${styles.pricingBox} ${plan.highlight ? styles.popular : ""}`}>
            <h3 className={styles.planTitle}>{plan.title}</h3>
            <p className={styles.price}>{plan.price}</p>
            <ul className={styles.features}>
              {plan.features.map((feature, i) => (
                <li key={i}><FaCheckCircle className={styles.icon} /> {feature}</li>
              ))}
            </ul>
            <button className={styles.button}>{plan.button}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;
