import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      closeButton
      expand
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast: "rounded-xl border",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
