import { useState } from 'react';
import {
  Check,
  Droplet,
  Eraser,
  Languages,
  LogOut,
  Monitor,
  Moon,
  Palette,
  RefreshCw,
  Ruler,
  SunMedium,
  SwatchBook,
} from 'lucide-react';

import type { MeDTO } from '@repo/dtos';
import { cn } from '~/utils/classnames';
import { sizes } from '~/styles/constants';
import { useCurrentUser } from '~/queries/auth';
import { queryClient } from '~/queries/_client';
import { useSettings, type VolumeUnit } from '~/stores/settings';
import { accentColors, resolveDark, type AccentColor, type ThemeMode } from '~/utils/theme';
import { H1 } from '~/components/typography';
import { ConfirmDrawer, SegmentedControl, SettingsGroup, SettingsRow } from './settings-ui';

const themeOptions: { value: ThemeMode; label: string; Icon: typeof Monitor }[] = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: SunMedium },
  { value: 'dark', label: 'Dark', Icon: Moon },
];

const volumeUnitOptions: { value: VolumeUnit; label: string }[] = [
  { value: 'ml', label: 'ml' },
  { value: 'cl', label: 'cl' },
  { value: 'oz', label: 'oz' },
];

export function ProfileScreen() {
  const { data: currentUser } = useCurrentUser();
  const { theme, volumeUnit, setTheme, setVolumeUnit } = useSettings();

  const [confirm, setConfirm] = useState<'logout' | 'clear-cache' | null>(null);
  const [checkingUpdates, setCheckingUpdates] = useState(false);

  // For now a plain reload; once the PWA service worker lands this should call
  // registration.update() and activate the waiting worker instead.
  const handleCheckUpdates = () => {
    setCheckingUpdates(true);
    window.location.reload();
  };

  const handleClearCache = async () => {
    queryClient.clear();
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
    window.location.reload();
  };

  const handleLogout = () => (window.location.href = '/api/auth/logout');

  return (
    <div
      className="bg-muted dark:bg-background min-h-full px-4"
      style={{
        paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
        paddingBottom: sizes.bottomNavbarGuard,
      }}
    >
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <H1 className="text-foreground px-1 text-3xl">Profile</H1>

        {currentUser && <ProfileCard user={currentUser} />}

        <SettingsGroup title="Personalization">
          <SettingsRow Icon={Palette} label="Theme">
            <SegmentedControl label="Theme" value={theme} options={themeOptions} onChange={setTheme} />
          </SettingsRow>
          <AccentRow />
          <SettingsRow Icon={Ruler} label="Units" description="Used for recipe amounts">
            <SegmentedControl
              label="Volume unit"
              value={volumeUnit}
              options={volumeUnitOptions}
              onChange={setVolumeUnit}
            />
          </SettingsRow>
          <SettingsRow Icon={Languages} label="Language" trailing="English (US)" />
        </SettingsGroup>

        <SettingsGroup title="App">
          <SettingsRow
            Icon={RefreshCw}
            label={checkingUpdates ? 'Checking for updates…' : 'Check for updates'}
            description={`Version ${__APP_VERSION__}`}
            onClick={handleCheckUpdates}
            disabled={checkingUpdates}
          />
          <SettingsRow
            Icon={Eraser}
            label="Clear cache"
            description="Reloads the app with fresh data"
            onClick={() => setConfirm('clear-cache')}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow Icon={LogOut} label="Log out" destructive onClick={() => setConfirm('logout')} />
        </SettingsGroup>
      </div>

      <ConfirmDrawer
        open={confirm === 'clear-cache'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Clear cache?"
        description="Cached data will be removed and the app will reload. Your settings are kept."
        confirmLabel="Clear cache"
        onConfirm={handleClearCache}
      />
      <ConfirmDrawer
        open={confirm === 'logout'}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Log out?"
        description="You'll need to sign in again to access your bar."
        confirmLabel="Log out"
        onConfirm={handleLogout}
      />
    </div>
  );
}

function ProfileCard(props: { user: MeDTO }) {
  const { user } = props;
  const initials = user.username
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div className="bg-card border-border flex items-center gap-4 rounded-2xl border p-4">
      <span className="bg-primary text-primary-foreground flex size-14 shrink-0 items-center justify-center rounded-full text-xl font-semibold">
        {initials || '?'}
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-foreground truncate text-lg font-semibold">{user.username}</span>
        <span className="text-muted-foreground truncate text-sm">{user.email}</span>
      </div>
    </div>
  );
}

const accentOptions = Object.keys(accentColors) as Exclude<AccentColor, 'default'>[];

function AccentRow() {
  const { theme, accent, setAccent } = useSettings();
  const shade = resolveDark(theme) ? 'dark' : 'light';

  return (
    <SettingsRow Icon={SwatchBook} label="Accent color" trailing={<span className="capitalize">{accent}</span>}>
      <div role="radiogroup" aria-label="Accent color" className="flex flex-wrap gap-2.5">
        <Swatch
          label="Default"
          selected={accent === 'default'}
          onSelect={() => setAccent('default')}
          className="bg-foreground"
          Icon={Droplet}
        />
        {accentOptions.map((name) => (
          <Swatch
            key={name}
            label={name}
            selected={accent === name}
            onSelect={() => setAccent(name)}
            color={accentColors[name][shade]}
          />
        ))}
      </div>
    </SettingsRow>
  );
}

type SwatchProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
  color?: string;
  className?: string;
  Icon?: typeof Check;
};

function Swatch(props: SwatchProps) {
  const { label, selected, onSelect, color, className, Icon } = props;
  const MarkIcon = selected ? Check : Icon;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      title={label}
      onClick={onSelect}
      style={{ backgroundColor: color }}
      className={cn(
        'ring-offset-card flex size-8 items-center justify-center rounded-full outline-none transition-shadow',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2',
        selected && 'ring-foreground ring-2 ring-offset-2',
        className
      )}
    >
      {MarkIcon && <MarkIcon className="text-background size-4" strokeWidth={selected ? 3 : 2} />}
    </button>
  );
}
