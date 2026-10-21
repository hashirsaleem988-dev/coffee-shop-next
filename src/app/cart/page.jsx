"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FiArrowRight, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";

import coffeeBeans from "../../assets/coffee-beans1.svg";
import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";

import "./cart.css";

const CART_STORAGE_KEY = "coffee-cart";

const getPrice = (price) => Number(String(price).replace("$", "")) || 0;
const getImageSource = (image) => {
  const imageSource = String(image || "");
  return imageSource.startsWith("/") ? imageSource : `/menu/${imageSource}`;
};

const readCart = () => {
  try {
    const savedItems = JSON.parse(
      window.localStorage.getItem(CART_STORAGE_KEY) || "[]"
    );
    return Array.isArray(savedItems) ? savedItems : [];
  } catch {
    return [];
  }
};

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const t = useTranslations("cart");

  useEffect(() => {
    const syncCart = () => setCartItems(readCart());

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("coffee-cart-updated", syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("coffee-cart-updated", syncCart);
    };
  }, []);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + getPrice(item.price) * (item.quantity || 1),
        0
      ),
    [cartItems]
  );

  const updateQuantity = (itemId, change) => {
    const updatedItems = cartItems
      .map((item) =>
        item.id === itemId
          ? { ...item, quantity: (item.quantity || 1) + change }
          : item
      )
      .filter((item) => item.quantity > 0);

    setCartItems(updatedItems);
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
    window.dispatchEvent(new Event("coffee-cart-updated"));
  };

  const removeItem = (itemId) => {
    const updatedItems = cartItems.filter((item) => item.id !== itemId);

    setCartItems(updatedItems);
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
    window.dispatchEvent(new Event("coffee-cart-updated"));
  };

  return (
    <>
      <Navbar />

      <main className="cart-page">
        <div className="cart-page-beans cart-page-beans-left" aria-hidden="true">
          <Image src={coffeeBeans} alt="" fill sizes="260px" />
        </div>

        <div className="cart-page-beans cart-page-beans-right" aria-hidden="true">
          <Image src={coffeeBeans} alt="" fill sizes="260px" />
        </div>

        <section className="cart-layout" aria-labelledby="cart-title">
          <div className="cart-panel">
            <div className="cart-panel-heading">
              <span>{t("eyebrow")}</span>
              <h1 id="cart-title">{t("title")}</h1>
            </div>

            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <h2>{t("emptyTitle")}</h2>
                <p>{t("emptyText")}</p>
                <Link href="/menu" className="cart-primary-button">
                  {t("goToMenu")} <FiArrowRight />
                </Link>
              </div>
            ) : (
              <div className="cart-items">
                {cartItems.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <div className="cart-item-image">
                      <Image
                        src={getImageSource(item.image)}
                        alt={item.name}
                        fill
                        sizes="130px"
                      />
                    </div>

                    <div className="cart-item-details">
                      <h2>{item.name}</h2>
                      <p>{item.description}</p>
                      <strong>${getPrice(item.price).toFixed(2)}</strong>
                    </div>

                    <div className="cart-item-controls">
                      <button
                        type="button"
                        aria-label={t("decrease", { name: item.name })}
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <FiMinus />
                      </button>
                      <span>{item.quantity || 1}</span>
                      <button
                        type="button"
                        aria-label={t("increase", { name: item.name })}
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <FiPlus />
                      </button>
                      <button
                        type="button"
                        className="cart-item-remove"
                        aria-label={t("remove", { name: item.name })}
                        onClick={() => removeItem(item.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </article>
                ))}

                <div className="cart-subtotal">
                  <span>{t("subtotal")}</span>
                  <strong>${subtotal.toFixed(2)}</strong>
                </div>
              </div>
            )}
          </div>

          <aside className="cart-payment-panel" aria-label="Payment details">
            <p className="cart-payment-label">{t("ready")}</p>
            <h2>{t("payment")}</h2>

            <div className="cart-payment-options">
              <label>
                <input type="radio" name="payment" defaultChecked />
                <span>{t("cash")}</span>
              </label>
              <label>
                <input type="radio" name="payment" />
                <span>{t("online")}</span>
              </label>
            </div>

            <div className="cart-payment-methods" aria-hidden="true">
              <span>easypaisa</span>
              <span>VISA</span>
            </div>

            <div className="cart-payment-fields">
              <label>
                {t("cardholder")}
                <input type="text" placeholder="Your name" />
              </label>
              <label>
                {t("cardNumber")}
                <input type="text" placeholder="0000 0000 0000 0000" />
              </label>
              <div>
                <label>
                  {t("expiry")}
                  <input type="text" placeholder="MM/YY" />
                </label>
                <label>
                  {t("cvv")}
                  <input type="text" placeholder="000" />
                </label>
              </div>
            </div>
          </aside>
        </section>

        <div className="cart-page-actions">
          <Link
            href={cartItems.length ? "/checkout" : "/menu"}
            className="cart-primary-button"
          >
            {cartItems.length ? t("checkout") : t("exploreMenu")} <FiArrowRight />
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default CartPage;
