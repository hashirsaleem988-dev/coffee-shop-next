"use client";

import Image from "next/image";
import coffeeBeans from "../../assets/coffee-beans1.svg";
import backgroundImage from "../../assets/background-only.svg";
import foregroundImage from "../../assets/foreground-all-objects.svg";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import "./about.css";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

function AboutPage() {
  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const [revealed, setRevealed] = useState({
    hero: false,
    story: false,
  });
  const t = useTranslations("about");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const sectionName = entry.target.dataset.reveal;

          setRevealed((current) => ({
            ...current,
            [sectionName]: true,
          }));

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    [heroRef.current, storyRef.current].forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />

      <main className="about-page" id="about">
        {/* About Us banner */}
        <section
          ref={heroRef}
          className={`about-hero ${revealed.hero ? "about-revealed" : ""}`}
          data-reveal="hero"
          aria-labelledby="about-title"
        >
          <div className="about-hero-media">
            <Image
              src={backgroundImage}
              alt=""
              fill
              priority
              sizes="(max-width: 850px) 100vw, 50vw"
              className="about-hero-background"
              aria-hidden="true"
            />

            <Image
              src={foregroundImage}
              alt="Freshly roasted coffee beans and coffee ingredients"
              fill
              priority
              sizes="(max-width: 850px) 100vw, 50vw"
              className="about-hero-foreground"
            />
          </div>

          <div className="about-hero-content">
            <span className="about-eyebrow">
              <span aria-hidden="true">◉</span>
              {t("eyebrow")}
            </span>

            <h1 id="about-title">
              {t("titleFirst")}
              <br />
              <span>{t("titleSecond")}</span>
            </h1>

            <p>
              {t("description")}
            </p>
          </div>
        </section>

        {/* Mission and vision section */}
        <section
          ref={storyRef}
          className={`about-story ${revealed.story ? "about-revealed" : ""}`}
          data-reveal="story"
          aria-label={t("missionLabel")}
        >
          <div className="about-beans about-beans-left" aria-hidden="true">
            <Image src={coffeeBeans} alt="" fill sizes="280px" />
          </div>

          <div className="about-beans about-beans-right" aria-hidden="true">
            <Image src={coffeeBeans} alt="" fill sizes="280px" />
          </div>

          <div className="about-story-content">
            <article className="about-info-card">
              <div className="about-info-copy">
                <h2>{t("missionTitle")}</h2>
                <p>{t("missionText")}</p>
              </div>

              <div className="about-info-image">
                <Image
                  src="/about/mission.png"
                  alt={t("missionAlt")}
                  fill
                  sizes="(max-width: 850px) 80vw, 260px"
                />
              </div>
            </article>

            <article className="about-info-card">
              <div className="about-info-copy">
                <h2>{t("visionTitle")}</h2>
                <p>{t("visionText")}</p>
              </div>

              <div className="about-info-image">
                <Image
                  src="/about/vision.png"
                  alt={t("visionAlt")}
                  fill
                  sizes="(max-width: 850px) 80vw, 260px"
                />
              </div>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default AboutPage;
