"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import faqBackground from "../../assets/faq-coffee-background-clean.svg";
import faqForeground from "../../assets/faq-coffee-foreground.svg";
import coffeeBeans from "../../assets/coffee-beans1.svg";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

import "./faqs.css";

const faqItems = ["one", "two", "three", "four", "five", "six", "seven"];

function FaqPage() {
  const bannerRef = useRef(null);
  const faqRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(0);
  const [revealed, setRevealed] = useState({
    banner: false,
    faq: false,
  });
  const t = useTranslations("faq");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const revealName = entry.target.dataset.reveal;

          setRevealed((current) => ({
            ...current,
            [revealName]: true,
          }));

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );

    [bannerRef.current, faqRef.current]
      .filter(Boolean)
      .forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const toggleQuestion = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <>
      <Navbar />

      <main className="faq-page">
        <section
          ref={bannerRef}
          className={`faq-page-banner ${
            revealed.banner ? "faq-revealed" : ""
          }`}
          data-reveal="banner"
          aria-labelledby="faq-page-title"
        >
          <div className="faq-page-banner-media" aria-hidden="true">
            <div className="faq-page-banner-background">
              <Image
                src={faqBackground}
                alt=""
                fill
                priority
                sizes="100vw"
              />
            </div>

            <div className="faq-page-banner-foreground">
              <Image
                src={faqForeground}
                alt=""
                fill
                priority
                sizes="(max-width: 850px) 100vw, 62vw"
              />
            </div>
          </div>

          <div className="faq-page-banner-copy">
            <span className="faq-page-eyebrow">{t("eyebrow")}</span>

            <h1 id="faq-page-title">
              {t("titleFirst")}
              <br />
              <span>{t("titleSecond")}</span>
            </h1>

            <p>
              {t("description")}
            </p>
          </div>
        </section>

        <section
          ref={faqRef}
          className={`faq-list-section ${revealed.faq ? "faq-revealed" : ""}`}
          data-reveal="faq"
          aria-labelledby="faq-list-title"
        >
          <div className="faq-beans faq-beans-left" aria-hidden="true">
            <Image src={coffeeBeans} alt="" fill sizes="250px" />
          </div>

          <div className="faq-beans faq-beans-right" aria-hidden="true">
            <Image src={coffeeBeans} alt="" fill sizes="250px" />
          </div>

          <h2 id="faq-list-title">{t("listTitle")}</h2>

          <div className="faq-list">
            {faqItems.map((itemKey, index) => {
              const isOpen = openIndex === index;

              return (
                <article
                  className={`faq-item ${isOpen ? "is-open" : ""}`}
                  key={itemKey}
                  style={{ "--faq-delay": `${index * 0.08}s` }}
                >
                  <button
                    type="button"
                    className="faq-question"
                    aria-expanded={isOpen}
                    onClick={() => toggleQuestion(index)}
                  >
                    <span>{t(`items.${itemKey}.question`)}</span>
                    <span className="faq-toggle" aria-hidden="true">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  <div className="faq-answer" aria-hidden={!isOpen}>
                    <p>{t(`items.${itemKey}.answer`)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default FaqPage;
