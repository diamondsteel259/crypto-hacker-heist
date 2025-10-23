import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionConfirmationModalProps {
  open: boolean;
  status: "confirming" | "success" | "error" | "idle";
  message?: string;
  onClose?: () => void;
}

export function TransactionConfirmationModal({
  open,
  status,
  message,
  onClose,
}: TransactionConfirmationModalProps) {
  const getIcon = () => {
    switch (status) {
      case "confirming":
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case "error":
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Clock className="w-16 h-16 text-gray-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case "confirming":
        return "Confirming Transaction...";
      case "success":
        return "Transaction Confirmed!";
      case "error":
        return "Transaction Failed";
      default:
        return "Processing";
    }
  };

  const getDescription = () => {
    if (message) return message;

    switch (status) {
      case "confirming":
        return "Please wait 2-5 minutes while we confirm your payment on the TON blockchain. Do not close this window.";
      case "success":
        return "Your payment has been confirmed and your purchase is complete!";
      case "error":
        return "Unable to confirm your transaction. If you were charged, please contact support.";
      default:
        return "Processing your request...";
    }
  };

  return (
    <Dialog open={open} onOpenChange={status === "confirming" ? undefined : onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{getTitle()}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          {getIcon()}

          <DialogDescription className="text-center text-sm px-4">
            {getDescription()}
          </DialogDescription>

          {status === "confirming" && (
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>⏱️ This may take 2-5 minutes</p>
              <p>🔄 Checking blockchain every 5 seconds</p>
              <p>⚠️ Please keep this window open</p>
            </div>
          )}

          {(status === "success" || status === "error") && onClose && (
            <Button onClick={onClose} className="mt-4">
              {status === "success" ? "Continue" : "Close"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
