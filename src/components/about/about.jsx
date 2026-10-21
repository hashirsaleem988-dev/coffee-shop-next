"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import {
  GiCoffeeBeans,
  GiCoffeeCup,
  GiCoffeeMug,
  GiCoffeePot,
} from "react-icons/gi";

import backgroundImage from "../../assets/background-only.svg";
import foregroundImage from "../../assets/foreground-all-objects.svg";

import "./about.css";

const aboutFeatures = [
  {
    icon: GiCoffeeBeans,
    key: "premiumBeans",
  },
  {
    icon: GiCoffeeCup,
    key: "organicCoffee",
  },
  {
    icon: GiCoffeeMug,
    key: "freshlyRoasted",
  },
  {
    icon: GiCoffeePot,
    key: "expertBaristas",
  },
];

function About() {
  const aboutRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations("home.aboutSection");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={aboutRef}
      className={`about-section ${isVisible ? "about-visible" : ""}`}
      id="about"
    >
      <Image
        src={backgroundImage}
        alt=""
        fill
        sizes="100vw"
        className="about-background"
        aria-hidden="true"
      />

      <Image
        src={foregroundImage}
        alt={t("coffeeAlt")}
        width={1400}
        height={1000}
        sizes="82vw"
        className="about-foreground"
      />

      <div className="about-content">
        <span className="about-label">{t("label")}</span>

        <h2 className="about-title">
          {t("titleFirst")}
          <br />
          <span>{t("titleSecond")}</span>
        </h2>

        <p className="about-description">{t("description")}</p>

        <div className="about-features">
          {aboutFeatures.map(({ icon: Icon, key }) => (
            <div className="about-feature" key={key}>
              <div className="about-feature-icon">
                <Icon aria-hidden="true" />
              </div>

              <span>{t(`features.${key}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;