"use client";

import Image from "next/image";
import {
  FiAward,
  FiCoffee,
  FiHeart,
  FiPlus,
  FiTruck,
} from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import coffeeBeans from "../../assets/coffee-beans1.svg";
import "./menu.css";

const fallbackMenuItems = [
  {
    key: "mochaFrappe",
    price: "$6.99",
    image: "/menu/mocha-frappe.png",
  },
  {
    key: "affogato",
    price: "$5.49",
    image: "/menu/affogato.png",
  },
  {
    key: "cappuccino",
    price: "$4.99",
    image: "/menu/cappuccino.png",
  },
  {
    key: "cocoaTiramisu",
    price: "$6.49",
    image: "/menu/tiramisu.png",
  },
  {
    key: "honeyWaffle",
    price: "$7.99",
    image: "/menu/waffle.png",
  },
  {
    key: "chocoCookies",
    price: "$3.99",
    image: "/menu/cookies.png",
  },
];

const whyChooseUs = [
  {
    icon: FiCoffee,
    key: "fresh",
  },
  {
    icon: FiHeart,
    key: "organic",
  },
  {
    icon: FiAward,
    key: "baristas",
  },
  {
    icon: FiTruck,
    key: "delivery",
  },
];

const customerReviews = [
  {
    name: "Aras",
    initial: "A",
    textKey: "reviews.text",
  },
  {
    name: "Teoman",
    initial: "T",
    textKey: "reviews.text",
  },
  {
    name: "Deniz Kiz",
    initial: "D",
    textKey: "reviews.text",
  },
  {
    name: "Leyla",
    initial: "L",
    textKey: "reviews.text",
  },
];

const CART_STORAGE_KEY = "coffee-cart";

function useSectionVisibility(sectionRef, threshold) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return undefined;
    }

    if (!("IntersectionObserver" in window)) {
      const fallbackTimer = window.setTimeout(() => {
        setIsVisible(true);
      }, 0);

      return () => window.clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [sectionRef, threshold]);

  return isVisible;
}

function Menu() {
  const menuRef = useRef(null);
  const whyRef = useRef(null);
  const testimonialsRef = useRef(null);
  const [menuItems, setMenuItems] = useState(fallbackMenuItems);
  const t = useTranslations("home");
  const locale = useLocale();

  useEffect(() => {
    let isActive = true;

    fetch("/api/menu")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Menu API request failed");
        }

        return response.json();
      })
      .then(({ items }) => {
        if (!isActive || !Array.isArray(items) || items.length === 0) {
          return;
        }

        const apiItemsBySlug = new Map(
          items.map((item) => [item.slug, item])
        );

        setMenuItems(
          fallbackMenuItems.map((fallbackItem) => {
            const item = apiItemsBySlug.get(fallbackItem.key);

            if (!item) {
              return fallbackItem;
            }

            return {
              key: item.slug,
              id: item.id,
              name: locale === "ar" ? item.name_ar : item.name_en,
              description:
                locale === "ar"
                  ? item.description_ar
                  : item.description_en,
              price: `$${Number(item.price).toFixed(2)}`,
              image: item.image_url,
            };
          })
        );
      })
      .catch(() => {
        // Keep the local fallback menu if the API is unavailable.
      });

    return () => {
      isActive = false;
    };
  }, [locale]);

  const addToCart = ({ id, name, description, price, image }) => {
    try {
      const savedItems = JSON.parse(
        window.localStorage.getItem(CART_STORAGE_KEY) || "[]"
      );
      const items = Array.isArray(savedItems) ? savedItems : [];
      const existingItem = items.find((item) => item.id === id);

      const updatedItems = existingItem
        ? items.map((item) =>
            item.id === id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          )
        : [...items, { id, name, description, price, image, quantity: 1 }];

      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(updatedItems)
      );
      window.dispatchEvent(new Event("coffee-cart-updated"));
    } catch (error) {
      console.error("Cart save failed", error);
    }
  };

  const isVisible = useSectionVisibility(menuRef, 0.2);
  const isWhyVisible = useSectionVisibility(whyRef, 0.25);
  const isTestimonialsVisible = useSectionVisibility(testimonialsRef, 0.2);

  return (
    <section
      ref={menuRef}
      className={`menu-section ${isVisible ? "menu-visible" : ""}`}
      id="menu"
    >
      <div className="menu-beans menu-beans-left" aria-hidden="true">
        <Image src={coffeeBeans} alt="" fill sizes="350px" />
      </div>

      <div className="menu-content">
        <h2 className="menu-title">{t("featuredMenu")}</h2>

        <div className="menu-grid">
          {menuItems.map((item, index) => (
            <article
              className="menu-card"
              key={item.id || item.key}
              style={{ "--card-delay": `${index * 0.12}s` }}
            >
              <div className="menu-card-image">
                <Image
                  src={item.image}
                  alt={item.name || t(`items.${item.key}.name`)}
                  fill
                  sizes="(max-width: 850px) 44vw, (max-width: 1200px) 22vw, 260px"
                />
              </div>

              <div className="menu-card-content">
                <h3>{item.name || t(`items.${item.key}.name`)}</h3>
                <p>
                  {item.description || t(`items.${item.key}.description`)}
                </p>

                <div className="menu-card-footer">
                  <span>{item.price}</span>

                  <button
                    type="button"
                    className="menu-add-button"
                    aria-label={`Add ${item.name || t(`items.${item.key}.name`)}`}
                    onClick={() =>
                      addToCart({
                        id: item.id || item.key,
                        name: item.name || t(`items.${item.key}.name`),
                        description:
                          item.description ||
                          t(`items.${item.key}.description`),
                        price: item.price,
                        image: item.image,
                      })
                    }
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <a href="#menu" className="menu-explore-button">
          {t("exploreMenu")}
        </a>

        <section
          ref={whyRef}
          className={`why-choose ${isWhyVisible ? "why-visible" : ""}`}
          aria-labelledby="why-choose-title"
        >
          <div className="why-beans why-beans-right" aria-hidden="true">
            <Image src={coffeeBeans} alt="" fill sizes="390px" />
          </div>

          <h2 id="why-choose-title" className="why-choose-title">
            {t("whyChooseUs")}
          </h2>

          <div className="why-choose-grid">
            {whyChooseUs.map(({ icon: Icon, key }, index) => (
              <article
                className="why-card"
                key={key}
                style={{ "--why-delay": `${index * 0.12}s` }}
              >
                <div className="why-card-icon">
                  <Icon aria-hidden="true" />
                </div>

                <h3>{t(`why.${key}.title`)}</h3>
                <p>{t(`why.${key}.text`)}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          ref={testimonialsRef}
          className={`testimonials-area ${
            isTestimonialsVisible ? "testimonials-visible" : ""
          }`}
          aria-labelledby="testimonials-title"
        >
          <div
            className="testimonial-beans testimonial-beans-left"
            aria-hidden="true"
          >
            <Image src={coffeeBeans} alt="" fill sizes="350px" />
          </div>

          <h2 id="testimonials-title" className="testimonials-title">
            {t("customerSay")}
          </h2>

          <svg
            className="testimonials-path"
            viewBox="0 0 1000 540"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <filter id="testimonial-light-glow">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              id="testimonials-route"
              className="testimonials-path-base"
              d="
                M120 410
                C190 600 280 560 240 390
                C200 220 300 120 430 150
                C560 180 680 350 720 430
                C760 510 970 300 900 90
              "
            />

            <circle className="testimonials-node" cx="120" cy="410" r="8" />
            <circle className="testimonials-node" cx="430" cy="150" r="8" />
            <circle className="testimonials-node" cx="900" cy="90" r="8" />

            <circle
              className="testimonial-light"
              r="7"
              fill="#fff1bd"
              filter="url(#testimonial-light-glow)"
            >
              <animateMotion dur="5s" repeatCount="indefinite" rotate="auto">
                <mpath href="#testimonials-route" />
              </animateMotion>
            </circle>

            <circle
              className="testimonial-light-core"
              r="2.5"
              fill="#ffffff"
            >
              <animateMotion dur="5s" repeatCount="indefinite" rotate="auto">
                <mpath href="#testimonials-route" />
              </animateMotion>
            </circle>
          </svg>

          {customerReviews.map((review, index) => (
            <article
              className={`testimonial-card testimonial-card-${index + 1}`}
              key={review.name}
              style={{ "--review-delay": `${index * 0.15}s` }}
            >
              <div className="testimonial-stars" aria-label={t("rating")}>
                ★★★★★
              </div>

              <p>“{t(review.textKey)}”</p>

              <div className="testimonial-user">
                <span className="testimonial-avatar" aria-hidden="true">
                  {review.initial}
                </span>
                <strong>{review.name}</strong>
              </div>
            </article>
          ))}
        </section>
      </div>
    </section>
  );
}

export default Menu;
