import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { clearSession, getCurrentRole, isAuthenticated } from '../../auth/session';
import { useI18n } from '../../i18n/I18nProvider';
import { Locale } from '../../i18n/messages';
import { getCartItems } from '../../utils/cart';
import './Header.css';

interface HeaderProps {
  title?: string;
  bannerText?: string;
}

export function Header({ title = 'Moda', bannerText }: HeaderProps) {
  const { locale, setLocale, t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const role = getCurrentRole();
  const authed = isAuthenticated();
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'EDITOR';
  const cartCount = getCartItems().reduce((sum, i) => sum + i.quantity, 0);

  const logout = () => {
    clearSession();
    navigate('/auth');
  };

  return (
    <>
      {bannerText && (
        <div className="announcement-bar">
          <div className="container">
            <p>{bannerText}</p>
          </div>
        </div>
      )}
      <header className="header">
        <div className="header__inner container">
          {/* Brand */}
          <Link to="/" className="header__brand">
            <span className="header__logo">{title}</span>
            <span className="header__tagline">Fashion House</span>
          </Link>

          {/* Desktop nav */}
          <nav className="header__nav" aria-label="Main navigation">
            <NavLink to="/" className="header__nav-link" end>{t('nav_home')}</NavLink>
            <NavLink to="/products" className="header__nav-link">{t('nav_products')}</NavLink>
            {isAdmin && <NavLink to="/admin" className="header__nav-link">{t('nav_admin')}</NavLink>}
          </nav>

          {/* Right actions */}
          <div className="header__actions">
            <select
              className="header__lang-select"
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              aria-label={t('lang_label')}
            >
              <option value="vi">VI</option>
              <option value="en">EN</option>
            </select>

            {authed ? (
              <NavLink to="/account" className="header__action-btn" title="Account">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </NavLink>
            ) : (
              <NavLink to="/auth" className="header__action-btn" title={t('nav_auth')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </NavLink>
            )}

            <NavLink to="/cart" className="header__action-btn header__cart-btn" title={t('nav_cart')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {cartCount > 0 && <span className="header__cart-count">{cartCount}</span>}
            </NavLink>

            {authed && (
              <button type="button" className="btn-ghost header__logout-btn" onClick={logout}>
                Logout
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              className="header__hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span className={`header__hamburger-line ${mobileOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={`header__drawer ${mobileOpen ? 'header__drawer--open' : ''}`}>
          <nav className="header__drawer-nav">
            <NavLink to="/" onClick={() => setMobileOpen(false)} end>{t('nav_home')}</NavLink>
            <NavLink to="/products" onClick={() => setMobileOpen(false)}>{t('nav_products')}</NavLink>
            <NavLink to="/cart" onClick={() => setMobileOpen(false)}>{t('nav_cart')}</NavLink>
            <NavLink to="/checkout" onClick={() => setMobileOpen(false)}>{t('nav_checkout')}</NavLink>
            {!authed && <NavLink to="/auth" onClick={() => setMobileOpen(false)}>{t('nav_auth')}</NavLink>}
            {authed && <NavLink to="/account" onClick={() => setMobileOpen(false)}>Account</NavLink>}
            {isAdmin && <NavLink to="/admin" onClick={() => setMobileOpen(false)}>{t('nav_admin')}</NavLink>}
            {isAdmin && <NavLink to="/admin/settings" onClick={() => setMobileOpen(false)}>{t('nav_settings')}</NavLink>}
            {isAdmin && <NavLink to="/admin/builder" onClick={() => setMobileOpen(false)}>{t('nav_builder')}</NavLink>}
            {isAdmin && <NavLink to="/admin/media" onClick={() => setMobileOpen(false)}>{t('nav_media')}</NavLink>}
            {authed && (
              <button type="button" className="btn-ghost" onClick={() => { logout(); setMobileOpen(false); }}>
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
