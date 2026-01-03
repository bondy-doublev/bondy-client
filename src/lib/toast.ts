import { extractErrorMessage } from "@/utils/format";
import { toast } from "react-toastify";

class ToastService {
  success(message: string) {
    toast.success(message);
  }

  info(message: string) {
    toast(message);
  }

  warning(message: string) {
    toast.warning(message);
  }

  loading(message: string) {
    return toast.loading(message);
  }

  dismiss(toastId?: string | number) {
    toast.dismiss(toastId);
  }

  error(error: any) {
    const message = extractErrorMessage(error);
    toast.error(message);
  }
}

export const Toast = new ToastService();
