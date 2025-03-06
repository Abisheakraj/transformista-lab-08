
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

  return { toast };
}
