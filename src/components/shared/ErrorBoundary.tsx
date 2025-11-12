'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-900">Algo deu errado</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              Ocorreu um erro ao carregar este componente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {this.state.error && (
                <div className="text-sm text-red-800 bg-red-100 p-3 rounded">
                  <p className="font-semibold">Erro:</p>
                  <p className="font-mono">{this.state.error.message}</p>
                </div>
              )}
              <Button onClick={this.handleReset} variant="outline">
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
