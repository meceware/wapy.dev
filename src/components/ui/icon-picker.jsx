'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { SimpleIconsLicenseFiltered } from '@/components/filtered-icons';
import { defaultCompanies } from '@/config/companies';
import * as LucideIcons from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

const toNormalCase = str => str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const useIconsPackage = () => {
  const [dashboardIconsMetadata, setDashboardIconsMetadata] = useState({});

  useEffect(() => {
    fetch('/icons/dashboard/metadata.json')
      .then((res) => {
        if (!res.ok) throw new Error('No metadata file found');
        return res.json();
      })
      .then(setDashboardIconsMetadata)
      .catch(() => setDashboardIconsMetadata({}));
  }, []);

  return useMemo(() => {
    // Lucide icons
    const lucideIconsObj = Object.entries(LucideIcons).reduce((acc, [name, Icon]) => {
      if (name === 'default' || !Icon?.displayName) return acc;
      // Skip duplicates that have 'Lucide' prefix or 'Icon' suffix
      if (name.startsWith('Lucide') || name.endsWith('Icon')) return acc;
      return [
        ...acc,
        {
          name: name,
          title: Icon.displayName,
          slug: name,
          library: 'Lucide',
          render: () => Icon ? <Icon /> : false
        }
      ];
    }, []);

    // SimpleIcons
    const simpleIconsObj = Object.entries(SimpleIconsLicenseFiltered).reduce((acc, [name, icon]) => {
      return [
        ...acc,
        {
          name: name,
          title: icon.title,
          slug: icon.slug,
          library: 'SimpleIcons',
          render: () => (
            <svg
              role='img'
              viewBox='0 0 24 24'
              fill={icon.hex ? `#${icon.hex}` : 'currentColor'}
              xmlns='http://www.w3.org/2000/svg'
            >
              <path d={icon.path} />
            </svg>
          )
        }
      ];
    }, []);

    // Dashboard icons
    const dashboardIconsObj = Object.entries(dashboardIconsMetadata || {}).reduce((acc, [name, icon]) => {
      return [
        ...acc,
        {
          name: name,
          title: toNormalCase(name),
          slug: `di-${name}`,
          library: 'DashboardIcons',
          aliases: icon.aliases || [],
          colors: icon.colors || {},
          render: () => (
            <>
              <img
                src={`/icons/dashboard/${icon?.colors?.dark ? icon.colors.dark : name}.svg`}
                alt={toNormalCase(name)}
                className={'size-8 object-contain hidden dark:block'}
              />
              <img
                src={`/icons/dashboard/${icon?.colors?.light ? icon.colors.light : name}.svg`}
                alt={toNormalCase(name)}
                className={'size-8 object-contain block dark:hidden'}
              />
            </>
          )
        }
      ];
    }, []);

    const mergedIcons = [
      ...dashboardIconsObj,
      ...simpleIconsObj,
      ...lucideIconsObj,
    ];

    const defaultIcons = dashboardIconsObj
      .filter(icon =>
        defaultCompanies.some(company =>
          company.toLowerCase() === icon.title.toLowerCase()
        )
      );

    return {
      icons: mergedIcons,
      filter: (searchTerm) => {
        if (!searchTerm) return defaultIcons;

        if (typeof searchTerm === 'object' && searchTerm?.icon) {
          return mergedIcons.filter(icon => icon.slug === searchTerm.icon);
        }

        const term = searchTerm.trim().toLowerCase();
        if (term === '') {
          return defaultIcons;
        }

        const dashboardResults = dashboardIconsObj.filter(icon =>
          icon.title.toLowerCase().includes(term) ||
          icon.name.toLowerCase().includes(term)  ||
          icon.aliases.some(alias => alias.toLowerCase().includes(term))
        ).slice(0, 30);

        const simpleResults = simpleIconsObj.filter(icon =>
          icon.title.toLowerCase().includes(term)
        ).slice(0, 20);

        const lucideResults = lucideIconsObj.filter(icon =>
          icon.title.toLowerCase().includes(term)
        ).slice(0, 20);

        return [
          ...dashboardResults,
          ...simpleResults,
          ...lucideResults
        ];
      }
    };
  }, [dashboardIconsMetadata]);
};

export const LogoIcon = ({ icon, className, children }) => {
  if (icon) {
    if (icon.library === 'url') {
      return (
        <img
          src={icon.icon}
          alt={children}
          width={64}
          height={64}
          className={cn('size-8 rounded-full object-cover', className)}
        />
      );
    }  else if (icon.library === 'Lucide' && LucideIcons[icon.icon]) {
      const LucideIcon = LucideIcons[icon.icon];
      return (
        <>
          <LucideIcon className={cn('size-8', className)} />
        </>
      );
    } else if (icon.library === 'SimpleIcons' && SimpleIconsLicenseFiltered[icon.icon]) {
      const simpleIcon = SimpleIconsLicenseFiltered[icon.icon];
      return (
        <svg
          role="img"
          viewBox="0 0 24 24"
          className={cn('size-8', className)}
          fill={simpleIcon.hex ? `#${simpleIcon.hex}` : 'currentColor'}
        >
          <path d={simpleIcon.path} />
        </svg>
      );
    } else if (icon.library === 'DashboardIcons') {
      return (
        <>
          <img
            src={`/icons/dashboard/${icon?.colors?.dark ? icon.colors.dark : icon.icon}.svg`}
            alt={toNormalCase(icon.icon)}
            className={'size-8 object-contain hidden dark:block'}
          />
          <img
            src={`/icons/dashboard/${icon?.colors?.light ? icon.colors.light : icon.icon}.svg`}
            alt={toNormalCase(icon.icon)}
            className={'size-8 object-contain block dark:hidden'}
          />
        </>
      );
    }
  }

  return <>{children}</>;
};

// icon parameter is an object as follows:
// { library: 'SimpleIcons', icon: 'icon-slug' }
export const IconPicker = ({ icon, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [parsedIcon, setParsedIcon] = useState(() => {
    try {
      return icon ? JSON.parse(icon) : null;
    } catch (error) {
      return null;
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(parsedIcon?.library !== 'url');
  const iconsPackage = useIconsPackage();

  const selectedIcon = useMemo(() => {
    if (!parsedIcon) {
      return null;
    }

    if (parsedIcon.library === 'url') {
      setSearchTerm(parsedIcon.icon);
      return {
        library: 'url',
        title: '',
        icon: parsedIcon.icon,
        render: () => <img src={parsedIcon.icon} alt='Custom icon' className='size-6' />
      };
    }

    const icon = iconsPackage.icons.find(icon =>
      icon.name === parsedIcon.icon &&
      icon.library === parsedIcon.library
    );
    setSearchTerm(icon?.title || '');
    return icon;
  }, [parsedIcon, iconsPackage.icons]);

  const filteredIcons = useMemo(() => {
    return iconsPackage.filter(searchTerm);
  }, [searchTerm, iconsPackage]);

  const handleSelect = (icon) => {
    const newIcon = {
      library: icon.library,
      icon: icon.name,
      colors: icon?.colors,
    };
    onChange(JSON.stringify(newIcon));
    setParsedIcon(newIcon);
    setIsOpen(false);
  };

  const handleSearchTerm = (value) => {
    setSearchTerm(value);
    // Check if input is a URL
    try {
      const url = new URL(value);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        setIsIconSelectorOpen(false);
        // Check if URL points to an image
        if (!url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
          return;
        }
        handleSelect({
          library: 'url',
          name: value
        });
      }
    } catch (e) {
      // Not a URL, continue with normal search
      setIsIconSelectorOpen(true);
    }
  };

  return (
    <div className='flex flex-col gap-1'>
      {!isOpen ? (
        <Button
          variant='outline'
          className='inline-flex flex-col items-center gap-2 max-w-36 h-24 [&_svg]:size-10 '
          onClick={() => setIsOpen(true)}
        >
          {selectedIcon ? (
            <>
              {selectedIcon.render()}
              <span className='text-xs truncate w-full'>{selectedIcon.title}</span>
            </>
          ) : (
            <span>Select icon</span>
          )}
        </Button>
      ) : (
        <>
          <div className='flex items-center gap-2'>
            <div className='relative w-full'>
              <Input
                placeholder='Type to search for an icon or enter an URL'
                value={searchTerm}
                onChange={(e) => handleSearchTerm(e.target.value)}
                autoFocus
                type='search'
                className='pr-10'
              />
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsOpen(false)}
                className='absolute right-0 top-0 hover:bg-transparent'
              >
                <Icons.x className='h-4 w-4 text-muted-foreground' />
              </Button>
            </div>
          </div>
          {isIconSelectorOpen && (
            <Card className='border-dashed rounded-sm'>
              <ScrollArea className='h-45 py-2'>
                <CardContent className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 p-0 place-items-center'>
                  {filteredIcons.map(icon => (
                    <Button
                      key={icon.slug}
                      variant='ghost'
                      className='size-20 flex flex-col items-center justify-center gap-1 hover:bg-accent [&_svg]:size-8 p-2'
                      type='button'
                      onClick={() => handleSelect(icon)}
                      title={icon?.title}
                    >
                      {icon.render()}
                      <span className='text-xs truncate w-full text-center'>{icon?.title}</span>
                    </Button>
                  ))}
                </CardContent>
              </ScrollArea>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
