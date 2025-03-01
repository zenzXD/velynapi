import Image from "next/image";
import styles from "./pricing.module.css";

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

        <div className={styles.pricingBoxes}>
          <div className={styles.pricingBox}>
            <h3 className={styles.planTitle}>Gratis</h3>
            <p className={styles.price}>Rp 0 / bulan</p>
            <ul className={styles.features}>
              <li>✔ 10,000 permintaan per bulan</li>
              <li>✔ Akses ke endpoint dasar</li>
              <li>✖ Dukungan prioritas</li>
            </ul>
            <button className={styles.button}>Mulai Sekarang</button>
          </div>

          <div className={`${styles.pricingBox} ${styles.popular}`}>
            <h3 className={styles.planTitle}>Pro</h3>
            <p className={styles.price}>Rp 99.000 / bulan</p>
            <ul className={styles.features}>
              <li>✔ 100,000 permintaan per bulan</li>
              <li>✔ Akses ke semua endpoint</li>
              <li>✔ Dukungan prioritas 24/7</li>
            </ul>
            <button className={styles.button}>Langganan</button>
          </div>

          <div className={styles.pricingBox}>
            <h3 className={styles.planTitle}>Enterprise</h3>
            <p className={styles.price}>Hubungi Kami</p>
            <ul className={styles.features}>
              <li>✔ Permintaan tanpa batas</li>
              <li>✔ Akses premium ke fitur eksklusif</li>
              <li>✔ Dukungan khusus</li>
            </ul>
            <button className={styles.button}>Hubungi Kami</button>
          </div>
        </div>
      </div>

      <div className={styles.imgContainer}>
        <Image
          src="/pricing.png"
          alt="Pricing Image"
          width={500}
          height={500}
          className={styles.img}
        />
      </div>
    </div>
  );
};

export default PricingPage;
