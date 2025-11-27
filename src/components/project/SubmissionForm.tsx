'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProjectSubmissionSchema, ProjectSubmissionInput } from '@/lib/validations';
import { ImageUpload } from '@/components/ImageUpload';
import { useRouter } from 'next/navigation';
import { GroupedTags } from '@/lib/tags';
import { validateGitHubUrl, fetchRepoInfo } from '@/lib/github';
import { ChevronRight, ChevronLeft, Save, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface SubmissionFormProps {
  groupedTags: GroupedTags;
}

const STEPS = [
  { id: 1, title: 'Basic Info' },
  { id: 2, title: 'Details' },
  { id: 3, title: 'Media' },
  { id: 4, title: 'Tech Stack' },
];

export function SubmissionForm({ groupedTags }: SubmissionFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repoChecking, setRepoChecking] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [tagSearch, setTagSearch] = useState('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
    getValues,
  } = useForm<ProjectSubmissionInput>({
    resolver: zodResolver(ProjectSubmissionSchema),
    mode: 'onChange',
    defaultValues: {
      projectType: 'WEB_APP',
      tagIds: [],
      screenshots: [],
    },
  });

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('project_submission_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // Restore values (careful with files, they can't be restored easily from JSON)
        // We skip files restoration for MVP simplicity or handle URLs if we had them
        Object.keys(parsed).forEach((key) => {
          if (key !== 'coverImage' && key !== 'screenshots') {
            setValue(key as keyof ProjectSubmissionInput, parsed[key]);
          }
        });
      } catch (e) {
        console.error('Failed to load draft', e);
      }
    }
  }, [setValue]);

  // Autosave draft
  useEffect(() => {
    const interval = setInterval(() => {
      const values = getValues();
      // Exclude files
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { coverImage, screenshots, ...rest } = values;
      // Only save if there's something to save (e.g. title is not empty)
      if (rest.title || rest.description) {
        localStorage.setItem('project_submission_draft', JSON.stringify(rest));
        toast.success('Draft saved automatically');
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [getValues]);

  // Manual save draft
  const saveDraft = () => {
    const values = getValues();
    // Exclude files
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { coverImage, screenshots, ...rest } = values;
    localStorage.setItem('project_submission_draft', JSON.stringify(rest));
    toast.success('Draft saved to local storage!');
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof ProjectSubmissionInput)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['title', 'description', 'projectType'];
    } else if (step === 2) {
      fieldsToValidate = ['detailedDescription', 'sourceUrl', 'demoUrl'];
    } else if (step === 3) {
      // coverImage is required, but it's a string URL in schema.
      // In the form, we might hold a File object in a separate state or use the controller to hold the File.
      // But Zod schema expects string (URL).
      // We need to handle this mismatch. The form should probably hold the File object, 
      // and we validate it manually or use a separate schema for the form vs the API.
      // For now, let's assume we validate that coverImage is present (not null).
      // The Zod schema says string.url().
      // We'll handle the file upload in onSubmit.
      // For validation here, we check if the field has a value (File or string).
      const coverImage = getValues('coverImage');
      if (!coverImage) {
        // Trigger validation to show error
        await trigger('coverImage');
        return;
      }
      fieldsToValidate = ['coverImage'];
    } else if (step === 4) {
      fieldsToValidate = ['tagIds'];
    }

    const valid = await trigger(fieldsToValidate);
    if (valid) {
      setStep((s) => Math.min(s + 1, 4));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: ProjectSubmissionInput) => {
    setIsSubmitting(true);
    try {
      // 1. Upload images
      // We need to handle the File objects. 
      // The data.coverImage might be a File object if we used Controller with ImageUpload.
      // But TypeScript thinks it's a string because of the schema.
      // We need to cast or handle it.
      
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('detailedDescription', data.detailedDescription);
      formData.append('projectType', data.projectType);
      formData.append('sourceUrl', data.sourceUrl);
      if (data.demoUrl) formData.append('demoUrl', data.demoUrl);
      
      data.tagIds.forEach(id => formData.append('tagIds', id));

      // Handle Cover Image
      // We need to access the actual File object. 
      // Since we are using react-hook-form, we can store the File in the form state 
      // even if the schema expects a string (we'll fix the schema or cast).
      // Actually, for the API submission, we send FormData.
      // The Zod schema is for the API body validation (JSON) usually, but here we are sending FormData.
      // The API route will need to parse FormData.
      
      const coverImageFile = getValues('coverImage');
      if ((coverImageFile as unknown) instanceof File) {
        formData.append('coverImage', coverImageFile as unknown as File);
      }

      // Handle Screenshots
      const screenshots = getValues('screenshots');
      if (Array.isArray(screenshots)) {
        screenshots.forEach((file: unknown) => {
          if (file instanceof File) {
            formData.append('screenshots', file);
          }
        });
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Submission failed');
      }

      // Clear draft
      localStorage.removeItem('project_submission_draft');
      router.push('/submit/success');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // GitHub URL handler
  const handleGithubUrlBlur = async () => {
    const url = getValues('sourceUrl');
    if (!url || !validateGitHubUrl(url)) return;

    setRepoChecking(true);
    setRepoError(null);
    try {
      const info = await fetchRepoInfo(url);
      if (!info) {
        setRepoError('Repository not found or private');
      } else {
        // Auto-fill description if empty
        if (!getValues('description') && info.description) {
          setValue('description', info.description.slice(0, 150));
        }
        // Suggest tags based on language (simple matching)
        if (info.language) {
          // Find tag with matching name
          const allTags = Object.values(groupedTags).flat();
          const matchingTag = allTags.find(t => t.name.toLowerCase() === info.language.toLowerCase());
          if (matchingTag) {
            const currentTags = getValues('tagIds');
            if (!currentTags.includes(matchingTag.id)) {
              setValue('tagIds', [...currentTags, matchingTag.id]);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRepoChecking(false);
    }
  };

  // Flatten tags for search
  const allTags = Object.values(groupedTags).flat();
  const filteredTags = allTags.filter(tag => 
    tag.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const selectedTagIds = watch('tagIds');
  const selectedTags = allTags.filter(tag => selectedTagIds.includes(tag.id));

  const toggleTag = (tagId: string) => {
    const current = getValues('tagIds');
    if (current.includes(tagId)) {
      setValue('tagIds', current.filter(id => id !== tagId));
    } else {
      if (current.length >= 8) return; // Max 8
      setValue('tagIds', [...current, tagId]);
    }
    trigger('tagIds');
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Step {step} of 4</span>
          <span className="text-sm font-medium text-gray-900">{STEPS[step - 1]?.title}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
              <input
                {...register('title')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. DevSocial"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">One-line Description *</label>
              <input
                {...register('description')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="A discovery platform for developer projects"
              />
              <p className="text-xs text-gray-500 text-right">{watch('description')?.length || 0}/150</p>
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Type *</label>
              <select
                {...register('projectType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="WEB_APP">Web App</option>
                <option value="MOBILE_APP">Mobile App</option>
                <option value="CLI_TOOL">CLI Tool</option>
                <option value="LIBRARY">Library/Package</option>
                <option value="GAME">Game</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.projectType && <p className="text-red-500 text-xs mt-1">{errors.projectType.message}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source Code URL *</label>
              <div className="relative">
                <input
                  {...register('sourceUrl')}
                  onBlur={handleGithubUrlBlur}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.sourceUrl ? 'border-red-300' : watch('sourceUrl') && !repoError ? 'border-green-300' : 'border-gray-300'
                  }`}
                  placeholder="https://github.com/username/repo"
                />
                <div className="absolute right-3 top-2.5 flex items-center gap-2">
                  {repoChecking && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                  {!repoChecking && !errors.sourceUrl && watch('sourceUrl') && !repoError && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {!repoChecking && (errors.sourceUrl || repoError) && (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              {errors.sourceUrl && <p className="text-red-500 text-xs mt-1">{errors.sourceUrl.message}</p>}
              {repoError && <p className="text-red-500 text-xs mt-1">{repoError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Demo URL</label>
              <div className="relative">
                <input
                  {...register('demoUrl')}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.demoUrl ? 'border-red-300' : watch('demoUrl') ? 'border-green-300' : 'border-gray-300'
                  }`}
                  placeholder="https://myproject.com"
                />
                <div className="absolute right-3 top-2.5">
                  {!errors.demoUrl && watch('demoUrl') && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {errors.demoUrl && (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              {errors.demoUrl && <p className="text-red-500 text-xs mt-1">{errors.demoUrl.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description (Markdown) *</label>
              <textarea
                {...register('detailedDescription')}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="# Features&#10;- Feature 1&#10;- Feature 2"
              />
              <p className="text-xs text-gray-500 text-right">{watch('detailedDescription')?.length || 0}/5000</p>
              {errors.detailedDescription && <p className="text-red-500 text-xs mt-1">{errors.detailedDescription.message}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Media */}
        {step === 3 && (
          <div className="space-y-6">
            <Controller
              control={control}
              name="coverImage"
              render={({ field: { onChange, value } }) => (
                <ImageUpload
                  label="Cover Image *"
                  onChange={(file) => onChange(file)}
                  value={value as File | string | null}
                />
              )}
            />
            {errors.coverImage && <p className="text-red-500 text-xs mt-1">{errors.coverImage.message}</p>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Screenshots (Optional, max 4)</label>
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((index) => (
                  <Controller
                    key={index}
                    control={control}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    name={`screenshots.${index}` as any}
                    render={({ field: { onChange, value } }) => (
                      <ImageUpload
                        label={`Screenshot ${index + 1}`}
                        onChange={(file) => onChange(file)}
                        value={value as File | string | null}
                        className="h-32"
                      />
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Tech Stack */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Tags (2-8) *</label>
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-2"
                placeholder="Search tags..."
              />
              
              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTags.map(tag => (
                  <span key={tag.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Tag List */}
              <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto p-2">
                {filteredTags.length === 0 && <p className="text-sm text-gray-500 p-2">No tags found.</p>}
                {filteredTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`
                      inline-block px-3 py-1 m-1 text-sm rounded-full border transition-colors
                      ${selectedTagIds.includes(tag.id) 
                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}
                    `}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              {errors.tagIds && <p className="text-red-500 text-xs mt-1">{errors.tagIds.message}</p>}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveDraft}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </button>
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            )}
          </div>

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Project
                  <Check className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
