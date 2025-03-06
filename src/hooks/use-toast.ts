
type ToastType = 'default' | 'destructive' | 'success';

interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    console.log('Toast:', options);
  };

  return { 
    toast,
    toasts: [] // Add empty toasts array to match expected interface
  };
}

// Export a standalone toast function for direct imports
export const toast = (options: ToastOptions) => {
  console.log('Toast:', options);
};
