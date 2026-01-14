import { useState, useEffect, useRef } from 'react'
import { Widget } from '@/components/dashboard/DraggableDashboard'

const STORAGE_KEY = 'red-metrics-dashboard-layout'

export function useDashboardLayout(defaultWidgets: Widget[]) {
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets)
  const [isLoading, setIsLoading] = useState(true)
  const defaultWidgetsRef = useRef(defaultWidgets)

  // Atualizar a referência quando defaultWidgets mudar
  useEffect(() => {
    defaultWidgetsRef.current = defaultWidgets
  }, [defaultWidgets])

  useEffect(() => {
    // Carregar do localStorage e mesclar com widgets padrão
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const currentDefaults = defaultWidgetsRef.current
      
      if (saved) {
        const parsed = JSON.parse(saved) as Widget[]
        
        // Criar um mapa dos widgets salvos por ID
        const savedMap = new Map(parsed.map(w => [w.id, w]))
        
        // Mesclar: manter widgets salvos e adicionar novos widgets padrão que não existem
        const merged: Widget[] = []
        
        // Primeiro, adicionar todos os widgets padrão (mantendo configurações salvas se existirem)
        currentDefaults.forEach(defaultWidget => {
          const saved = savedMap.get(defaultWidget.id)
          if (saved) {
            // Manter configurações salvas (visible, order) mas atualizar type e title caso mudou
            merged.push({
              ...saved,
              type: defaultWidget.type, // Garantir que o type está atualizado
              title: defaultWidget.title // Garantir que o title está atualizado
            })
          } else {
            // Widget novo que não estava salvo - adicionar com valores padrão
            merged.push(defaultWidget)
          }
        })
        
        setWidgets(merged)
      } else {
        setWidgets(currentDefaults)
      }
    } catch (error) {
      console.error('Error loading dashboard layout:', error)
      setWidgets(defaultWidgetsRef.current)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveLayout = async (newWidgets: Widget[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWidgets))
      setWidgets(newWidgets)
      return Promise.resolve()
    } catch (error) {
      console.error('Error saving dashboard layout:', error)
      return Promise.reject(error)
    }
  }

  const resetLayout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setWidgets(defaultWidgets)
  }

  return {
    widgets,
    setWidgets,
    saveLayout,
    resetLayout,
    isLoading
  }
}

