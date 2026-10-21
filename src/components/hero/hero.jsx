"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import backgroundImage from "../../assets/bg.png";
import coffeeBeansIcon from "../../assets/coffee-beans.svg";
import coffeeAnimation from "../../assets/coffee-set-animation.svg";

import "./hero.css";

function Hero() {
  const t = useTranslations("home.hero");

  return (
    <section className="hero" id="home">
      <Image
        src={backgroundImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="hero-background"
        aria-hidden="true"
      />

      <div className="hero-content">
        <div className="hero-badge">
          <Image
            src={coffeeBeansIcon}
            alt=""
            width={22}
            height={22}
            className="hero-badge-icon"
          />

          <span>{t("badge")}</span>
        </div>

        <h1 className="hero-title">
          <span className="hero-title-line">
            {t("titleFirst")}
          </span>

          <span className="hero-title-line">
            {t("titleSecond")}{" "}
            <strong className="soft-brown">
              {t("titleAccent")}
            </strong>
          </span>
        </h1>

        <p>{t("description")}</p>

        <div className="hero-buttons">
          <a href="#menu" className="order-btn">
            {t("orderNow")}
          </a>

          <a href="#menu" className="explore-btn">
            {t("exploreMenu")}
          </a>
        </div>
      </div>

      <div className="hero-visual-space">
        <Image
          src={coffeeAnimation}
          alt={t("coffeeAlt")}
          width={820}
          height={620}
          className="coffee-animation"
        />
      </div>
    </section>
  );
}

export default Hero;