'use client'

import { useState, useCallback } from 'react'
import Modal from '@/components/ui/modal'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'danger'
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({
    title: 'Confirmar',
    message: 'Tem certeza?',
  })
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts)
      setIsOpen(true)
      setResolvePromise(() => resolve)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true)
      setResolvePromise(null)
    }
    setIsOpen(false)
  }, [resolvePromise])

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false)
      setResolvePromise(null)
    }
    setIsOpen(false)
  }, [resolvePromise])

  const ConfirmDialog = () => (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={options.title}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      type={options.type}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    >
      <p>{options.message}</p>
    </Modal>
  )

  return { confirm, ConfirmDialog }
}

