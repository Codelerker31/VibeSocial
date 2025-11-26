'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateProfileSchema, UpdateProfileInput } from '@/lib/validations';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { User } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, status } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
  });

  const profilePicture = watch('profilePicture');

  useEffect(() => {
    if (user) {
      setValue('displayName', user.name || '');
      setValue('profilePicture', user.image || '');
      // Fetch bio if needed, but user object from session might not have it.
      // Ideally we should fetch full user profile here.
    }
  }, [user, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setValue('profilePicture', data.url);
      }
    } catch (err) {
      console.error('Upload failed', err);
      setError('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: UpdateProfileInput) => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      setMessage('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Access Denied</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Profile</h3>
          <p className="mt-1 text-sm text-gray-500">
            This information will be displayed publicly so be careful what you share.
          </p>
          <div className="mt-4">
            <Link href="/settings/account" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
              Account Settings &rarr;
            </Link>
          </div>
        </div>
        <div className="mt-5 md:col-span-2 md:mt-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="shadow sm:overflow-hidden sm:rounded-md">
              <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                {message && (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">{message}</p>
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Photo</label>
                  <div className="mt-2 flex items-center">
                    <span className="inline-block h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                      {profilePicture ? (
                        <Image
                          src={profilePicture}
                          alt="Profile"
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-full w-full text-gray-300" />
                      )}
                    </span>
                    <label
                      htmlFor="file-upload"
                      className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                    >
                      {uploading ? 'Uploading...' : 'Change'}
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      autoComplete="name"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                      {...register('displayName')}
                    />
                    {errors.displayName && (
                      <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
                    )}
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="bio"
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        placeholder="Brief description for your profile."
                        {...register('bio')}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Brief description for your profile. URLs are hyperlinked.
                    </p>
                    {errors.bio && (
                      <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
