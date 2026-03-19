import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { API_BASE_URL } from '../api/client';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export function AppLayout() {
  const [headerTitle, setHeaderTitle] = useState('Moda');
  const [bannerText, setBannerText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings`, { credentials: 'include' })
      .then((res) => res.json())
      .then((rows: Array<{ key: string; value: unknown }>) => {
        const get = (key: string) => rows.find((item) => item.key === key)?.value as any;
        setHeaderTitle(String(get('header_config')?.title ?? 'Moda'));
        setBannerText(String(get('banner_config')?.text ?? ''));
        setFooterText(String(get('footer_config')?.text ?? ''));
        setContactEmail(String(get('contact_info')?.email ?? ''));
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="app-shell">
      <Header title={headerTitle} bannerText={bannerText} />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer footerText={footerText} contactEmail={contactEmail} />
    </div>
  );
}
