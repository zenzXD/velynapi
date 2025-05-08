import styles from "./footer.module.css";

const Footer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>zennz</div>
      <div className={styles.text}>
        zennz-api-team © All rights reserved 2025.
      </div>
    </div>
  );
};

export default Footer;
