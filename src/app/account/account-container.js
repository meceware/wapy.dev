'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { useScrollLock } from 'usehooks-ts';
import { useTheme } from 'next-themes';
import { initializePaddle } from '@paddle/paddle-js';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from '@/components/ui/responsive-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  UserLoadDefaultCategories,
  UserRemoveCategory,
  UserSaveCategory,
  UserUpdateTimezone,
  UserUpdateCurrency,
  UserUpdateNotifications,
  UserUpdateName,
  UserExportData,
} from './actions';
import { SchemaCategory, SchemaUserNotifications } from './schema';
import { DefaultCategories } from '@/config/categories';
import { CurrencyFieldManager } from '@/components/subscriptions/form/field-currency';
import { TimezoneFieldManager } from '@/components/subscriptions/form/field-timezone';
import { NotificationsFieldManager } from '@/components/subscriptions/form/field-notifications';
import { cn } from '@/lib/utils';
import { PADDLE_STATUS_MAP } from '@/lib/paddle/enum';
import { paddleCheckSubscriptionCheckout, paddleCancelSubscription, paddleResumeSubscription } from '@/lib/paddle/actions';

const TimezoneManager = ({ user }) => {
  const [selectedTimezone, setSelectedTimezone] = useState(user?.timezone);
  const [loading, setLoading] = useState(false);

  const handleTimezoneChange = async (value) => {
    try {
      setLoading(true);
      setSelectedTimezone(value);
      const { success } = await UserUpdateTimezone(value);
      if (success) {
        toast.success('Timezone updated successfully');
      } else {
        toast.error('Failed to update timezone');
      }
    } catch (error) {
      toast.error('Failed to update timezone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-2'>
      <Label>Timezone</Label>
      <TimezoneFieldManager field={{ value: selectedTimezone, onChange: handleTimezoneChange }} loading={loading} />
    </div>
  );
};

const CurrencyManager = ({ user }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || 'EUR');
  const [loading, setLoading] = useState(false);

  const handleCurrencyChange = async (currency) => {
    try {
      setLoading(true);
      setSelectedCurrency(currency);
      const { success } = await UserUpdateCurrency(currency);
      if (success) {
        toast.success('Currency updated successfully');
      } else {
        toast.error('Failed to update currency');
      }
    } catch (error) {
      toast.error('Failed to update currency');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-2'>
      <Label>Currency</Label>
      <CurrencyFieldManager field={{ value: selectedCurrency, onChange: handleCurrencyChange }} loading={loading} />
    </div>
  );
};

const DefaultSettings = ({ user }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Default Settings</CardTitle>
        <CardDescription>
          Configure your default settings for new subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <TimezoneManager user={user} />
        <CurrencyManager user={user} />
      </CardContent>
    </Card>
  );
};

const NotificationManager  = ({user}) => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(user?.notifications);

  const handleSave = async () => {
    try {
      setLoading(true);
      const validated = SchemaUserNotifications.parse(notifications);
      if (!validated) throw new Error('Invalid notifications data');
      const { success } = await UserUpdateNotifications(notifications);
      if (success) {
        toast.success('Notification preferences saved');
      } else {
        toast.error('Failed to save notification preferences');
      }
    } catch (error) {
      toast.error('Failed to save notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const field = { value: notifications, onChange: (notifications) => {
    setNotifications(notifications);
  } };

  return (
    <NotificationsFieldManager field={field} isLoading={loading} >
      <Button
        onClick={handleSave}
        className='w-full sm:w-auto'
        disabled={loading}
        title='Save notification preferences'
      >
        <Icons.save />
        Save Changes
      </Button>
    </NotificationsFieldManager>
  );
};

const UserProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || user.email.split('@')[0] || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const { success } = await UserUpdateName(name);
      if (success) {
        setIsEditing(false);
        toast.success('Your name has been updated successfully.');
      } else {
        toast.error('Failed to update your name!');
      }
    } catch (error) {
      toast.error('Failed to update your name!');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 text-2xl font-bold tracking-tight'>
          <Avatar className='size-20 border-2 border-primary'>
            <AvatarImage src={user.image} alt={name} />
            <AvatarFallback className='bg-primary/10 text-2xl'>{name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className='flex flex-col items-center sm:items-start w-full'>
            {isEditing ? (
              <div className='flex flex-col sm:flex-row items-center gap-2 w-full'>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='Enter your name'
                  className='w-full font-normal'
                  disabled={loading}
                />
                <div className='flex gap-2 w-full sm:w-auto justify-center'>
                  <Button
                    onClick={handleSave}
                    size='sm'
                    className='w-full sm:w-auto'
                    disabled={loading}
                    title='Save'
                  >
                    {loading ? (
                      <Icons.spinner className='animate-spin' />
                    ) : (
                      <Icons.save />
                    )}
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant='outline'
                    size='sm'
                    className='w-full sm:w-auto'
                    disabled={loading}
                    title='Cancel'
                  >
                    <Icons.x />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className='flex items-center justify-center sm:justify-start gap-2 w-full'>
                <span className='line-clamp-1 break-all text-center sm:text-left'>
                  {name || 'Add your name'}
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsEditing(true)}
                  title='Edit'
                >
                  <Icons.edit />
                </Button>
              </div>
            )}
            <div className='flex flex-col gap-2 mt-2 w-full'>
              <div className='text-sm text-muted-foreground inline-flex items-center gap-2 text-left'>
                <Icons.mail className='size-4' />
                <span className='truncate'>{user.email}</span>
              </div>
              <div className='text-sm text-muted-foreground inline-flex items-center gap-2 text-left'>
                <Icons.calendar className='size-4' />
                <span className='line-clamp-2 break-words'>Member since {format(new Date(user.createdAt), 'MMMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

const CategorySkeleton = () => (
  <div className='flex items-center justify-start gap-2 px-4 py-2 border rounded-md'>
    <Skeleton className='size-4 rounded-full' />
    <Skeleton className='w-64 h-5 my-0.5' />
  </div>
);

const CategorySkeletons = () => (
  <>
    {Array.from({ length: 5 }).map((_, index) => (
      <CategorySkeleton key={index} />
    ))}
  </>
);

const CategoryItemEdit = ({ name, color, onCancel, onSave, onDelete }) => {
  const [editedColor, setEditedColor] = useState(color);
  const [editedName, setEditedName] = useState(name);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className='flex flex-col sm:flex-row items-start justify-between gap-2 w-full'>
      <div className='flex items-center gap-2 w-full'>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='ghost' className='p-2' title='Select color'>
              <div
                className='size-6 rounded-full'
                style={{ backgroundColor: editedColor }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-40'>
            <div className='grid grid-cols-3 gap-4'>
              {Object.values(DefaultCategories).map((c, i) => (
                <Button
                  key={i}
                  className={`size-8 rounded-full cursor-pointer hover:scale-110 transition-transform ${
                    editedColor === c ? 'ring-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setEditedColor(c)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Input
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          className='flex-1'
          placeholder='Category name'
        />
      </div>
      <div className='flex items-center gap-2 w-full sm:w-auto'>
        <Button
          onClick={onCancel}
          variant='outline'
          size='icon'
          className='flex-1 sm:flex-none'
          title='Cancel'
        >
          <Icons.x className='size-4' />
        </Button>
        <Button
          onClick={() => onSave(editedName, editedColor)}
          size='icon'
          className='flex-1 sm:flex-none'
          title='Save'
        >
          <Icons.save className='size-4' />
        </Button>
        <Button
          onClick={() => setDialogOpen(true)}
          variant='destructive'
          size='icon'
          className='flex-1 sm:flex-none'
          title='Delete'
        >
          <Icons.trash className='size-4' />
        </Button>
      </div>
      <ResponsiveDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Delete Category</ResponsiveDialogTitle>
            <ResponsiveDialogDescription className='text-left'>
              Are you sure you want to delete this category? This action cannot be undone.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogFooter>
            <Button
              variant='outline'
              onClick={() => setDialogOpen(false)}
              title='Cancel'
            >
              Cancel
            </Button>
            <Button
              onClick={() => {setDialogOpen(false); onDelete();}}
              variant='destructive'
              title='Delete'
            >
              Delete
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
};

const CategoryItem = ({ category, onSave, onDelete, edit = false }) => {
  const [editingName, setEditingName] = useState(category.name);
  const [editingColor, setEditingColor] = useState(category.color);
  const [isEditing, setIsEditing] = useState(edit);
  const [isSkeleton, setIsSkeleton] = useState(false);

  const handleDoubleClick = () => {
    setEditingName(category.name);
    setEditingColor(category.color);
    setIsEditing(true);
  };

  const handleSave = async (name, color) => {
    const validatedData = SchemaCategory.parse({ name: name, color: color });
    if (!validatedData) {
      toast.error('Invalid category data');
      return;
    }

    setIsSkeleton(true);
    setEditingName(name);
    setEditingColor(color);
    const updated = await onSave({ ...category, ...validatedData });
    if (updated) {
      setIsEditing(false);
    }
    setIsSkeleton(false);
  };

  const handleDelete = () => {
    setIsEditing(false);
    setIsSkeleton(true);
    onDelete(category, category?.temporaryId ? false : true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsSkeleton(false);
    if (category?.temporaryId) {
      onDelete(category, false);
    }
  };

  if (isSkeleton) {
    return <CategorySkeleton />;
  }

  return (
    <div className='group relative flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-accent/50 transition-colors'>
      {isEditing ? (
        <CategoryItemEdit
          color={editingColor}
          name={editingName}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
      ) : (
        <>
          <div className='flex items-center gap-3 text-sm'>
            <div
              className='size-6 rounded-full flex-none ring-1 ring-border transition-transform group-hover:scale-110'
              style={{ backgroundColor: category.color }}
            />
            <span className='line-clamp-2 break-all'>{category.name}</span>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleDoubleClick}
            title='Edit category'
          >
            <Icons.edit />
            <span className='sr-only'>Edit category</span>
          </Button>
        </>
      )}
    </div>
  );
};

const CategoryManager = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(user.categories ? [...user.categories] : []);

  const loadDefaultCategories = async () => {
    try {
      setLoading(true);
      await UserLoadDefaultCategories().then((defaultCategories) => {
        setCategories([...categories, ...defaultCategories]);
        setLoading(false);
        toast.success('Default categories loaded successfully!');
      });
    } catch (error) {
      toast.error('Failed to create default categories!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category, isToast = true) => {
    try {
      if (category?.temporaryId) {
        setCategories(categories.filter((c) => c.temporaryId !== category.temporaryId));
      } else {
        await UserRemoveCategory(category.id).then((deletedCategory) => {
          setCategories(categories.filter((c) => c.id !== deletedCategory.id));
        });
      }
      if (isToast) {
        toast.success('Category deleted successfully!');
      }
    } catch (error) {
      toast.error('Failed to delete category!');
    }
  };

  const handleSave = async (category) => {
    try {
      await UserSaveCategory(category).then((updatedCategory) => {
        setCategories(categories.map((c) => {
          if (c?.temporaryId && c?.temporaryId === category?.temporaryId) {
            return updatedCategory;
          }
          return c.id === updatedCategory.id ? updatedCategory : c;
        }));
      });
      toast.success('Category saved successfully!');
      return true;
    } catch (error) {
      toast.error('Failed to save category!');
    }

    return false;
  };

  const handleAdd = async () => {
    setCategories([...categories, {
      id: null,
      temporaryId: Math.random().toString(16) + '0'.repeat(16) + Date.now().toString(16),
      name: '',
      color: '#9E9E9E'
    }]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
        <CardDescription>
          Manage your categories
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-2'>
        {loading && <CategorySkeletons />}
        {!loading && categories.map((category) => (
          <CategoryItem key={category.id ? category.id : category.temporaryId} category={category} onSave={handleSave} onDelete={handleDelete} edit={category?.temporaryId} />
        ))}
      </CardContent>
      <CardFooter className='gap-2 flex-col sm:flex-row justify-start items-start sm:items-center'>
        <Button disabled={loading} onClick={handleAdd} title='Add new category' className='w-full sm:w-auto'>
          <Icons.add />
          Add
        </Button>
        <Button disabled={loading} onClick={loadDefaultCategories} variant='outline' title='Load default categories' className='w-full sm:w-auto whitespace-normal h-auto min-h-9'>
          <Icons.categories />
          Load Default Categories
        </Button>
      </CardFooter>
    </Card>
  );
};

const PaymentStatusDate = ({date}) => {
  return (
    <div className='inline-flex items-center gap-1'>
      <Popover>
        <PopoverTrigger asChild>
          <span className='inline-flex items-center cursor-pointer'>
            {formatDistanceToNowStrict(date, {addSuffix: true})}
          </span>
        </PopoverTrigger>
        <PopoverContent className='bg-foreground text-background text-sm w-auto max-w-xl break-words px-4 py-1'>
          {format(date, 'dd MMMM yyyy, HH:mm')}
        </PopoverContent>
      </Popover>
    </div>
  );
};

const PaymentStatusCard = ({ loading = false, status, children }) => {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex flex-col gap-1 text-left grow overflow-hidden'>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>
              Your subscription status
            </CardDescription>
          </div>
          {loading && (
            <Skeleton className='size-10 rounded-full' />
          )}
          {!loading && (
            <div className={cn(
              'shrink-0 size-10 rounded-full flex items-center justify-center',
            {
              'bg-green-500/90': status === 'green',
              'bg-orange-500/90': status === 'orange',
              'bg-red-500/90': status === 'red',
            },
          )}>
            {status === 'green' && (
              <Icons.check className='size-5 text-white' />
            )}
            {status === 'orange' && (
              <Icons.triangleAlert className='size-5 text-white' />
            )}
            {status === 'red' && (
              <Icons.x className='size-5 text-white' />
              )}
            </div>
          )}
        </div>
      </CardHeader>
      { loading ? (
        <CardContent className='flex flex-col gap-2'>
          <Skeleton className='h-4 w-36' />
          <Skeleton className='h-4 w-48' />
        </CardContent>
      ) : children }
    </Card>
  );
};

const PaymentStatusTrial = ({ user, paddleStatus }) => {
  const { resolvedTheme } = useTheme();
  const { lock, unlock } = useScrollLock({
    autoLock: false,
  });
  const [paddle, setPaddle] = useState(null);
  const [disabled, setDisabled] = useState(false);

  const subscribeUser = useCallback(() => {
    const paddleCheckout = (paddle) => {
      lock();
      setDisabled(true);
      paddle?.Checkout.open({
        settings: {
          displayMode: 'overlay',
          theme: resolvedTheme === 'dark' ? 'dark' : 'light',
          allowLogout: !user.email,
          // variant: 'one-page',
        },
        items: [{
          priceId: paddleStatus.priceId,
          quantity: 1
        }],
        customer: {
          email: user.email, // TODO: set customer if there is any
        },
      });
    };

    if (!paddle?.Initialized) {
      initializePaddle({
        token: paddleStatus.clientToken,
        environment: paddleStatus.environment,
        eventCallback: (event) => {
          if (event.data && event.name) {
            if (event.name === 'checkout.closed') {
              if (event.data.status === 'completed') {
                paddleCheckSubscriptionCheckout(event.data.customer.id).then(() => {
                  setDisabled(false);
                  unlock();
                });
              } else {
                setDisabled(false);
                unlock();
              }
            }
          }
        },
      }).then(async paddle => {
        if (paddle) {
          setPaddle(paddle);
          paddleCheckout(paddle);
        }
      });
    } else {
      paddleCheckout(paddle);
    }
  }, [paddleStatus, paddle, setPaddle, lock, unlock, user?.email, resolvedTheme, disabled, setDisabled]);

  const isTrialEnding = paddleStatus.remainingDays <= 7;
  const isActive = paddleStatus.status === PADDLE_STATUS_MAP.trialActive;
  const status = isActive
    ? isTrialEnding ? 'orange' : 'green'
    : 'red';

  return (
    <PaymentStatusCard status={status}>
      <CardContent className='flex flex-col gap-1'>
        {isActive ? (
          <>
            <div className={cn(
              'text-base font-medium',
              {
                'text-green-600 dark:text-green-500': status === 'green',
                'text-orange-500': status === 'orange',
                'text-red-500': status === 'red',
              },
            )}>
              <span className='text-sm text-muted-foreground'>Your trial period ends</span >
              {' '}
              <PaymentStatusDate date={paddleStatus.nextPaymentAt} />
              <span className='text-sm text-muted-foreground'>.</span >
            </div>
            <div className='text-sm text-muted-foreground'>
              We will notify you
              {' '}
              {paddleStatus.remainingDays > 1 ? (
                <>
                  <span className='text-foreground'>1 day before</span>
                  {' '}
                  your trial ends.
                </>
              ) : (
                <>
                  <span className='text-foreground'>when</span>
                  {' '}
                  your trial ends.
                </>
              )}
            </div>
          </>
        ) : (
          <div className='text-base font-medium text-red-500'>
            Your trial period has ended!
          </div>
        )}
      </CardContent>
      <CardFooter className='flex flex-col items-start gap-2'>
        <Button size='lg' onClick={subscribeUser} disabled={disabled}>
          {disabled ? (
            <Icons.spinner className='animate-spin' />
          ) : (
            <Icons.sparkles />
          )}
          Ready to continue with us?
        </Button>
      </CardFooter>
    </PaymentStatusCard>
  );
};

const PaymentStatusSubscription = ({ user, paddleStatus }) => {
  const { resolvedTheme } = useTheme();
  const { lock, unlock } = useScrollLock({
    autoLock: false,
  });
  const [paddle, setPaddle] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const cancelSubscription = useCallback(async () => {
    setDisabled(true);
    paddleCancelSubscription(user.paddleUserDetails?.subId).then(() => {
      setDisabled(false);
      setShowCancelDialog(false);
    });
  }, [user.paddleUserDetails?.subId, setDisabled, setShowCancelDialog]);

  const resumeSubscription = useCallback(async () => {
    setDisabled(true);
    paddleResumeSubscription(user.paddleUserDetails?.subId).then(() => {
      setDisabled(false);
    });
  }, [user.paddleUserDetails?.subId, setDisabled, setShowCancelDialog]);

  const subscribeUser = useCallback(() => {
    const paddleCheckout = (paddle) => {
      lock();
      setDisabled(true);
      paddle?.Checkout.open({
        settings: {
          displayMode: 'overlay',
          theme: resolvedTheme === 'dark' ? 'dark' : 'light',
          allowLogout: !user.email,
          // variant: 'one-page',
        },
        items: [{
          priceId: paddleStatus.priceId,
          quantity: 1
        }],
        customer: {
          email: user.email,
        },
      });
    };

    if (!paddle?.Initialized) {
      initializePaddle({
        token: paddleStatus.clientToken,
        environment: paddleStatus.environment,
        eventCallback: (event) => {
          if (event.data && event.name) {
            if (event.name === 'checkout.closed') {
              if (event.data.status === 'completed') {
                paddleCheckSubscriptionCheckout(event.data.customer.id).then(() => {
                  setDisabled(false);
                  unlock();
                });
              } else {
                setDisabled(false);
                unlock();
              }
            }
          }
        },
      }).then(async paddle => {
        if (paddle) {
          setPaddle(paddle);
          paddleCheckout(paddle);
        }
      });
    } else {
      paddleCheckout(paddle);
    }
  }, [paddleStatus, paddle, setPaddle, lock, unlock, user?.email, resolvedTheme, disabled, setDisabled]);

  if (paddleStatus.status === PADDLE_STATUS_MAP.active) {
    if (paddleStatus.scheduledChange?.action === 'pause' || paddleStatus.scheduledChange?.action === 'cancel') {
      return (
        <>
          <PaymentStatusCard status='orange'>
            <CardContent className='flex flex-col gap-1'>
              <div className='text-base font-medium text-orange-500'>
                <span className='text-sm text-muted-foreground'>Your subscription is </span>
                {paddleStatus.scheduledChange?.action === 'pause' ? 'paused' : 'cancelled'}
                <span className='text-sm text-muted-foreground'> and will stop </span>
                {' '}
                <PaymentStatusDate date={paddleStatus.scheduledChange?.effectiveAt ? paddleStatus.scheduledChange?.effectiveAt : paddleStatus.nextPaymentAt} />
                <span className='text-sm text-muted-foreground'>.</span>
              </div>
              <div className='text-sm text-muted-foreground'>
                We will notify you before your subscription ends.
              </div>
            </CardContent>
          </PaymentStatusCard>
        </>
      );
    }

    return (
      <>
        <PaymentStatusCard status='green'>
          <CardContent className='flex flex-col gap-1'>
            <div className='text-base font-medium text-green-600 dark:text-green-500'>
              <span className='text-sm text-muted-foreground'>Your next payment is</span>
              {' '}
              <PaymentStatusDate date={paddleStatus.nextPaymentAt} />
              <span className='text-sm text-muted-foreground'>.</span>
            </div>
            <div className='text-sm text-muted-foreground'>
              We will notify you before your subscription ends.
            </div>
          </CardContent>
          {!paddleStatus.scheduledChange?.action && (
            <CardFooter className='flex flex-col items-start gap-2'>
              <Button variant='destructive' size='lg' onClick={() => setShowCancelDialog(true)} disabled={disabled}>
                {disabled ? (
                  <Icons.spinner className='animate-spin' />
                ) : (
                  <Icons.x />
                )}
                Cancel Subscription
              </Button>
            </CardFooter>
          )}
        </PaymentStatusCard>

        <ResponsiveDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <ResponsiveDialogContent>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>Are you sure you want to cancel?</ResponsiveDialogTitle>
              <ResponsiveDialogDescription className='text-left text-foreground'>
                This action will cancel your subscription at the end of the current billing period. You will continue to have access until then.
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <ResponsiveDialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowCancelDialog(false)}
                title='Cancel'
                disabled={disabled}
              >
                Cancel
              </Button>
              <Button
                onClick={cancelSubscription}
                variant='destructive'
                title='Confirm Cancellation'
                disabled={disabled}
              >
                {disabled && (
                  <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                )}
                Confirm Cancellation
              </Button>
            </ResponsiveDialogFooter>
          </ResponsiveDialogContent>
        </ResponsiveDialog>
      </>
    );
  }

  if (paddleStatus.status === PADDLE_STATUS_MAP.paused) {
    return (
      <PaymentStatusCard status='red'>
        <CardContent className='flex flex-col gap-1'>
          <div className='text-sm font-medium text-red-500'>
            Your subscription is currently paused.
          </div>
        </CardContent>
        <CardFooter className='flex flex-col items-start gap-2'>
          <Button size='lg' onClick={resumeSubscription} disabled={disabled}>
            {disabled ? (
              <Icons.spinner className='animate-spin' />
            ) : (
              <Icons.arrowRight />
            )}
            Resume Subscription
          </Button>
        </CardFooter>
      </PaymentStatusCard>
    );
  }

  return (
    <PaymentStatusCard status='red'>
      <CardContent className='flex flex-col gap-1'>
        {paddleStatus.status === PADDLE_STATUS_MAP.cancelled && (
          <div className='text-sm font-medium text-red-500'>
            Your subscription has been cancelled.
          </div>
        )}
        {paddleStatus.status === PADDLE_STATUS_MAP.past_due && (
          <div className='text-sm font-medium text-red-500'>
            Your payment is past due. Please update your payment method.
          </div>
        )}
      </CardContent>
      <CardFooter className='flex flex-col items-start gap-2'>
        <Button size='lg' onClick={subscribeUser} disabled={disabled}>
          {disabled ? (
            <Icons.spinner className='animate-spin' />
          ) : (
            <Icons.sparkles />
          )}
          Reactivate Subscription
        </Button>
      </CardFooter>
    </PaymentStatusCard>
  );
};

const PaymentStatusFullAccess = () => {
  return (
    <PaymentStatusCard status='green'>
      <CardContent className='flex flex-col gap-1'>
          <p className='text-sm text-muted-foreground'>Congratulations! You have full access to all features.</p>
      </CardContent>
    </PaymentStatusCard>
  );
};

const PaymentStatusBlocked = () => {
  return (
    <PaymentStatusCard status='red'>
      <CardContent className='flex flex-col gap-1'>
        <p className='text-sm font-medium text-red-500'>Weird! You are blocked from using our service.</p>
      </CardContent>
    </PaymentStatusCard>
  );
};

const PaymentStatusWrapper = ({ user, paddleStatus }) => {
  // If Paddle is not configured, don't show anything
  if (!paddleStatus.enabled) {
    return null;
  }

  // If user has full access, show full access status
  if (paddleStatus.status === PADDLE_STATUS_MAP.full) {
    return (
      <PaymentStatusFullAccess />
    );
  }

  if (paddleStatus.status === PADDLE_STATUS_MAP.blocked) {
    return (
      <PaymentStatusBlocked />
    );
  }

  if (paddleStatus.status === PADDLE_STATUS_MAP.trialActive || paddleStatus.status === PADDLE_STATUS_MAP.trialExpired) {
    return (
      <PaymentStatusTrial user={user} paddleStatus={paddleStatus} />
    );
  }

  // Otherwise show subscription status
  return (
    <PaymentStatusSubscription user={user} paddleStatus={paddleStatus} />
  );


};

const ExportActions = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await UserExportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wapy-dev-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  }, [UserExportData, setLoading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Export</CardTitle>
        <CardDescription>
          Download a copy of your subscriptions, categories and settings
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Button
          onClick={handleExport}
          variant='outline'
          disabled={loading}
          className='w-full sm:w-auto'
          title='Export your data'
        >
          {loading ? (
            <Icons.spinner className='mr-2 size-4 animate-spin' />
          ) : (
            <Icons.download className='mr-2 size-4' />
          )}
          Export Data
        </Button>
      </CardContent>
    </Card>
  );
};

export const AccountSettings = ({ user, paddleStatus }) => {
  return (
    <div className='w-full max-w-4xl space-y-6 text-left'>
      <UserProfile user={user} />
      <PaymentStatusWrapper user={user} paddleStatus={paddleStatus} />
      <DefaultSettings user={user} />
      <NotificationManager user={user} />
      <CategoryManager user={user} />
      <ExportActions />
    </div>
  );
};