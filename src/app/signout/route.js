import { signOut } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function GET()
{
    await signOut({ redirectTo: '/' }).then(() => {
      revalidatePath('/');
    });
}