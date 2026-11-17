'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogBody,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useAuth } from '@/lib/auth-client';

const AddToIosSafari = () => {
  const t = useTranslations('components.addToHomeScreen.ios.safari');
  const tCommon = useTranslations('components.addToHomeScreen.common');

  return (
    <>
      <div className='text-sm font-semibold'>{t('title')}</div>
      <ol className='list-disc ps-4 text-muted-foreground text-sm space-y-1'>
        <li>
          {tCommon.rich('clickIcon', {
            icon: () => <Icons.share className='size-4 inline' />
          })}
        </li>
        <li>
          {tCommon('scrollDownClick')}
          <br/>
          <span className='inline-flex items-center gap-1 border rounded-md px-2 py-1 mt-1'>
            <Icons.squarePlus className='size-4' /> {tCommon('addToHomeScreen')}
          </span>
        </li>
        <li>
          {t('step3')}
        </li>
      </ol>
    </>
  );
};

const AddToIosChrome = () => {
  const t = useTranslations('components.addToHomeScreen.ios.chrome');
  const tCommon = useTranslations('components.addToHomeScreen.common');

  return (
    <>
      <div className='text-sm font-semibold'>{t('title')}</div>
      <ol className='list-disc ps-4 text-muted-foreground text-sm space-y-1'>
        <li>
          {tCommon.rich('clickIcon', {
            icon: () => <Icons.share className='size-4 inline' />
          })}
        </li>
        <li>
          {tCommon('scrollDownClick')}
          <br/>
          <span className='inline-flex items-center gap-1 border rounded-md px-2 py-1 mt-1'>
            <Icons.squarePlus className='size-4' fill='currentColor' /> {tCommon('addToHomeScreen')}
          </span>
        </li>
      </ol>
    </>
  );
};

const AddToChrome = () => {
  const t = useTranslations('components.addToHomeScreen.android.chrome');
  const tCommon = useTranslations('components.addToHomeScreen.common');

  return (
    <>
      <div className='text-sm font-semibold'>{t('title')}</div>
      <ol className='list-disc ps-4 text-muted-foreground text-sm space-y-1'>
        <li>
          {tCommon.rich('clickIcon', {
            icon: () => <Icons.ellipsisVertical className='size-4 inline' />
          })}
        </li>
        <li>
          {tCommon('scrollDownClick')}
          <br/>
          <span className='inline-flex items-center gap-1 border rounded-md px-2 py-1 mt-1'>
            <Icons.addToHomeScreen className='size-4' fill='currentColor' /> {tCommon('addToHomeScreen')}
          </span>
        </li>
      </ol>
    </>
  );
};

const AddToIosFirefox = () => {
  const t = useTranslations('components.addToHomeScreen.ios.firefox');
  const tCommon = useTranslations('components.addToHomeScreen.common');

  return (
    <>
      <div className='text-sm font-semibold'>{t('title')}</div>
      <ol className='list-disc ps-4 text-muted-foreground text-sm space-y-1'>
        <li>
          {tCommon.rich('clickIcon', {
            icon: () => <Icons.menu className='size-4 inline' />
          })}
        </li>
        <li>
          {t.rich('step2', {
            icon: () => <Icons.share className='size-4 inline' />
          })}
        </li>
        <li>
          {t('step3')}
          <br/>
          <span className='inline-flex items-center gap-1 border rounded-md px-2 py-1 mt-1'>
            <Icons.squarePlus className='size-4' /> {tCommon('addToHomeScreen')}
          </span>
        </li>
      </ol>
    </>
  );
};

const AddToFirefox = () => {
  const t = useTranslations('components.addToHomeScreen.android.firefox');
  const tCommon = useTranslations('components.addToHomeScreen.common');

  return (
    <>
      <div className='text-sm font-semibold'>{t('title')}</div>
      <ol className='list-disc ps-4 text-muted-foreground text-sm space-y-1'>
        <li>
          {tCommon.rich('clickIcon', {
            icon: () => <Icons.ellipsisVertical className='size-4 inline' />
          })}
        </li>
        <li>
          {tCommon('scrollDownClick')}
          <br/>
          <span className='inline-flex items-center gap-1 border rounded-md px-2 py-1 mt-1'>
            <Icons.addToHomeScreen className='size-4' fill='currentColor' /> {tCommon('addToHomeScreen')}
          </span>
        </li>
      </ol>
    </>
  );
};

const AddToUnknown = () => {
  const t = useTranslations('components.addToHomeScreen.unknown');

  return (
    <>
      <div className='text-sm font-semibold'>{t('title')}</div>
      <ol className='list-disc ps-4 text-muted-foreground text-sm space-y-1'>
        <li>{t('step1')}</li>
        <li>{t('step2')}</li>
        <li>{t('step3')}</li>
      </ol>
    </>
  );
};

const STORAGE_KEY = 'add-to-home-screen';
const DELAY_DAYS = 400;
const MIN_VISITS = 5;

function AddToHomeScreenContent() {
  const t = useTranslations('components.addToHomeScreen');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstallSupported, setIsInstallSupported] = useState(false);
  const [userAgentData, setUserAgentData] = useState(null);

  const setLocalStorageTimestamp = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      timestamp: new Date().getTime()
    }));
  };

  useEffect(() => {
    const getUserAgent = () => {
      if (typeof window !== 'undefined' && typeof window?.navigator !== 'undefined') {
        const userAgentString = navigator.userAgent || '';
        const platform = navigator?.userAgentData?.platform || navigator?.platform;

        // Determine browser type
        const browsers = {
          Firefox: 'Firefox',
          FxiOS: 'FxiOS',
          Chrome: 'Chrome',
          CriOS: 'CriOS',
          Safari: 'Safari'
        };

        const userAgent = Object.entries(browsers).find(([key]) =>
          userAgentString.includes(key)
        )?.[1] || 'unknown';

        const isIOS = (() => {
          if (platform === 'iOS' || platform === 'iPhone' || platform === 'iPad' || platform === 'iPod') {
            return true;
          }

          // iPad on iOS 13+ pretends to be a Mac but has touch support
          const maxTouchPoints = navigator.maxTouchPoints || 0;
          const isLikelyIPad = userAgentString.includes('Macintosh') && (platform === 'MacIntel') && (maxTouchPoints > 1);
          return /iPhone|iPad|iPod/i.test(userAgentString) || isLikelyIPad;
        })();

        const isAndroid = /Android/i.test(userAgentString);

        return {
          isMobile : !!(isIOS || isAndroid),
          isIOS: isIOS,
          isStandalone: window.matchMedia('(display-mode: standalone)').matches,
          userAgent: userAgent,
          userAgentString: userAgentString,
        };
      }

      return {
        isMobile: false,
        isIOS: false,
        isStandalone: false,
        userAgent: 'unknown',
        userAgentString: 'unknown'
      };
    };

    // Check timestamp and reset if needed
    const checkTimestamp = () => {
      try {
        const item = localStorage.getItem(STORAGE_KEY);
        if (item) {
          const data = JSON.parse(item);
          if (data?.timestamp) {
            const now = new Date().getTime();
            const daysSinceLastPrompt = (now - data.timestamp) / (1000 * 60 * 60 * 24);
            if (daysSinceLastPrompt >= DELAY_DAYS) {
              // Reset if more than 365 days
              localStorage.setItem(STORAGE_KEY, JSON.stringify({
                visits: 0
              }));
              return true;
            }
            return false; // Don't show if within 365 days
          }
        }
        return true;
      } catch {
        return false;
      }
    };

    const getVisitCount = () => {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          return parsed?.visits || 0;
        }
        // Initialize visit count if not set
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ visits: 0 }));
        return 0;
      } catch {
        return 0;
      }
    };

    const incrementVisitCount = () => {
      try {
        const currentCount = getVisitCount();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          visits: currentCount + 1
        }));
        return currentCount + 1;
      } catch {
        return 0;
      }
    };

    // Check if beforeinstallprompt is supported
    const checkInstallSupport = () => {
      return 'BeforeInstallPromptEvent' in window;
    };

    const userAgentData = getUserAgent();
    setUserAgentData(userAgentData);

    if (userAgentData.isStandalone || !userAgentData.isMobile) {
      return;
    }

    // First check timestamp
    if (!checkTimestamp()) {
      return;
    }

    const visitCount = incrementVisitCount();
    if (visitCount >= MIN_VISITS) {
      setIsVisible(checkInstallSupport());
      setIsInstallSupported(checkInstallSupport());
    }
  }, []);

  useEffect(() => {
    if (!isInstallSupported) {
      return;
    }

    const handler = (e) => setDeferredPrompt(e);

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isInstallSupported]);

  const handleAddToHomeScreen = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // if (outcome === 'accepted') {
    //   console.log('User accepted the A2HS prompt');
    // } else {
    //   console.log('User dismissed the A2HS prompt');
    // }
    setDeferredPrompt(null);
    setIsVisible(false);

    setLocalStorageTimestamp();
  };

  const handleClose = () => {
    setIsVisible(false);
    setLocalStorageTimestamp();
  };

  if (!isVisible || !userAgentData) {
    return null;
  }

  return (
    <ResponsiveDialog open={isVisible} onOpenChange={handleClose}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t('title')}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className=''>
          <div className='flex flex-col gap-4'>
            <div>
              {t('description')}
            </div>
            {!isInstallSupported && (
              <>
                {userAgentData?.isIOS ? (
                  <>
                    {userAgentData?.userAgent === 'Safari' && <AddToIosSafari />}
                    {userAgentData?.userAgent === 'CriOS' && <AddToIosChrome />}
                    {userAgentData?.userAgent === 'FxiOS' && <AddToIosFirefox />}
                    {!['Safari', 'CriOS', 'FxiOS'].includes(userAgentData?.userAgent) && <AddToUnknown />}
                  </>
                ) : (
                  <>
                    {userAgentData?.userAgent === 'Chrome' && <AddToChrome />}
                    {userAgentData?.userAgent === 'Firefox' && <AddToFirefox />}
                    {!['Chrome', 'Firefox'].includes(userAgentData?.userAgent) && <AddToUnknown />}
                  </>
                )}
              </>
            )}
          </div>
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          <Button variant='outline' onClick={handleClose}>
            {!isInstallSupported ? t('buttons.gotIt') : t('buttons.maybeLater')}
          </Button>
          {isInstallSupported && (
            <Button onClick={handleAddToHomeScreen}>
              {t('buttons.installNow')}
            </Button>
          )}
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export function AddToHomeScreen() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  return <AddToHomeScreenContent />;
}