'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LuClock3,
  LuGlobe,
  LuImage,
  LuLayoutGrid,
  LuMail,
  LuMapPin,
  LuPaintbrush,
  LuPhone,
  LuSave,
  LuSettings2,
  LuType,
} from 'react-icons/lu';
import { BackendAccessNotice } from '@/components/state/backend-access-notice';
import { useSession } from '@/hooks/use-session';
import { apiRequest, describeError, type AppSettingRecord } from '@/lib/api-client';

type TabName = 'general' | 'branding' | 'localization';

type SettingsFormState = {
  appTitle: string;
  address: string;
  email: string;
  phone: string;
  footerText: string;
  themeColor: string;
  sidebarColor: string;
  pageBgColor: string;
  logoUrl: string;
  faviconUrl: string;
  language: string;
  timeZone: string;
  currency: string;
};

const initialForm: SettingsFormState = {
  appTitle: '',
  address: '',
  email: '',
  phone: '',
  footerText: '',
  themeColor: '#0f766e',
  sidebarColor: '#0f172a',
  pageBgColor: '#f8fafc',
  logoUrl: '',
  faviconUrl: '',
  language: 'en',
  timeZone: 'Asia/Calcutta',
  currency: 'INR',
};

export default function SettingsPage() {
  const session = useSession();
  const [activeTab, setActiveTab] = useState<TabName>('general');
  const [formData, setFormData] = useState<SettingsFormState>(initialForm);
  const [settings, setSettings] = useState<AppSettingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    let isActive = true;

    const loadSettings = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await apiRequest<AppSettingRecord>('/settings', {}, session);

        if (isActive) {
          setSettings(response);
          setFormData({
            appTitle: response.appTitle,
            address: response.address,
            email: response.email,
            phone: response.phone,
            footerText: response.footerText,
            themeColor: response.themeColor,
            sidebarColor: response.sidebarColor,
            pageBgColor: response.pageBgColor,
            logoUrl: response.logoUrl ?? '',
            faviconUrl: response.faviconUrl ?? '',
            language: response.language,
            timeZone: response.timeZone,
            currency: response.currency,
          });
        }
      } catch (loadError) {
        if (isActive) {
          setError(describeError(loadError, 'Unable to load settings right now.'));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      isActive = false;
    };
  }, [session]);

  const previewStyles = useMemo(
    () => ({
      backgroundColor: formData.pageBgColor,
      borderColor: formData.sidebarColor,
      color: formData.sidebarColor,
    }),
    [formData.pageBgColor, formData.sidebarColor],
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.token) {
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const updatedSettings = await apiRequest<AppSettingRecord>(
        '/settings',
        {
          method: 'PUT',
          body: JSON.stringify({
            appTitle: formData.appTitle.trim(),
            address: formData.address.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            footerText: formData.footerText.trim(),
            themeColor: formData.themeColor,
            sidebarColor: formData.sidebarColor,
            pageBgColor: formData.pageBgColor,
            logoUrl: formData.logoUrl.trim() || undefined,
            faviconUrl: formData.faviconUrl.trim() || undefined,
            language: formData.language,
            timeZone: formData.timeZone,
            currency: formData.currency,
          }),
        },
        session,
      );

      setSettings(updatedSettings);
    } catch (submissionError) {
      setError(describeError(submissionError, 'Unable to save application settings right now.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!session?.token) {
    return (
      <BackendAccessNotice
        title="Backend-backed admin session required"
        description="Application settings now persist to MongoDB. Sign in again through the admin portal to manage the live configuration."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <LuSettings2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Application Settings</h1>
            <p className="mt-1 text-sm text-slate-500">
              Keep hospital identity, branding, and localization in sync across the live admin workspace.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6">
            <nav className="flex gap-6">
              <TabButton label="General" isActive={activeTab === 'general'} onClick={() => setActiveTab('general')} />
              <TabButton label="Branding" isActive={activeTab === 'branding'} onClick={() => setActiveTab('branding')} />
              <TabButton
                label="Localization"
                isActive={activeTab === 'localization'}
                onClick={() => setActiveTab('localization')}
              />
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {isLoading ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                Loading settings...
              </div>
            ) : null}

            {!isLoading && activeTab === 'general' ? (
              <div className="space-y-4">
                <Field label="Application title" icon={LuType}>
                  <input
                    type="text"
                    name="appTitle"
                    value={formData.appTitle}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                    required
                  />
                </Field>

                <Field label="Address" icon={LuMapPin}>
                  <textarea
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Email" icon={LuMail}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                    />
                  </Field>

                  <Field label="Phone" icon={LuPhone}>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                    />
                  </Field>
                </div>

                <Field label="Footer text">
                  <textarea
                    name="footerText"
                    rows={3}
                    value={formData.footerText}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  />
                </Field>
              </div>
            ) : null}

            {!isLoading && activeTab === 'branding' ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Theme color" icon={LuPaintbrush}>
                    <input
                      type="color"
                      name="themeColor"
                      value={formData.themeColor}
                      onChange={handleChange}
                      className="h-12 w-full rounded-2xl border border-slate-200 p-2 outline-none transition focus:border-cyan-400"
                    />
                  </Field>

                  <Field label="Sidebar color" icon={LuLayoutGrid}>
                    <input
                      type="color"
                      name="sidebarColor"
                      value={formData.sidebarColor}
                      onChange={handleChange}
                      className="h-12 w-full rounded-2xl border border-slate-200 p-2 outline-none transition focus:border-cyan-400"
                    />
                  </Field>
                </div>

                <Field label="Page background color" icon={LuLayoutGrid}>
                  <input
                    type="color"
                    name="pageBgColor"
                    value={formData.pageBgColor}
                    onChange={handleChange}
                    className="h-12 w-full rounded-2xl border border-slate-200 p-2 outline-none transition focus:border-cyan-400"
                  />
                </Field>

                <Field label="Logo URL" icon={LuImage}>
                  <input
                    type="url"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  />
                </Field>

                <Field label="Favicon URL" icon={LuImage}>
                  <input
                    type="url"
                    name="faviconUrl"
                    value={formData.faviconUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/favicon.png"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  />
                </Field>
              </div>
            ) : null}

            {!isLoading && activeTab === 'localization' ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Language" icon={LuGlobe}>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="bn">Bangla</option>
                    </select>
                  </Field>

                  <Field label="Currency" icon={LuGlobe}>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </Field>
                </div>

                <Field label="Time zone" icon={LuClock3}>
                  <select
                    name="timeZone"
                    value={formData.timeZone}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-cyan-400"
                  >
                    <option value="Asia/Calcutta">Asia/Calcutta</option>
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="Etc/UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </Field>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LuSave className="h-4 w-4" />
              {isSaving ? 'Saving settings...' : 'Save settings'}
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Live preview</h2>
            <div
              className="mt-4 overflow-hidden rounded-[1.5rem] border"
              style={previewStyles}
            >
              <div className="px-4 py-3" style={{ backgroundColor: formData.sidebarColor, color: '#fff' }}>
                {formData.appTitle || 'Hospi Command Center'}
              </div>
              <div className="space-y-3 p-4 text-sm">
                <div
                  className="rounded-2xl px-4 py-3 text-white"
                  style={{ backgroundColor: formData.themeColor }}
                >
                  Admin card preview
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-600">
                  {formData.footerText || 'Footer text preview'}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Saved metadata</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Last updated: {settings ? new Date(settings.updatedAt).toLocaleString('en-IN') : 'Not available'}</p>
              <p>Updated by: {settings?.updatedBy?.name || 'System default'}</p>
              <p>Current locale: {formData.language.toUpperCase()} · {formData.currency}</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-1 py-4 text-sm font-semibold transition ${
        isActive ? 'border-cyan-500 text-cyan-700' : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        {Icon ? <Icon className="h-4 w-4 text-slate-400" /> : null}
        {label}
      </span>
      {children}
    </label>
  );
}
