import { useEffect, useState } from 'react';
import { api } from '../../api/client';

type SettingsMap = Record<string, unknown>;

export function AdminSiteSettingsPage() {
  const [headerTitle, setHeaderTitle] = useState('Moda');
  const [bannerText, setBannerText] = useState('Welcome to Moda');
  const [footerText, setFooterText] = useState('All rights reserved.');
  const [contactEmail, setContactEmail] = useState('support@moda.local');
  const [themeColor, setThemeColor] = useState('#114a9f');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const response = await api.get<Array<{ key: string; value: unknown }>>('/settings');
      const map = response.data.reduce<SettingsMap>((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
      setHeaderTitle(String((map.header_config as any)?.title ?? 'Moda'));
      setBannerText(String((map.banner_config as any)?.text ?? 'Welcome to Moda'));
      setFooterText(String((map.footer_config as any)?.text ?? 'All rights reserved.'));
      setContactEmail(String((map.contact_info as any)?.email ?? 'support@moda.local'));
      setThemeColor(String((map.theme_tokens as any)?.primaryColor ?? '#114a9f'));
    } catch {
      setMessage('Failed to load settings.');
    }
  };

  const save = async () => {
    try {
      await api.put('/settings', { key: 'header_config', value: { title: headerTitle } });
      await api.put('/settings', { key: 'banner_config', value: { text: bannerText } });
      await api.put('/settings', { key: 'footer_config', value: { text: footerText } });
      await api.put('/settings', { key: 'contact_info', value: { email: contactEmail } });
      await api.put('/settings', { key: 'theme_tokens', value: { primaryColor: themeColor } });
      setMessage('Saved settings.');
    } catch {
      setMessage('Save failed.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="page-section">
      <div className="stack form-panel">
        <h2>Site Settings</h2>
        <input value={headerTitle} onChange={(e) => setHeaderTitle(e.target.value)} placeholder="Header title" />
        <input value={bannerText} onChange={(e) => setBannerText(e.target.value)} placeholder="Banner text" />
        <input value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="Footer text" />
        <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Contact email" />
        <input value={themeColor} onChange={(e) => setThemeColor(e.target.value)} placeholder="Theme color" />
        <button type="button" onClick={save}>
          Save Settings
        </button>
        <p>{message}</p>
      </div>
    </section>
  );
}
