'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import Cookies from 'js-cookie';

const COOKIE_PREFERENCES_KEY = 'cookie-preferences-v1';

const defaultPreferences= {
  essential: true,
  functional: true,
  analytics: false,
};

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    // Check if user has already set preferences
    const savedPreferences = Cookies.get(COOKIE_PREFERENCES_KEY);
    if (!savedPreferences) {
      setShowConsent(true);
    } else {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const savePreferences = (prefs) => {
    Cookies.set(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs), { expires: 365 });
    setPreferences(prefs);
    setShowConsent(false);

    // Clear non-essential cookies if they're declined
    if (!prefs.functional) {
      Cookies.remove('theme');
      Cookies.remove('locale');
    }
  };

  const acceptAll = () => {
    savePreferences({
      essential: true,
      functional: true,
      analytics: true,
    });
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!showConsent) return null;

  return (
    <Card className='fixed bottom-4 left-4 right-4 mx-auto max-w-xl z-50'>
      <CardHeader>
        <CardTitle>Cookie Preferences</CardTitle>
        <CardDescription>
          Please select which cookies you want to accept. Essential cookies cannot be disabled as they are required for the website to function.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <Checkbox
            checked={preferences.essential}
            disabled={true}
          />
          <div className='grid gap-1.5 leading-none'>
            <label className='font-medium'>
              Essential Cookies
            </label>
            <p className='text-sm text-muted-foreground'>
              Required for the website to function (authentication, security).
            </p>
          </div>
        </div>

        <Separator />

        <div className='flex items-center space-x-2'>
          <Checkbox
            checked={preferences.functional}
            onCheckedChange={(checked) =>
              setPreferences(prev => ({ ...prev, functional: checked === true }))
            }
          />
          <div className='grid gap-1.5 leading-none'>
            <label className='font-medium'>
              Functional Cookies
            </label>
            <p className='text-sm text-muted-foreground'>
              Enhance your experience (theme, language preferences).
            </p>
          </div>
        </div>

        <Separator />

        <div className='flex items-center space-x-2'>
          <Checkbox
            checked={preferences.analytics}
            onCheckedChange={(checked) =>
              setPreferences(prev => ({ ...prev, analytics: checked === true }))
            }
          />
          <div className='grid gap-1.5 leading-none'>
            <label className='font-medium'>
              Analytics Cookies
            </label>
            <p className='text-sm text-muted-foreground'>
              Help us understand how visitors interact with our website.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className='flex justify-end gap-2'>
        <Button variant='outline' onClick={saveCustomPreferences}>
          Save Preferences
        </Button>
        <Button onClick={acceptAll}>
          Accept All
        </Button>
      </CardFooter>
    </Card>
  );
}