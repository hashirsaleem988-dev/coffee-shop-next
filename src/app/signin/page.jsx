"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { FiArrowLeft, FiUser, FiUserPlus } from "react-icons/fi";

import coffeeBeans from "../../assets/coffee-beans1.svg";
import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/navbar";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

import "./auth.css";

function AuthPage() {
  const [mode, setMode] = useState("signin");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("auth");

  const isSignUp = mode === "signup";

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setMessage("");
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setMessage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      const result = isSignUp
        ? await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.name,
              },
            },
          })
        : await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

      if (result.error) {
        throw result.error;
      }

      if (!result.data.session || !result.data.user) {
        setMessage(t("checkEmail"));
        return;
      }

      const user = result.data.user;
      window.localStorage.setItem(
        "coffee-user",
        JSON.stringify({
          name:
            user.user_metadata?.full_name ||
            formData.name ||
            "Coffee Lover",
          email: user.email || formData.email,
          signedInAt: new Date().toISOString(),
        })
      );
      window.dispatchEvent(new Event("coffee-auth-updated"));
      setMessage(isSignUp ? t("accountCreated") : t("signedIn"));
    } catch (submitError) {
      setError(submitError.message || t("authFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="auth-page">
        <div className="auth-page-beans auth-page-beans-left" aria-hidden="true">
          <Image src={coffeeBeans} alt="" fill sizes="280px" />
        </div>

        <div className="auth-page-beans auth-page-beans-right" aria-hidden="true">
          <Image src={coffeeBeans} alt="" fill sizes="280px" />
        </div>

        <section className="auth-shell" aria-labelledby="auth-title">
          <Link href="/" className="auth-back-link">
            <FiArrowLeft /> {t("backHome")}
          </Link>

          <h1 id="auth-title">{isSignUp ? t("signUp") : t("signIn")}</h1>

          <div className="auth-mode-switch" role="tablist" aria-label="Account access">
            <button
              type="button"
              role="tab"
              aria-selected={!isSignUp}
              className={!isSignUp ? "is-active" : ""}
              onClick={() => changeMode("signin")}
            >
              {t("signIn")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isSignUp}
              className={isSignUp ? "is-active" : ""}
              onClick={() => changeMode("signup")}
            >
              {t("signUp")}
            </button>
          </div>

          <form className="auth-card" onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <label htmlFor="auth-name">{t("fullName")}</label>
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("namePlaceholder")}
                  autoComplete="name"
                  required
                />
              </>
            )}

            <label htmlFor="auth-email">{t("email")}</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("emailPlaceholder")}
              autoComplete="email"
              required
            />

            {!isSignUp && (
              <div className="auth-password-heading">
                <label htmlFor="auth-password">{t("password")}</label>
                <Link href="/signin#forgot-password">{t("forgotPassword")}</Link>
              </div>
            )}

            {isSignUp && <label htmlFor="auth-password">{t("password")}</label>}
            <input
              id="auth-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={
                isSignUp
                  ? t("createPasswordPlaceholder")
                  : t("passwordPlaceholder")
              }
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
            />

            {isSignUp && (
              <>
                <label htmlFor="auth-confirm-password">
                  {t("confirmPassword")}
                </label>
                <input
                  id="auth-confirm-password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t("confirmPasswordPlaceholder")}
                  autoComplete="new-password"
                  required
                />
              </>
            )}

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="auth-success" role="status">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={isSubmitting}
            >
              {isSignUp ? <FiUserPlus /> : <FiUser />}
              {isSubmitting
                ? t("pleaseWait")
                : isSignUp
                  ? t("createAccount")
                  : t("signIn")}
            </button>

            {!isSignUp && (
              <>
                <div className="auth-divider">
                  <span>{t("orContinue")}</span>
                </div>

                <div className="auth-socials">
                  <button type="button" aria-label="Continue with Google">
                    <span className="auth-social-icon auth-google-icon">G</span>
                    Google
                  </button>
                  <button type="button" aria-label="Continue with Facebook">
                    <span className="auth-social-icon auth-facebook-icon">f</span>
                    Facebook
                  </button>
                  <button type="button" aria-label="Continue with Apple">
                    <span className="auth-social-icon auth-apple-icon">●</span>
                    Apple
                  </button>
                </div>
              </>
            )}

            <p className="auth-switch-text">
              {isSignUp ? t("alreadyAccount") : t("noAccount")} {" "}
              <button
                type="button"
                onClick={() => changeMode(isSignUp ? "signin" : "signup")}
              >
                {isSignUp ? t("signIn") : t("createAccount")}
              </button>
            </p>
          </form>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default AuthPage;
