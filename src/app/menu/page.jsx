"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import coffeeBeans from "../../assets/coffee-beans1.svg";
import coffeeBackground from "../../assets/coffee-background1.svg";
import coffeeForeground from "../../assets/coffee-foreground1.svg";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

import "./menu.css";

const fallbackMenuSections = [
  {
    id: "menu-coffee",
    titleKey: "categories.coffee",
    beanSide: "left",
    items: [
      ["espresso", "$2.99", "espresso.png"],
      ["affogato", "$5.49", "affogato.png"],
      ["cappuccino", "$4.49", "cappuccino.png"],
      ["americano", "$3.49", "americano.png"],
      ["macchiato", "$3.99", "macchiato.png"],
      ["mocha", "$5.49", "mocha.png"],
      ["flatWhite", "$4.79", "flat-white.png"],
      ["latte", "$4.99", "latte.png"],
    ],
  },
  {
    id: "menu-cold-drinks",
    titleKey: "categories.coldDrinks",
    beanSide: "right",
    items: [
      ["icedLatte", "$5.29", "iced-latte.png"],
      ["coldBrew", "$4.99", "cold-brew-coffee.png"],
      ["icedMocha", "$5.79", "iced-mocha.png"],
      ["frappe", "$6.49", "frappe.png"],
    ],
  },
  {
    id: "menu-hot-drinks",
    titleKey: "categories.hotDrinks",
    beanSide: "left",
    items: [
      ["hotChocolate", "$4.49", "hot-chocolate.png"],
      ["blackTea", "$2.99", "black-tea.png"],
      ["chaiLatte", "$4.79", "chai-latte.png"],
      ["matchaLatte", "$5.49", "matcha-latte.png"],
    ],
  },
  {
    id: "menu-sweet-treats",
    titleKey: "categories.sweetTreats",
    beanSide: "right",
    items: [
      ["croissant", "$3.99", "croissant.png"],
      ["chocolateMuffin", "$4.49", "chocolate-muffin.png"],
      ["chocolateBrownie", "$4.99", "chocolate-brownie.png"],
      ["cheeseCake", "$5.99", "cheese-cake.png"],
      ["cocoaTiramisu", "$6.49", "tiramisu.png"],
      ["honeyWaffle", "$5.49", "honey-waffle.png"],
      ["chocoCookies", "$3.49", "choco-cookies.png"],
      ["donut", "$2.99", "donut.png"],
    ],
  },
];

const filters = [
  ["allItems", "menu-list"],
  ["categories.coffee", "menu-coffee"],
  ["categories.coldDrinks", "menu-cold-drinks"],
  ["categories.hotDrinks", "menu-hot-drinks"],
  ["categories.sweetTreats", "menu-sweet-treats"],
];

const CART_STORAGE_KEY = "coffee-cart";

function MenuPage() {
  const bannerRef = useRef(null);
  const filtersRef = useRef(null);
  const sectionRefs = useRef([]);
  const [menuSections, setMenuSections] = useState(fallbackMenuSections);
  const [revealed, setRevealed] = useState({
    banner: false,
    filters: false,
    "menu-coffee": false,
    "menu-cold-drinks": false,
    "menu-hot-drinks": false,
    "menu-sweet-treats": false,
  });
  const t = useTranslations("menu");
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

        const categoryBySectionId = {
          "menu-coffee": "coffee",
          "menu-cold-drinks": "coldDrinks",
          "menu-hot-drinks": "hotDrinks",
          "menu-sweet-treats": "sweetTreats",
        };

        const sectionsFromApi = fallbackMenuSections.map((section) => {
          const apiItems = items
            .filter((item) => item.category === categoryBySectionId[section.id])
            .map((item) => ({
              id: item.id,
              key: item.slug,
              name: locale === "ar" ? item.name_ar : item.name_en,
              description:
                locale === "ar"
                  ? item.description_ar
                  : item.description_en,
              price: `$${Number(item.price).toFixed(2)}`,
              image: item.image_url,
            }));

          return {
            ...section,
            items: apiItems.length > 0 ? apiItems : section.items,
          };
        });

        setMenuSections(sectionsFromApi);
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
        : [
            ...items,
            {
              id,
              name,
              description,
              price,
              image,
              quantity: 1,
            },
          ];

      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(updatedItems)
      );
      window.dispatchEvent(new Event("coffee-cart-updated"));
    } catch (error) {
      console.error("Cart save failed", error);
    }
  };

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

    [bannerRef.current, filtersRef.current, ...sectionRefs.current]
      .filter(Boolean)
      .forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const visibleFilters = filters.filter(
    ([, sectionId]) =>
      sectionId === "menu-list" ||
      menuSections.some((section) => section.id === sectionId)
  );

  return (
    <>
      <Navbar />

      <main className="menu-page">
        <section
          ref={bannerRef}
          className={`menu-page-banner ${revealed.banner ? "menu-revealed" : ""}`}
          data-reveal="banner"
          aria-labelledby="menu-page-title"
        >
          <div className="menu-page-banner-media" aria-hidden="true">
            <div className="menu-page-banner-background">
              <Image
                src={coffeeBackground}
                alt=""
                fill
                priority
                sizes="(max-width: 850px) 100vw, 50vw"
              />
            </div>

            <div className="menu-page-banner-foreground">
              <Image
                src={coffeeForeground}
                alt=""
                fill
                priority
                sizes="(max-width: 850px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="menu-page-banner-copy">
            <span className="menu-page-eyebrow">{t("eyebrow")}</span>
            <h1 id="menu-page-title">
              {t("titleFirst")}
              <br />
              <span>{t("titleSecond")}</span>
            </h1>
            <p>
              {t("description")}
            </p>
            <button
              type="button"
              className="menu-page-explore"
              onClick={() => scrollToSection("menu-list")}
            >
              {t("explore")}
            </button>
          </div>
        </section>

        <nav
          ref={filtersRef}
          className={`menu-page-filters ${
            revealed.filters ? "menu-revealed" : ""
          }`}
          data-reveal="filters"
          aria-label="Menu categories"
        >
          {visibleFilters.map(([labelKey, sectionId], index) => (
            <button
              type="button"
              className={`menu-filter ${index === 0 ? "is-active" : ""}`}
              key={labelKey}
              style={{ "--filter-delay": `${index * 0.1}s` }}
              onClick={() => scrollToSection(sectionId)}
            >
              {t(labelKey)}
            </button>
          ))}
        </nav>

        <div className="menu-page-list" id="menu-list">
          {menuSections.map((section, sectionIndex) => (
            <section
              ref={(element) => {
                sectionRefs.current[sectionIndex] = element;
              }}
              className={`menu-category ${
                revealed[section.id] ? "menu-revealed" : ""
              }`}
              data-reveal={section.id}
              id={section.id}
              key={section.id}
              aria-labelledby={`${section.id}-title`}
            >
              {section.beanSide && (
                <div
                  className={`menu-category-beans menu-category-beans-${section.beanSide}`}
                  aria-hidden="true"
                >
                  <Image src={coffeeBeans} alt="" fill sizes="260px" />
                </div>
              )}

              <h2 id={`${section.id}-title`}>{t(section.titleKey)}</h2>

              <div className="menu-page-card-grid">
                {section.items.map((item, index) => {
                  const itemDetails = Array.isArray(item)
                    ? {
                        key: item[0],
                        price: item[1],
                        image: `/menu/${item[2]}`,
                      }
                    : item;
                  const name =
                    itemDetails.name || t(`items.${itemDetails.key}.name`);
                  const description =
                    itemDetails.description ||
                    t(`items.${itemDetails.key}.description`);
                  const image = itemDetails.image.startsWith("/")
                    ? itemDetails.image
                    : `/menu/${itemDetails.image}`;

                  return (
                  <article
                    className="menu-page-card"
                    key={itemDetails.id || itemDetails.key || name}
                    style={{ "--card-delay": `${index * 0.07}s` }}
                  >
                    <div className="menu-page-card-image">
                      <Image
                        src={image}
                        alt={name}
                        fill
                        sizes="(max-width: 850px) 42vw, 190px"
                      />
                    </div>

                    <div className="menu-page-card-content">
                      <h3>{name}</h3>
                      <p>{description}</p>

                      <div className="menu-page-card-footer">
                        <span>{itemDetails.price}</span>
                        <button
                          type="button"
                          aria-label={`Add ${name} to cart`}
                          onClick={() =>
                            addToCart({
                              id: itemDetails.id || itemDetails.key || name,
                              name,
                              description,
                              price: itemDetails.price,
                              image,
                            })
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default MenuPage;
