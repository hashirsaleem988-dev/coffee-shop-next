"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import galleryBackground from "../../assets/gallery-background.svg";
import galleryForeground from "../../assets/gallery-foreground.svg";
import coffeeBeans from "../../assets/coffee-beans1.svg";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

import "./gallery.css";

const galleryImages = [
  ["coffee-collage-01-croissant-cup.png", "one"],
  ["coffee-collage-02-coffee-grinder.png", "two"],
  ["coffee-collage-03-latte-pour.png", "three"],
  ["coffee-collage-04-espresso-pour.png", "four"],
  ["coffee-collage-05-steaming-cup.png", "five"],
  ["coffee-collage-06-brownie.png", "six"],
  ["coffee-collage-07-coffee-clock.png", "seven"],
  ["coffee-collage-08-coffee-shop.png", "eight"],
  ["coffee-collage-09-iced-coffee.png", "nine"],
  ["coffee-collage-10-coffee-beans-bag.png", "ten"],
];

function GalleryPage() {
  const bannerRef = useRef(null);
  const galleryRef = useRef(null);
  const [revealed, setRevealed] = useState({
    banner: false,
    gallery: false,
  });
  const t = useTranslations("gallery");

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

    [bannerRef.current, galleryRef.current]
      .filter(Boolean)
      .forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />

      <main className="gallery-page">
        <section
          ref={bannerRef}
          className={`gallery-page-banner ${
            revealed.banner ? "gallery-revealed" : ""
          }`}
          data-reveal="banner"
          aria-labelledby="gallery-page-title"
        >
          <div className="gallery-page-banner-media" aria-hidden="true">
            <div className="gallery-page-banner-background">
              <Image
                src={galleryBackground}
                alt=""
                fill
                priority
                sizes="100vw"
              />
            </div>

            <div className="gallery-page-banner-foreground">
              <Image
                src={galleryForeground}
                alt=""
                fill
                priority
                sizes="(max-width: 850px) 100vw, 62vw"
              />
            </div>
          </div>

          <div className="gallery-page-banner-copy">
            <span className="gallery-page-eyebrow">{t("eyebrow")}</span>

            <h1 id="gallery-page-title">
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
          ref={galleryRef}
          className={`gallery-grid-section ${
            revealed.gallery ? "gallery-revealed" : ""
          }`}
          data-reveal="gallery"
          aria-labelledby="gallery-grid-title"
        >
          <div className="gallery-beans gallery-beans-left" aria-hidden="true">
            <Image src={coffeeBeans} alt="" fill sizes="250px" />
          </div>

          <div className="gallery-beans gallery-beans-right" aria-hidden="true">
            <Image src={coffeeBeans} alt="" fill sizes="250px" />
          </div>

          <h2 id="gallery-grid-title">{t("gridTitle")}</h2>

          <div className="gallery-grid">
            {galleryImages.map(([image, altKey], index) => (
              <figure
                className={`gallery-card gallery-card-${index + 1}`}
                key={image}
                style={{ "--gallery-delay": `${index * 0.08}s` }}
              >
                <Image
                  src={`/gallery/${image}`}
                  alt={t(`alts.${altKey}`)}
                  fill
                  sizes="(max-width: 850px) 50vw, 25vw"
                />
              </figure>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default GalleryPage;
