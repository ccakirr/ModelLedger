import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Sil',
  cancelLabel = 'İptal',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    // Cleanup'ta close() çağrılmaz: StrictMode'da asenkron "close" olayı onClose'u
    // tetikleyip modalı hemen kapatırdı. Unmount'ta öğe DOM'dan kalkınca modal zaten kapanır.
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      // Escape tuşu "cancel" olayını tetikler; kapanışı state yönetsin
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      // Tarayıcı Escape'i yine de kapatırsa (ör. art arda Escape) state'i eşitle
      onClose={onCancel}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-lg border border-slate-700 bg-slate-800 p-5 text-slate-100 shadow-xl backdrop:bg-black/60 sm:p-6"
    >
      <h2 id="confirm-dialog-title" className="text-lg font-semibold text-slate-100">
        {title}
      </h2>
      <p id="confirm-dialog-message" className="mt-2 text-sm text-slate-300">
        {message}
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}

export default ConfirmDialog
