"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FiArrowLeft, FiCheck, FiUser } from "react-icons/fi";
import { useRouter } from "next/navigation";

import coffeeBeans from "../../assets/coffee-beans1.svg";
import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

import "./checkout.css";

const CART_STORAGE_KEY = "coffee-cart";
const ORDER_STORAGE_KEY = "coffee-order";

const getPrice = (price) => Number(String(price).replace("$", "")) || 0;

function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("Online Payment");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("checkout");

  useEffect(() => {
  const timer = window.setTimeout(() => {
    try {
      const savedItems = JSON.parse(
        window.localStorage.getItem(CART_STORAGE_KEY) || "[]"
      );

      setCartItems(Array.isArray(savedItems) ? savedItems : []);
    } catch {
      setCartItems([]);
    }
  }, 0);

  return () => window.clearTimeout(timer);
}, []);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + getPrice(item.price) * (item.quantity || 1),
        0
      ),
    [cartItems]
  );

  const handleCustomerChange = (event) => {
    const { name, value } = event.target;
    setCustomer((current) => ({ ...current, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(t("signInRequired"));
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          customer,
          paymentMethod,
          items: cartItems,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t("orderFailed"));
      }

      const order = {
        orderNumber: `CB-${result.orderId.slice(0, 6).toUpperCase()}`,
        orderId: result.orderId,
        createdAt: result.createdAt,
        customer,
        paymentMethod,
        items: cartItems,
        subtotal: result.subtotal,
        deliveryFee: result.deliveryFee,
        total: result.total,
      };

      window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
      window.localStorage.removeItem(CART_STORAGE_KEY);
      window.dispatchEvent(new Event("coffee-cart-updated"));
      router.push("/order-placed");
    } catch (submitOrderError) {
      setSubmitError(submitOrderError.message || t("orderFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="checkout-page">
        <div className="checkout-page-beans checkout-page-beans-left" aria-hidden="true">
          <Image src={coffeeBeans} alt="" fill sizes="260px" />
        </div>

        <div className="checkout-page-beans checkout-page-beans-right" aria-hidden="true">
          <Image src={coffeeBeans} alt="" fill sizes="260px" />
        </div>

        <section className="checkout-shell" aria-labelledby="checkout-title">
          <Link href="/cart" className="checkout-back-link">
            <FiArrowLeft /> {t("back")}
          </Link>

          <h1 id="checkout-title">{t("title")}</h1>

          {cartItems.length === 0 ? (
            <div className="checkout-empty">
              <p>{t("empty")}</p>
              <Link href="/menu" className="checkout-button">
                {t("exploreMenu")}
              </Link>
            </div>
          ) : (
            <form className="checkout-form" onSubmit={placeOrder}>
              <div className="checkout-details-card">
                <div className="checkout-card-heading">
                  <FiUser />
                  <h2>{t("customerDetails")}</h2>
                </div>

                <div className="checkout-input-grid">
                  <label>
                    {t("name")}
                    <input
                      name="name"
                      value={customer.name}
                      onChange={handleCustomerChange}
                      placeholder={t("namePlaceholder")}
                      required
                    />
                  </label>
                  <label>
                    {t("phone")}
                    <input
                      name="phone"
                      value={customer.phone}
                      onChange={handleCustomerChange}
                      placeholder={t("phonePlaceholder")}
                      required
                    />
                  </label>
                  <label>
                    {t("email")}
                    <input
                      type="email"
                      name="email"
                      value={customer.email}
                      onChange={handleCustomerChange}
                      placeholder={t("emailPlaceholder")}
                      required
                    />
                  </label>
                  <label className="checkout-address-field">
                    {t("address")}
                    <input
                      name="address"
                      value={customer.address}
                      onChange={handleCustomerChange}
                      placeholder={t("addressPlaceholder")}
                      required
                    />
                  </label>
                </div>

                <div className="checkout-divider" />

                <div className="checkout-summary-line">
                  <span>{t("paymentMethod")}</span>
                  <div className="checkout-payment-select">
                    <label>
                      <input
                        type="radio"
                        name="checkout-payment"
                        checked={paymentMethod === "Online Payment"}
                        onChange={() => setPaymentMethod("Online Payment")}
                      />
                      {t("onlinePayment")}
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="checkout-payment"
                        checked={paymentMethod === "Cash on Delivery"}
                        onChange={() => setPaymentMethod("Cash on Delivery")}
                      />
                      {t("cashDelivery")}
                    </label>
                  </div>
                </div>

                <div className="checkout-summary-line">
                  <span>{t("estimatedTime")}</span>
                  <strong>{t("time")}</strong>
                </div>

                <div className="checkout-total-box">
                  <div>
                    <span>{t("subtotal")}</span>
                    <strong>${subtotal.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span>{t("deliveryFee")}</span>
                    <strong>$0.00</strong>
                  </div>
                  <div className="checkout-grand-total">
                    <span>
                      {t("grandTotal")} <small>{t("tax")}</small>
                    </span>
                    <strong>${subtotal.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {submitError && (
                <p className="checkout-error" role="alert">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                className="checkout-button"
                disabled={isSubmitting}
              >
                <FiCheck /> {t("confirm")}
              </button>
            </form>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default CheckoutPage;
