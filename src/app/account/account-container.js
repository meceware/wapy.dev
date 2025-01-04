'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DefaultCategories } from '@/config/categories';
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
  UserGetCategories,
  UserLoadDefaultCategories,
  UserRemoveCategory,
  UserSaveCategory,
  UserUpdateTimezone,
  UserUpdateCurrency,
  UserUpdateNotifications,
  UserUpdateName,
} from './actions';
import { SchemaCategory, SchemaUserNotifications } from './schema';
import { CurrencyFieldManager } from '@/components/subscriptions/form/field-currency';
import { TimezoneFieldManager } from '@/components/subscriptions/form/field-timezone';
import { NotificationsFieldManager } from '@/components/subscriptions/form/field-notifications';

const TimezoneManager = ({ user }) => {
  const [selectedTimezone, setSelectedTimezone] = useState(user?.timezone);
  const [loading, setLoading] = useState(false);

  const handleTimezoneChange = async (value) => {
    try {
      setLoading(true);
      setSelectedTimezone(value);
      await UserUpdateTimezone(value);
      toast.success('Timezone updated successfully');
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
      await UserUpdateCurrency(currency);
      toast.success('Currency updated successfully');
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
      await UserUpdateNotifications(notifications);
      toast.success('Notification preferences saved');
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
      await UserUpdateName(name);
      setIsEditing(false);
      toast.success('Your name has been updated successfully.');
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
            <AvatarFallback className='bg-primary/10 text-xl'>{name?.[0]}</AvatarFallback>
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

const CategoryManager = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        await UserGetCategories().then((categories) => {
          setCategories(categories);
          setLoading(false);
        });
      } catch (error) {
        toast.error('Failed to load categories!');
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

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

export const AccountSettings = ({ user }) => {
  return (
    <div className='w-full max-w-4xl space-y-6 text-left'>
      <UserProfile user={user} />
      <DefaultSettings user={user} />
      <NotificationManager user={user} />
      <CategoryManager />
    </div>
  );
};