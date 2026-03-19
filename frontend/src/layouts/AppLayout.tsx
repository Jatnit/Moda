import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/client';
import { clearSession, getCurrentRole, isAuthenticated } from '../auth/session';
import { useI18n } from '../i18n/I18nProvider';
import { Locale } from '../i18n/messages';

export function AppLayout() {
  const { locale, setLocale, t } = useI18n();
  const [headerTitle, setHeaderTitle] = useState('Moda');
  const [bannerText, setBannerText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [themeColor, setThemeColor] = useState('#114a9f');
  const navigate = useNavigate();
  const role = getCurrentRole();
  const authed = isAuthenticated();
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'EDITOR';

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings`, { credentials: 'include' })
      .then((res) => res.json())
      .then((rows: Array<{ key: string; value: unknown }>) => {
        const get = (key: string) => rows.find((item) => item.key === key)?.value as any;
        setHeaderTitle(String(get('header_config')?.title ?? 'Moda'));
        setBannerText(String(get('banner_config')?.text ?? ''));
        setFooterText(String(get('footer_config')?.text ?? ''));
        setContactEmail(String(get('contact_info')?.email ?? ''));
        setThemeColor(String(get('theme_tokens')?.primaryColor ?? '#114a9f'));
      })
      .catch(() => undefined);
  }, []);

  const logout = () => {
    clearSession();
    navigate('/auth');
  };

  return (
    <div className="shell" style={{ ['--primary' as any]: themeColor }}>
      <header className="topbar">
        <div className="brand">
          <h1>{headerTitle}</h1>
          <p>Elegant Fashion House</p>
        </div>
        <nav className="main-nav">
          <Link to="/">{t('nav_home')}</Link>
          <Link to="/products">{t('nav_products')}</Link>
          <Link to="/cart">{t('nav_cart')}</Link>
          <Link to="/checkout">{t('nav_checkout')}</Link>
          <Link to="/auth">{t('nav_auth')}</Link>
          {authed ? <Link to="/account">Account</Link> : null}
          {isAdmin ? <Link to="/admin">{t('nav_admin')}</Link> : null}
          {isAdmin ? <Link to="/admin/settings">{t('nav_settings')}</Link> : null}
          {isAdmin ? <Link to="/admin/builder">{t('nav_builder')}</Link> : null}
          {isAdmin ? <Link to="/admin/media">{t('nav_media')}</Link> : null}
          {authed ? (
            <button type="button" className="ghost" onClick={logout}>
              Logout
            </button>
          ) : null}
        </nav>
        <div className="toolbar">
          <label>
            {t('lang_label')}:{' '}
            <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)} style={{ marginLeft: 4 }}>
              <option value="vi">VI</option>
              <option value="en">EN</option>
            </select>
          </label>
        </div>
      </header>
      {bannerText ? <div className="site-banner">{bannerText}</div> : null}
      <main className="content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>{footerText || 'Refined silhouettes, curated essentials, and timeless confidence.'}</p>
        <p>{contactEmail}</p>
      </footer>
    </div>
  );
}
