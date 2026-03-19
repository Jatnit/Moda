import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';
import { Locale } from '../i18n/messages';

export function AppLayout() {
  const { locale, setLocale, t } = useI18n();
  const [headerTitle, setHeaderTitle] = useState('Moda');
  const [bannerText, setBannerText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [themeColor, setThemeColor] = useState('#114a9f');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'}/settings`)
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

  return (
    <div className="shell" style={{ ['--primary' as any]: themeColor }}>
      <header className="topbar">
        <h1>{headerTitle}</h1>
        <nav>
          <Link to="/">{t('nav_home')}</Link>
          <Link to="/products">{t('nav_products')}</Link>
          <Link to="/cart">{t('nav_cart')}</Link>
          <Link to="/checkout">{t('nav_checkout')}</Link>
          <Link to="/auth">{t('nav_auth')}</Link>
          <Link to="/admin">{t('nav_admin')}</Link>
          <Link to="/admin/settings">{t('nav_settings')}</Link>
          <Link to="/admin/builder">{t('nav_builder')}</Link>
          <Link to="/admin/media">{t('nav_media')}</Link>
          <label>
            {t('lang_label')}:{' '}
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              style={{ marginLeft: 4 }}
            >
              <option value="vi">VI</option>
              <option value="en">EN</option>
            </select>
          </label>
        </nav>
      </header>
      {bannerText ? <div className="site-banner">{bannerText}</div> : null}
      <main className="content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>{footerText}</p>
        <p>{contactEmail}</p>
      </footer>
    </div>
  );
}
