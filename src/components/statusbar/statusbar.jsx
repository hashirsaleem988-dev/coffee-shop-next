"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import {
  GiCoffeeCup,
  GiTeapotLeaves,
  GiCoffeeBeans,
  GiCoffeeMug,
  GiCoffeePot,
  GiArchiveResearch,
} from "react-icons/gi";

import "./statusbar.css";

const statusItems = [
  { icon: GiCoffeeCup, key: "coffeeHouse" },
  { icon: GiTeapotLeaves, key: "urbanBrew" },
  { icon: GiCoffeeBeans, key: "roastCo" },
  { icon: GiCoffeeMug, key: "brownCup" },
  { icon: GiCoffeePot, key: "dailyBrew" },
  { icon: GiArchiveResearch, key: "coffeeHub" },
];

function Statusbar() {
  const statusbarRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations("home.statusbar");

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

    if (statusbarRef.current) {
      observer.observe(statusbarRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const renderItems = (hidden = false) =>
    statusItems.map(({ icon: Icon, key }, index) => (
      <div
        className="statusbar-item"
        key={`${hidden ? "second" : "first"}-${key}-${index}`}
        aria-hidden={hidden}
      >
        <Icon className="statusbar-icon" />
        <span>{t(`items.${key}`)}</span>
      </div>
    ));

  return (
    <section
      ref={statusbarRef}
      className={`statusbar ${
        isVisible ? "statusbar-scroll-visible" : ""
      }`}
    >
      <div className="statusbar-scroll-content">
        <h2 className="statusbar-title">
          {t("titleBefore")} <span>{t("count")}</span>{" "}
          {t("titleAfter")}
        </h2>

        <div className="statusbar-slider">
          <div className="statusbar-track">
            {renderItems()}
            {renderItems(true)}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Statusbar;