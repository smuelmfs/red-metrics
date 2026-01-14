'use client'

import { useState, useEffect } from 'react'
import { GripVertical, Eye, EyeOff, RotateCcw } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export type WidgetType = 
  | 'summary-cards'
  | 'department-cards'
  | 'performance-chart'
  | 'revenue-chart'
  | 'department-ranking'

export interface Widget {
  id: string
  type: WidgetType
  title: string
  visible: boolean
  order: number
  colSpan?: number
}

interface DraggableDashboardProps {
  widgets: Widget[]
  onWidgetsChange: (widgets: Widget[]) => void
  onSaveLayout?: (widgets: Widget[]) => Promise<void>
  renderWidget: (widget: Widget) => React.ReactNode
}

export default function DraggableDashboard({
  widgets: initialWidgets,
  onWidgetsChange,
  onSaveLayout,
  renderWidget
}: DraggableDashboardProps) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    setWidgets(initialWidgets)
  }, [initialWidgets])

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    if (!isEditMode) return
    setDraggedWidget(widgetId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditMode || !draggedWidget) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
    if (!isEditMode || !draggedWidget || draggedWidget === targetWidgetId) return
    e.preventDefault()

    const draggedIndex = widgets.findIndex(w => w.id === draggedWidget)
    const targetIndex = widgets.findIndex(w => w.id === targetWidgetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newWidgets = [...widgets]
    const [removed] = newWidgets.splice(draggedIndex, 1)
    newWidgets.splice(targetIndex, 0, removed)

    // Atualizar ordem
    const updatedWidgets = newWidgets.map((w, index) => ({
      ...w,
      order: index
    }))

    setWidgets(updatedWidgets)
    onWidgetsChange(updatedWidgets)
    setDraggedWidget(null)
  }

  const toggleWidgetVisibility = (widgetId: string) => {
    const updatedWidgets = widgets.map(w =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    )
    setWidgets(updatedWidgets)
    onWidgetsChange(updatedWidgets)
  }

  const handleSaveLayout = async () => {
    if (onSaveLayout) {
      try {
        await onSaveLayout(widgets)
        addToast('Layout salvo com sucesso!', 'success')
        setIsEditMode(false)
      } catch (error) {
        addToast('Erro ao salvar layout', 'error')
      }
    } else {
      setIsEditMode(false)
    }
  }

  const resetLayout = () => {
    setWidgets(initialWidgets)
    onWidgetsChange(initialWidgets)
    addToast('Layout resetado', 'info')
  }

  return (
    <div className="relative">
      {/* Controles de edição */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div className="flex items-center gap-2 flex-wrap">
          {isEditMode && (
            <>
              <button
                onClick={handleSaveLayout}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
              >
                Salvar Layout
              </button>
              <button
                onClick={resetLayout}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Resetar</span>
              </button>
            </>
          )}
        </div>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap w-full sm:w-auto"
        >
          {isEditMode ? 'Sair do Modo Edição' : 'Personalizar Layout'}
        </button>
      </div>

      {/* Lista de widgets para controle */}
      {isEditMode && (
        <div className="mb-4 bg-gray-50 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Widgets:</p>
          <div className="flex flex-wrap gap-2">
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border ${
                  widget.visible
                    ? 'bg-white border-gray-300'
                    : 'bg-gray-100 border-gray-200 opacity-60'
                }`}
              >
                <button
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className="text-gray-600 hover:text-gray-900 flex-shrink-0"
                >
                  {widget.visible ? (
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </button>
                <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[120px] sm:max-w-none">{widget.title}</span>
                <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {widgets
          .filter(w => w.visible)
          .sort((a, b) => a.order - b.order)
          .map((widget) => (
            <div
              key={widget.id}
              draggable={isEditMode}
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, widget.id)}
              className={`relative ${
                widget.colSpan === 2 ? 'md:col-span-2' : ''
              } ${
                widget.colSpan === 3 ? 'md:col-span-2 lg:col-span-3' : ''
              } ${
                isEditMode
                  ? 'cursor-move border-2 border-dashed border-gray-300 hover:border-red-500 rounded-lg p-2'
                  : ''
              }`}
            >
              {isEditMode && (
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 flex items-center gap-1 sm:gap-2">
                  <div className="bg-white rounded shadow-lg p-0.5 sm:p-1 flex items-center gap-0.5 sm:gap-1">
                    <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                    <button
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      className="text-gray-600 hover:text-gray-900 p-0.5"
                    >
                      {widget.visible ? (
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              <div className="h-full">
                {renderWidget(widget)}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

