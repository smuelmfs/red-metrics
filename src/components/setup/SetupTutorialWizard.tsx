'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Settings, 
  Building2, 
  Clock, 
  Target, 
  DollarSign, 
  FileText,
  Loader2,
  Sparkles
} from 'lucide-react'
import Spinner from '@/components/ui/Spinner'
import Link from 'next/link'

interface Step {
  id: string
  title: string
  description: string
  icon: any
  component: React.ComponentType<StepComponentProps>
}

interface StepComponentProps {
  onNext: () => void
  onBack: () => void
  onSkip?: () => void
  data: any
  setData: (data: any) => void
}

export default function SetupTutorialWizard() {
  const router = useRouter()
  const { addToast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<any>({})

  const steps: Step[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao Setup Completo',
      description: 'Vamos configurar o sistema passo a passo',
      icon: Sparkles,
      component: WelcomeStep
    },
    {
      id: 'settings',
      title: 'Passo 1: Configurações Globais',
      description: 'Defina as configurações essenciais do sistema',
      icon: Settings,
      component: SettingsStep
    },
    {
      id: 'department',
      title: 'Passo 2: Criar Primeiro Departamento',
      description: 'Crie o primeiro departamento da empresa',
      icon: Building2,
      component: DepartmentStep
    },
    {
      id: 'planned-hours',
      title: 'Passo 3: Configurar Horas Planejadas',
      description: 'Configure as horas planejadas para o departamento',
      icon: Clock,
      component: PlannedHoursStep
    },
    {
      id: 'objective',
      title: 'Passo 4: Definir Objetivo Mínimo',
      description: 'Defina o objetivo mínimo mensal para o departamento',
      icon: Target,
      component: ObjectiveStep
    },
    {
      id: 'fixed-costs',
      title: 'Passo 5: Adicionar Custos Fixos (Opcional)',
      description: 'Configure os custos fixos mensais da empresa',
      icon: DollarSign,
      component: FixedCostsStep
    },
    {
      id: 'retainers',
      title: 'Passo 6: Criar Retainers (Opcional)',
      description: 'Configure os retainers (avenças) ativos',
      icon: FileText,
      component: RetainersStep
    },
    {
      id: 'complete',
      title: 'Configuração Completa!',
      description: 'Tudo está pronto para começar',
      icon: CheckCircle2,
      component: CompleteStep
    }
  ]

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const currentStepData = steps[currentStep]
  const StepComponent = currentStepData.component
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="w-full max-w-4xl mx-auto p-4 lg:p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <currentStepData.icon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {currentStepData.title}
              </h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Passo {currentStep + 1} de {steps.length}</span>
              <span>{Math.round(progress)}% completo</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8 min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : (
            <StepComponent
              onNext={handleNext}
              onBack={handleBack}
              onSkip={handleSkip}
              data={formData}
              setData={setFormData}
            />
          )}
        </div>

        {/* Navigation */}
        {currentStepData.id !== 'welcome' && currentStepData.id !== 'complete' && (
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="flex gap-2">
              {currentStepData.id === 'fixed-costs' || currentStepData.id === 'retainers' ? (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Pular este passo
                </button>
              ) : null}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Welcome Step
function WelcomeStep({ onNext }: StepComponentProps) {
  return (
    <div className="text-center py-8">
      <Sparkles className="w-16 h-16 text-red-600 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Vamos configurar o sistema do zero!
      </h2>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Este assistente vai guiá-lo passo a passo na criação de todos os elementos necessários
        para o sistema funcionar corretamente. Vamos começar?
      </p>
      <button
        onClick={onNext}
        className="px-8 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium flex items-center gap-2 mx-auto"
      >
        Começar Configuração
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  )
}

// Settings Step
function SettingsStep({ onNext, data, setData }: StepComponentProps) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState([
    { key: 'targetMargin', label: 'Margem Alvo', value: '0.30', description: 'Margem alvo (ex.: 0,30 = 30%)' },
    { key: 'hoursPerMonth', label: 'Horas de Trabalho por Mês', value: '160', description: 'Horas de trabalho por mês' },
    { key: 'targetUtilization', label: 'Utilização Faturável Média', value: '0.65', description: 'Utilização faturável média (ex.: 0,65 = 65%)' },
    { key: 'costPerPersonPerMonth', label: 'Custo Médio por Pessoa/Mês (€)', value: '2200', description: 'Custo médio por pessoa / mês (empresa)' },
    { key: 'overheadPeople', label: 'Nº Pessoas NÃO Faturáveis (Overhead)', value: '6', description: 'Nº pessoas NÃO faturáveis (overhead)' }
  ])

  useEffect(() => {
    loadExistingSettings()
  }, [])

  const loadExistingSettings = async () => {
    try {
      const response = await fetch('/api/global-settings')
      if (response.ok) {
        const existing = await response.json()
        setSettings(prev => prev.map(s => {
          const found = existing.find((e: any) => e.key === s.key)
          return found ? { ...s, value: found.value } : s
        }))
      }
    } catch (error) {
      // Ignore errors, use defaults
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/global-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: settings.map(s => ({
            key: s.key,
            value: s.value,
            description: s.description
          }))
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao salvar configurações')
      }

      addToast('Configurações salvas com sucesso!', 'success')
      onNext()
    } catch (error: any) {
      addToast(error.message || 'Erro ao salvar configurações', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>💡 Dica:</strong> Estas configurações são usadas em todos os cálculos do sistema.
          Você pode alterá-las depois em Configurações.
        </p>
      </div>

      {settings.map((setting) => (
        <div key={setting.key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {setting.label} *
          </label>
          {setting.description && (
            <p className="text-xs text-gray-500 mb-2">{setting.description}</p>
          )}
          <input
            type={setting.key === 'overheadPeople' || setting.key === 'hoursPerMonth' ? 'number' : 'text'}
            step={setting.key === 'targetMargin' || setting.key === 'targetUtilization' ? '0.01' : '1'}
            value={setting.value}
            onChange={(e) => {
              setSettings(prev => prev.map(s => s.key === setting.key ? { ...s, value: e.target.value } : s))
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
      ))}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              Salvar e Continuar
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// Department Step
function DepartmentStep({ onNext, data, setData }: StepComponentProps) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: data.departmentName || '',
    code: data.departmentCode || '',
    billableHeadcount: data.billableHeadcount || 4,
    costPerPersonPerMonth: data.costPerPersonPerMonth || 2200,
    targetUtilization: data.targetUtilization || 0.65,
    averageHourlyRate: data.averageHourlyRate || 45
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao criar departamento')
      }

      const created = await response.json()
      setData({ ...data, departmentId: created.id, departmentName: formData.name })
      addToast('Departamento criado com sucesso!', 'success')
      onNext()
    } catch (error: any) {
      addToast(error.message || 'Erro ao criar departamento', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>💡 Dica:</strong> Você pode criar mais departamentos depois na página de Departamentos.
          Por enquanto, vamos criar o primeiro.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Departamento *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex: Branding & Design"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Código (opcional)
        </label>
        <input
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex: DESIGN"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HC Faturável *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.billableHeadcount}
            onChange={(e) => setFormData({ ...formData, billableHeadcount: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Taxa Média (€/h) *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.averageHourlyRate}
            onChange={(e) => setFormData({ ...formData, averageHourlyRate: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custo por Pessoa/Mês (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.costPerPersonPerMonth}
            onChange={(e) => setFormData({ ...formData, costPerPersonPerMonth: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Utilização Alvo
          </label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={formData.targetUtilization}
            onChange={(e) => setFormData({ ...formData, targetUtilization: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              Criar e Continuar
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// Planned Hours Step
function PlannedHoursStep({ onNext, data, setData }: StepComponentProps) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const currentDate = new Date()
  const [formData, setFormData] = useState({
    month: data.month || currentDate.getMonth() + 1,
    year: data.year || currentDate.getFullYear(),
    billableHeadcount: data.billableHeadcount || 4,
    targetHoursPerMonth: data.targetHoursPerMonth || 160,
    targetUtilization: data.targetUtilization || 0.65,
    actualBillableHours: data.actualBillableHours || null
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!data.departmentId) {
      addToast('Erro: Departamento não encontrado', 'error')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/planned-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: data.departmentId,
          month: formData.month,
          year: formData.year,
          billableHeadcount: formData.billableHeadcount,
          targetHoursPerMonth: formData.targetHoursPerMonth,
          targetUtilization: formData.targetUtilization,
          actualBillableHours: formData.actualBillableHours
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar horas planejadas')
      }

      addToast('Horas planejadas configuradas com sucesso!', 'success')
      onNext()
    } catch (error: any) {
      addToast(error.message || 'Erro ao configurar horas', 'error')
    } finally {
      setLoading(false)
    }
  }

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>💡 Dica:</strong> Configure as horas planejadas para o mês atual.
          Você pode adicionar mais meses depois na página de Horas Planejadas.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mês *
          </label>
          <select
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          >
            {months.map((month, index) => (
              <option key={index + 1} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ano *
          </label>
          <input
            type="number"
            min="2020"
            max="2100"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HC Faturável no Mês
          </label>
          <input
            type="number"
            min="1"
            value={formData.billableHeadcount}
            onChange={(e) => setFormData({ ...formData, billableHeadcount: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Horas/Mês Padrão
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.targetHoursPerMonth}
            onChange={(e) => setFormData({ ...formData, targetHoursPerMonth: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Horas Reais (opcional)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={formData.actualBillableHours || ''}
          onChange={(e) => setFormData({ ...formData, actualBillableHours: e.target.value ? parseFloat(e.target.value) : null })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Deixe vazio se não souber"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              Salvar e Continuar
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// Objective Step
function ObjectiveStep({ onNext, data, setData }: StepComponentProps) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const currentDate = new Date()
  const [formData, setFormData] = useState({
    month: data.month || currentDate.getMonth() + 1,
    year: data.year || currentDate.getFullYear(),
    targetValue: data.targetValue || 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!data.departmentId) {
      addToast('Erro: Departamento não encontrado', 'error')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: data.departmentId,
          month: formData.month,
          year: formData.year,
          targetValue: formData.targetValue
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar objetivo')
      }

      addToast('Objetivo criado com sucesso!', 'success')
      onNext()
    } catch (error: any) {
      addToast(error.message || 'Erro ao criar objetivo', 'error')
    } finally {
      setLoading(false)
    }
  }

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>💡 Dica:</strong> O objetivo mínimo é usado para calcular a performance do departamento.
          Você pode definir objetivos diferentes para cada mês.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mês *
          </label>
          <select
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          >
            {months.map((month, index) => (
              <option key={index + 1} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ano *
          </label>
          <input
            type="number"
            min="2020"
            max="2100"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Objetivo Mínimo (€) *
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          required
          value={formData.targetValue}
          onChange={(e) => setFormData({ ...formData, targetValue: parseFloat(e.target.value) || 0 })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex: 50000"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              Salvar e Continuar
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// Fixed Costs Step
function FixedCostsStep({ onNext, onSkip }: StepComponentProps) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>ℹ️ Opcional:</strong> Você pode pular este passo e configurar custos fixos depois.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">
          Para adicionar custos fixos, vá para a página de <strong>Custos Fixos</strong> no menu.
        </p>
        <Link
          href="/dashboard/fixed-costs"
          className="inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Ir para Custos Fixos
        </Link>
      </div>
    </div>
  )
}

// Retainers Step
function RetainersStep({ onNext, onSkip }: StepComponentProps) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>ℹ️ Opcional:</strong> Você pode pular este passo e configurar retainers depois.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">
          Para criar retainers (avenças), vá para a página de <strong>Retainers</strong> no menu.
        </p>
        <Link
          href="/dashboard/retainers"
          className="inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Ir para Retainers
        </Link>
      </div>
    </div>
  )
}

// Complete Step
function CompleteStep({}: StepComponentProps) {
  const router = useRouter()

  return (
    <div className="text-center py-8">
      <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Configuração Completa! 🎉
      </h2>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Parabéns! Você configurou o sistema com sucesso. Agora você pode:
      </p>
      <ul className="text-left max-w-md mx-auto mb-8 space-y-2 text-gray-600">
        <li className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Ver o dashboard com os dados configurados
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Adicionar mais departamentos
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Configurar mais meses e objetivos
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Adicionar custos fixos e retainers
        </li>
      </ul>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
        >
          Ir para o Dashboard
        </button>
        <button
          onClick={() => router.push('/dashboard/departments')}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
        >
          Ver Departamentos
        </button>
      </div>
    </div>
  )
}

