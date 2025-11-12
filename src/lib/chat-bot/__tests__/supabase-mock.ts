import { randomUUID } from 'crypto'

type TableName = 'products' | 'financial_transactions'

export interface SupabaseMockState {
  products: Array<Record<string, any>>
  financial_transactions: Array<Record<string, any>>
}

interface Filter {
  column: string
  value: any
}

function cloneState(state: SupabaseMockState): SupabaseMockState {
  return {
    products: state.products.map(row => ({ ...row })),
    financial_transactions: state.financial_transactions.map(row => ({ ...row }))
  }
}

class QueryBuilder {
  private table: TableName
  private state: SupabaseMockState
  private filters: Filter[] = []
  private operation: 'select' | 'update' | null = null
  private updateValues: Record<string, any> | null = null

  constructor(table: TableName, state: SupabaseMockState) {
    this.table = table
    this.state = state
  }

  select(_fields?: string) {
    this.operation = 'select'
    return this
  }

  update(values: Record<string, any>) {
    this.operation = 'update'
    this.updateValues = { ...values }
    return this
  }

  insert(row: Record<string, any> | Record<string, any>[]) {
    const rows = Array.isArray(row) ? row : [row]
    const inserted = rows.map((item) => {
      const record = {
        id: item.id || randomUUID(),
        created_at: item.created_at || new Date().toISOString(),
        ...item
      }
      this.state[this.table].push(record)
      return record
    })

    return {
      select: () => ({
        single: async () => ({
          data: inserted[0],
          error: null as any
        })
      })
    }
  }

  eq(column: string, value: any) {
    this.filters.push({ column, value })
    return this
  }

  async single() {
    const rows = this.applyFilters()
    if (rows.length === 0) {
      return { data: null, error: new Error('No rows found') }
    }
    return { data: rows[0], error: null as any }
  }

  private applyFilters() {
    const rows = this.state[this.table]
    if (this.filters.length === 0) return rows
    return rows.filter((row) =>
      this.filters.every((filter) => row[filter.column] === filter.value)
    )
  }

  private async execute() {
    if (this.operation === 'update') {
      const rows = this.applyFilters()
      if (rows.length === 0) {
        return { data: null, error: new Error('No rows found to update') }
      }
      rows.forEach((row) => {
        Object.assign(row, this.updateValues)
      })
      return { data: rows, error: null as any }
    }
    return { data: this.applyFilters(), error: null as any }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected)
  }
}

export class SupabaseMockClient {
  private _state: SupabaseMockState

  constructor(initialState?: Partial<SupabaseMockState>) {
    this._state = {
      products: [],
      financial_transactions: [],
      ...initialState
    }
  }

  setState(state: Partial<SupabaseMockState>) {
    this._state = {
      products: state.products ? state.products.map((row) => ({ ...row })) : [],
      financial_transactions: state.financial_transactions
        ? state.financial_transactions.map((row) => ({ ...row }))
        : []
    }
  }

  snapshot(): SupabaseMockState {
    return cloneState(this._state)
  }

  from(table: TableName) {
    return new QueryBuilder(table, this._state)
  }
}

export function createSupabaseMock(initialState?: Partial<SupabaseMockState>) {
  return new SupabaseMockClient(initialState)
}



