"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  FiArrowLeft,
  FiShoppingCart,
  FiUser,
  FiUserCheck,
  FiMenu,
} from "react-icons/fi";
import "./navbar.css";
import LanguageSwitcher from "./languageswitcher";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const menuOpenRef = useRef(false);
  const previousScrollYRef = useRef(0);
  const t = useTranslations("nav");

  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    const syncAuthState = () => {
      setIsSignedIn(Boolean(window.localStorage.getItem("coffee-user")));
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("coffee-auth-updated", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("coffee-auth-updated", syncAuthState);
    };
  }, []);

  useEffect(() => {
    const updateNavbarVisibility = () => {
      const currentScrollY = window.scrollY;
      const previousScrollY = previousScrollYRef.current;
      const scrollDelta = currentScrollY - previousScrollY;

      if (menuOpenRef.current) {
        setNavbarVisible(true);
        previousScrollYRef.current = currentScrollY;
        return;
      }

      if (currentScrollY <= 8) {
        setNavbarVisible(true);
      } else if (scrollDelta > 4) {
        setNavbarVisible(false);
      } else if (scrollDelta < -4) {
        setNavbarVisible(true);
      }

      previousScrollYRef.current = currentScrollY;
    };

    previousScrollYRef.current = window.scrollY;
    updateNavbarVisibility();
    window.addEventListener("scroll", updateNavbarVisibility, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", updateNavbarVisibility);
    };
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`navbar ${
          navbarVisible || menuOpen ? "navbar-visible" : "navbar-hidden"
        } ${menuOpen ? "menu-open" : ""}`}
        suppressHydrationWarning
      >
        <div className="nav-links">
          <Link href="/#home" className="nav-link" onClick={closeMenu}>
            {t("home")}
          </Link>

          <Link href="/about" className="nav-link" onClick={closeMenu}>
            {t("about")}
          </Link>

          <Link href="/menu" className="nav-link" onClick={closeMenu}>
            {t("menu")}
          </Link>

          <Link href="/faqs" className="nav-link" onClick={closeMenu}>
            {t("faqs")}
          </Link>

          <Link href="/gallery" className="nav-link" onClick={closeMenu}>
            {t("gallery")}
          </Link>
        </div>

        <div className="nav-actions">
          <LanguageSwitcher />

          <Link href="/cart" className="cart-btn" onClick={closeMenu}>
            <FiShoppingCart />
            <span className="action-text">{t("addToCart")}</span>
          </Link>

          <span className="action-divider" />

          {isSignedIn ? (
            <Link
              href="/signin"
              className="account-btn"
              aria-label={t("account")}
              title={t("account")}
              onClick={closeMenu}
            >
              <FiUserCheck />
            </Link>
          ) : (
            <Link href="/signin" className="sign-in-btn" onClick={closeMenu}>
              <FiUser />
              <span className="action-text">{t("signIn")}</span>
            </Link>
          )}
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <FiArrowLeft /> : <FiMenu />}
        </button>
      </nav>

      <Link href="/cart" className="mobile-cart-fab" aria-label={t("openCart")}>
        <FiShoppingCart />
      </Link>
    </>
  );
}

export default Navbar;
