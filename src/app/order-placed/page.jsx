"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FiArrowRight, FiCheck } from "react-icons/fi";

import coffeeBeans from "../../assets/coffee-beans1.svg";
import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";

import "./order-placed.css";

const ORDER_STORAGE_KEY = "coffee-order";

function OrderPlacedPage() {
  const [order, setOrder] = useState(null);
  const t = useTranslations("order");

useEffect(() => {
  const timer = window.setTimeout(() => {
    try {
      const savedOrder = JSON.parse(
        window.localStorage.getItem(ORDER_STORAGE_KEY) || "null"
      );

      setOrder(savedOrder);
    } catch {
      setOrder(null);
    }
  }, 0);

  return () => window.clearTimeout(timer);
}, []);

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="order-placed-page order-placed-empty">
          <h1>{t("noOrder")}</h1>
          <p>{t("noOrderText")}</p>
          <Link href="/menu" className="order-placed-button">
            {t("goToMenu")} <FiArrowRight />
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <Navbar />

      <main className="order-placed-page">
        <div className="order-placed-page-beans order-placed-page-beans-left" aria-hidden="true">
          <Image src={coffeeBeans} alt="" fill sizes="260px" />
        </div>

        <div className="order-placed-page-beans order-placed-page-beans-right" aria-hidden="true">
          <Image src={coffeeBeans} alt="" fill sizes="260px" />
        </div>

        <section className="order-placed-shell" aria-labelledby="order-placed-title">
          <div className="order-success-icon" aria-hidden="true">
            <FiCheck />
          </div>

          <p className="order-success-label">{t("thanks")}</p>
          <h1 id="order-placed-title">{t("title")}</h1>
          <strong className="order-number">{order.orderNumber}</strong>
          <p className="order-date">{orderDate}</p>

          <div className="order-meta">
            <div>
              <span>{t("deliveryAddress")}</span>
              <strong>{order.customer.address}</strong>
            </div>
            <div>
              <span>{t("paymentMethod")}</span>
              <strong>{order.paymentMethod}</strong>
            </div>
          </div>

          <div className="order-items-card">
            <h2>{t("itemList")}</h2>
            {order.items.map((item) => (
              <div className="order-item-row" key={item.id}>
                <span>
                  {item.name} <small>x{item.quantity || 1}</small>
                </span>
                <strong>
                  ${(getItemTotal(item)).toFixed(2)}
                </strong>
              </div>
            ))}
            <div className="order-items-divider" />
            <div className="order-item-row">
              <span>{t("subtotal")}</span>
              <strong>${Number(order.subtotal).toFixed(2)}</strong>
            </div>
            <div className="order-item-row order-grand-total">
              <span>{t("grandTotal")}</span>
              <strong>${Number(order.total).toFixed(2)}</strong>
            </div>
          </div>

          <Link href="/menu" className="order-placed-button">
            {t("continue")} <FiArrowRight />
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}

const getItemTotal = (item) => {
  const price = Number(String(item.price).replace("$", "")) || 0;
  return price * (item.quantity || 1);
};

export default OrderPlacedPage;
