"use client";

import { FiFacebook, FiInstagram, FiTwitter } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import "./footer.css";

const quickLinks = [
  ["home", "/#home"],
  ["about", "/about"],
  ["menu", "/menu"],
  ["faqs", "/faqs"],
  ["gallery", "/gallery"],
];

const aboutLinks = [
  ["craftedRich", "/about"],
  ["cozyMoments", "/about"],
  ["richFlavors", "/menu"],
  ["comfortPlace", "/about"],
];

function Footer() {
  const footerRef = useRef(null);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const t = useTranslations("footer");
  const navT = useTranslations("nav");

  useEffect(() => {
    const footer = footerRef.current;

    if (!footer) return undefined;

  if (!("IntersectionObserver" in window)) {
  const frame = window.requestAnimationFrame(() => {
    setIsFooterVisible(true);
  });

  return () => window.cancelAnimationFrame(frame);
}

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setIsFooterVisible(true);
        observer.disconnect();
      },
      { threshold: 0.2 }
    );

    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`ending-footer ${
        isFooterVisible ? "ending-footer-visible" : ""
      }`}
      id="contact"
      suppressHydrationWarning
    >
      <div className="ending-footer-cream" aria-hidden="true" />
      <div className="ending-footer-left-slot" aria-hidden="true" />

      <div className="ending-footer-brown">
        <div className="ending-footer-content">
          <div className="ending-footer-brand">
            <p>
              {t("description")}
            </p>

            <div
              className="ending-footer-socials"
              aria-label={t("socialLinks")}
            >
              <a href="#instagram" aria-label="Instagram">
                <FiInstagram />
              </a>
              <a href="#twitter" aria-label="Twitter">
                <FiTwitter />
              </a>
              <a href="#facebook" aria-label="Facebook">
                <FiFacebook />
              </a>
            </div>
          </div>

          <div className="ending-footer-divider" aria-hidden="true" />

          <nav className="ending-footer-column" aria-label={t("quickLinks")}>
            <h2>{t("quickLinks")}</h2>
            {quickLinks.map(([key, href]) => (
              <a href={href} key={key}>
                {navT(key)}
              </a>
            ))}
          </nav>

          <nav className="ending-footer-column" aria-label={t("aboutUs")}>
            <h2>{t("aboutUs")}</h2>
            {aboutLinks.map(([key, href]) => (
              <a href={href} key={key}>
                {t(key)}
              </a>
            ))}
          </nav>

          <div className="ending-footer-column ending-footer-contact">
            <h2>{t("contactUs")}</h2>
            <a href="tel:+8135850000">+813 5850000</a>
            <a href="tel:+5234566780">+523 456 6780</a>
            <a href="mailto:coffee@shop.com">coffeeshop.com</a>
            <a href="https://www.coffeeshop.com">www.coffeeshop.com</a>
          </div>
        </div>
      </div>

      <div className="ending-footer-bottom">
        <p>{t("designedBy")}</p>

        <div className="ending-footer-legal">
          <a href="#privacy">{t("privacy")}</a>
          <span aria-hidden="true" />
          <a href="#terms">{t("terms")}</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
