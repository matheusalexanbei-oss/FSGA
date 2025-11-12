/**
 * Variações de contexto para o BOT AI
 * Este arquivo contém todas as variações possíveis de comandos que o usuário pode usar
 * para expressar as mesmas intenções, permitindo que o BOT reconheça diferentes formas
 * de falar sobre vendas, compras, despesas e agendamentos.
 */

/**
 * Variações para VENDAS (com pagamento futuro)
 */
export const SELL_VARIATIONS = {
  // Variações básicas de venda
  basic: [
    'vendi',
    'vender',
    'venda',
    'vendido',
    'vendemos',
    'vendeu',
    'realizei uma venda',
    'foi vendido',
    'consegui vender',
    'fiz uma venda',
  ],

  // Variações com produto
  withProduct: [
    'vendi um produto',
    'vendi uma produto',
    'vendi o produto',
    'vendi a produto',
    'vendi produto',
    'vendi produtos',
    'vendi um item',
    'vendi um item',
    'vendi o item',
    'vendi a item',
  ],

  // Variações com pagamento futuro - SERÁ PAGO
  futurePayment: [
    'será pago',
    'sera pago',
    'ser pago',
    'será pago em',
    'sera pago em',
    'ser pago em',
    'vai ser pago',
    'vai ser pago em',
    'pago será',
    'pago sera',
    'pago em',
    'pago no',
    'pago na',
    'receberei',
    'receberá',
    'recebera',
    'receber',
    'vou receber',
    'vai receber',
    'vou receber em',
    'vai receber em',
    'receber em',
    'receber no',
    'receber na',
    'para receber',
    'pra receber',
    'a receber',
    'a receber em',
  ],

  // Variações temporais - MÊS QUE VEM
  nextMonth: [
    'mês que vem',
    'mes que vem',
    'próximo mês',
    'proximo mes',
    'próximo mes',
    'proximo mes',
    'no próximo mês',
    'no proximo mes',
    'no mês que vem',
    'no mes que vem',
    'mês que vem',
    'mes que vem',
    'no mês seguinte',
    'no mes seguinte',
    'mês seguinte',
    'mes seguinte',
    'próximo período',
    'proximo periodo',
  ],

  // Variações temporais - SEMANA QUE VEM
  nextWeek: [
    'semana que vem',
    'próxima semana',
    'proxima semana',
    'na próxima semana',
    'na proxima semana',
    'semana seguinte',
    'próxima semana',
    'proxima semana',
  ],

  // Variações temporais - AMANHÃ
  tomorrow: [
    'amanhã',
    'amanha',
    'no dia seguinte',
    'amanhã',
    'amanha',
  ],

  // Variações temporais - DIA ESPECÍFICO
  specificDay: [
    'dia X',
    'dia X/mês',
    'dia X/mês/ano',
    'no dia X',
    'no dia X/mês',
    'no dia X/mês/ano',
  ],

  // Combinações completas
  fullCombinations: [
    'vendi um produto que será pago mês que vem',
    'vendi um produto que sera pago mes que vem',
    'vendi um produto que será pago no próximo mês',
    'vendi um produto que sera pago no proximo mes',
    'vendi um produto que será pago próximo mês',
    'vendi um produto que sera pago proximo mes',
    'vendi um produto que receberei mês que vem',
    'vendi um produto que receberei mes que vem',
    'vendi um produto que receberei no próximo mês',
    'vendi um produto que receberei no proximo mes',
    'vendi um produto pra mês que vem',
    'vendi um produto pra mes que vem',
    'vendi um produto para mês que vem',
    'vendi um produto para mes que vem',
    'vendi um produto pra receber mês que vem',
    'vendi um produto pra receber mes que vem',
    'vendi um produto para receber mês que vem',
    'vendi um produto para receber mes que vem',
    'vendi produto que será pago mês que vem',
    'vendi produto que sera pago mes que vem',
    'vendi produto que receberei mês que vem',
    'vendi produto que receberei mes que vem',
    'vendi produto pra mês que vem',
    'vendi produto pra mes que vem',
    'vendi produto para mês que vem',
    'vendi produto para mes que vem',
    'vendi produto pra receber mês que vem',
    'vendi produto pra receber mes que vem',
    'vendi produto para receber mês que vem',
    'vendi produto para receber mes que vem',
    'vendi o produto que será pago mês que vem',
    'vendi o produto que sera pago mes que vem',
    'vendi o produto que receberei mês que vem',
    'vendi o produto que receberei mes que vem',
    'vendi o produto pra mês que vem',
    'vendi o produto pra mes que vem',
    'vendi o produto para mês que vem',
    'vendi o produto para mes que vem',
    'vendi o produto pra receber mês que vem',
    'vendi o produto pra receber mes que vem',
    'vendi o produto para receber mês que vem',
    'vendi o produto para receber mes que vem',
    'vendi a produto que será pago mês que vem',
    'vendi a produto que sera pago mes que vem',
    'vendi a produto que receberei mês que vem',
    'vendi a produto que receberei mes que vem',
    'vendi a produto pra mês que vem',
    'vendi a produto pra mes que vem',
    'vendi a produto para mês que vem',
    'vendi a produto para mes que vem',
    'vendi a produto pra receber mês que vem',
    'vendi a produto pra receber mes que vem',
    'vendi a produto para receber mês que vem',
    'vendi a produto para receber mes que vem',
    'vendi um produto que será pago semana que vem',
    'vendi um produto que sera pago semana que vem',
    'vendi um produto que será pago na próxima semana',
    'vendi um produto que sera pago na proxima semana',
    'vendi um produto que receberei semana que vem',
    'vendi um produto que receberei na próxima semana',
    'vendi um produto pra semana que vem',
    'vendi um produto pra proxima semana',
    'vendi um produto para semana que vem',
    'vendi um produto para proxima semana',
    'vendi um produto pra receber semana que vem',
    'vendi um produto pra receber proxima semana',
    'vendi um produto para receber semana que vem',
    'vendi um produto para receber proxima semana',
    'vendi um produto que será pago amanhã',
    'vendi um produto que sera pago amanhã',
    'vendi um produto que será pago amanha',
    'vendi um produto que receberei amanhã',
    'vendi um produto que receberei amanha',
    'vendi um produto pra amanhã',
    'vendi um produto pra amanha',
    'vendi um produto para amanhã',
    'vendi um produto para amanha',
    'vendi um produto que será pago dia X',
    'vendi um produto que sera pago dia X',
    'vendi um produto que será pago no dia X',
    'vendi um produto que sera pago no dia X',
    'vendi um produto que receberei dia X',
    'vendi um produto que receberei no dia X',
    'vendi um produto pra dia X',
    'vendi um produto pra no dia X',
    'vendi um produto para dia X',
    'vendi um produto para no dia X',
  ],
}

/**
 * Variações para COMPRAS (com pagamento futuro)
 */
export const BUY_VARIATIONS = {
  basic: [
    'comprei',
    'comprar',
    'compra',
    'comprado',
    'compramos',
    'comprou',
    'adquiri',
    'adquirir',
    'adquirido',
    'fiz uma compra',
    'realizei uma compra',
    'foi comprado',
  ],

  withProduct: [
    'comprei um produto',
    'comprei uma produto',
    'comprei o produto',
    'comprei a produto',
    'comprei produto',
    'comprei produtos',
    'comprei um item',
    'comprei uma item',
    'comprei o item',
    'comprei a item',
  ],

  futurePayment: [
    'será pago',
    'sera pago',
    'ser pago',
    'será pago em',
    'sera pago em',
    'ser pago em',
    'vai ser pago',
    'vai ser pago em',
    'pago será',
    'pago sera',
    'pago em',
    'pago no',
    'pago na',
    'vou pagar',
    'vai pagar',
    'vou pagar em',
    'vai pagar em',
    'pagar em',
    'pagar no',
    'pagar na',
    'para pagar',
    'pra pagar',
    'a pagar',
    'a pagar em',
  ],

  fullCombinations: [
    'comprei um produto que será pago mês que vem',
    'comprei um produto que sera pago mes que vem',
    'comprei um produto que será pago no próximo mês',
    'comprei um produto que sera pago no proximo mes',
    'comprei um produto pra pagar mês que vem',
    'comprei um produto pra pagar mes que vem',
    'comprei um produto para pagar mês que vem',
    'comprei um produto para pagar mes que vem',
    'comprei produto que será pago mês que vem',
    'comprei produto que sera pago mes que vem',
    'comprei produto pra pagar mês que vem',
    'comprei produto pra pagar mes que vem',
    'comprei produto para pagar mês que vem',
    'comprei produto para pagar mes que vem',
  ],
}

/**
 * Variações para DESPESAS
 */
export const EXPENSE_VARIATIONS = {
  basic: [
    'gastei',
    'gastar',
    'gasto',
    'despesa',
    'despesas',
    'paguei',
    'pagar',
    'pagamento',
    'pagou',
    'paguei uma conta',
    'paguei conta',
    'paguei uma despesa',
    'paguei despesa',
    'tive uma despesa',
    'tive despesa',
    'fiz um pagamento',
    'fiz pagamento',
    'realizei um pagamento',
    'realizei pagamento',
  ],

  withAmount: [
    'gastei X reais',
    'gastei R$ X',
    'gastei X reais com',
    'gastei R$ X com',
    'paguei X reais',
    'paguei R$ X',
    'paguei X reais de',
    'paguei R$ X de',
    'paguei X reais por',
    'paguei R$ X por',
    'despesa de X reais',
    'despesa de R$ X',
    'despesa com X reais',
    'despesa com R$ X',
  ],

  withDescription: [
    'gastei com',
    'gastei em',
    'gastei no',
    'gastei na',
    'paguei com',
    'paguei em',
    'paguei no',
    'paguei na',
    'paguei de',
    'paguei por',
    'despesa com',
    'despesa em',
    'despesa no',
    'despesa na',
    'despesa de',
    'despesa por',
  ],

  withDate: [
    'gastei hoje',
    'gastei amanhã',
    'gastei amanha',
    'gastei mês que vem',
    'gastei mes que vem',
    'paguei hoje',
    'paguei amanhã',
    'paguei amanha',
    'paguei mês que vem',
    'paguei mes que vem',
    'paguei semana que vem',
    'paguei proxima semana',
    'paguei dia X',
    'paguei no dia X',
  ],

  fullCombinations: [
    'gastei X reais no supermercado hoje',
    'gastei X reais no supermercado',
    'gastei R$ X no supermercado hoje',
    'gastei R$ X no supermercado',
    'paguei X reais de conta de luz hoje',
    'paguei X reais de conta de luz',
    'paguei R$ X de conta de luz hoje',
    'paguei R$ X de conta de luz',
    'paguei X reais no supermercado hoje',
    'paguei X reais no supermercado',
    'paguei R$ X no supermercado hoje',
    'paguei R$ X no supermercado',
    'despesa de X reais no supermercado',
    'despesa de R$ X no supermercado',
    'despesa com X reais no supermercado',
    'despesa com R$ X no supermercado',
  ],
}

/**
 * Variações para RECEITAS (sem produto)
 */
export const INCOME_VARIATIONS = {
  basic: [
    'recebi',
    'receber',
    'receita',
    'renda',
    'ganhei',
    'ganhar',
    'ganho',
    'entrada',
    'entrada de',
    'entrada com',
    'recebi uma receita',
    'recebi receita',
    'tive uma receita',
    'tive receita',
    'fiz uma receita',
    'fiz receita',
    'realizei uma receita',
    'realizei receita',
  ],

  withAmount: [
    'recebi X reais',
    'recebi R$ X',
    'recebi X reais de',
    'recebi R$ X de',
    'recebi X reais por',
    'recebi R$ X por',
    'ganhei X reais',
    'ganhei R$ X',
    'ganhei X reais de',
    'ganhei R$ X de',
    'ganhei X reais por',
    'ganhei R$ X por',
    'receita de X reais',
    'receita de R$ X',
    'receita com X reais',
    'receita com R$ X',
  ],

  withDescription: [
    'recebi de',
    'recebi por',
    'recebi com',
    'recebi em',
    'ganhei de',
    'ganhei por',
    'ganhei com',
    'ganhei em',
    'receita de',
    'receita por',
    'receita com',
    'receita em',
  ],

  withDate: [
    'recebi hoje',
    'recebi amanhã',
    'recebi amanha',
    'recebi mês que vem',
    'recebi mes que vem',
    'ganhei hoje',
    'ganhei amanhã',
    'ganhei amanha',
    'ganhei mês que vem',
    'ganhei mes que vem',
    'recebi semana que vem',
    'recebi proxima semana',
    'recebi dia X',
    'recebi no dia X',
  ],

  fullCombinations: [
    'recebi X reais de serviço hoje',
    'recebi X reais de serviço',
    'recebi R$ X de serviço hoje',
    'recebi R$ X de serviço',
    'ganhei X reais de serviço hoje',
    'ganhei X reais de serviço',
    'ganhei R$ X de serviço hoje',
    'ganhei R$ X de serviço',
    'receita de X reais de serviço',
    'receita de R$ X de serviço',
    'receita com X reais de serviço',
    'receita com R$ X de serviço',
  ],
}

/**
 * Variações para AGENDAR PAGAMENTO
 */
export const SCHEDULE_PAYMENT_VARIATIONS = {
  basic: [
    'agendar pagamento',
    'agendar',
    'agende',
    'marcar pagamento',
    'marcar',
    'marcar para',
    'agendar para',
    'agende para',
    'programar pagamento',
    'programar',
    'programar para',
  ],

  withDate: [
    'agendar pagamento para',
    'agendar para',
    'agende pagamento para',
    'agende para',
    'marcar pagamento para',
    'marcar para',
    'programar pagamento para',
    'programar para',
    'agendar no dia',
    'agende no dia',
    'marcar no dia',
    'programar no dia',
    'agendar em',
    'agende em',
    'marcar em',
    'programar em',
  ],

  fullCombinations: [
    'agendar pagamento para mês que vem',
    'agendar pagamento para mes que vem',
    'agendar pagamento para próximo mês',
    'agendar pagamento para proximo mes',
    'agendar pagamento para semana que vem',
    'agendar pagamento para proxima semana',
    'agendar pagamento para amanhã',
    'agendar pagamento para amanha',
    'agendar pagamento para dia X',
    'agendar pagamento para no dia X',
    'agendar pagamento para dia X/mês',
    'agendar pagamento para dia X/mês/ano',
    'agendar para mês que vem',
    'agendar para mes que vem',
    'agendar para próximo mês',
    'agendar para proximo mes',
    'agendar para semana que vem',
    'agendar para proxima semana',
    'agendar para amanhã',
    'agendar para amanha',
    'agendar para dia X',
    'agendar para no dia X',
    'agendar para dia X/mês',
    'agendar para dia X/mês/ano',
    'marcar pagamento para mês que vem',
    'marcar pagamento para mes que vem',
    'marcar pagamento para próximo mês',
    'marcar pagamento para proximo mes',
    'marcar pagamento para semana que vem',
    'marcar pagamento para proxima semana',
    'marcar pagamento para amanhã',
    'marcar pagamento para amanha',
    'marcar pagamento para dia X',
    'marcar pagamento para no dia X',
    'marcar pagamento para dia X/mês',
    'marcar pagamento para dia X/mês/ano',
    'marcar para mês que vem',
    'marcar para mes que vem',
    'marcar para próximo mês',
    'marcar para proximo mes',
    'marcar para semana que vem',
    'marcar para proxima semana',
    'marcar para amanhã',
    'marcar para amanha',
    'marcar para dia X',
    'marcar para no dia X',
    'marcar para dia X/mês',
    'marcar para dia X/mês/ano',
  ],
}

/**
 * Variações para PARCELAMENTO
 */
export const INSTALLMENT_VARIATIONS = {
  basic: [
    'parcelado',
    'parcela',
    'parcelas',
    'parcelamento',
    'dividido',
    'dividir',
    'dividido em',
    'dividir em',
  ],

  withCount: [
    'em X vezes',
    'em X x',
    'em X parcelas',
    'em X parcelas de',
    'dividido em X vezes',
    'dividido em X x',
    'dividido em X parcelas',
    'dividido em X parcelas de',
    'parcelado em X vezes',
    'parcelado em X x',
    'parcelado em X parcelas',
    'parcelado em X parcelas de',
    'X vezes de',
    'X x de',
    'X parcelas de',
  ],

  withInterval: [
    'mensal',
    'mensalmente',
    'todo mês',
    'toda mês',
    'por mês',
    'mensais',
    'semanal',
    'semanalmente',
    'toda semana',
    'por semana',
    'semanais',
    'trimestral',
    'trimestralmente',
    'por trimestre',
    'trimestrais',
  ],

  fullCombinations: [
    'vendi em X vezes',
    'vendi em X x',
    'vendi em X parcelas',
    'vendi em X parcelas de Y reais',
    'vendi em X x de Y reais',
    'vendi em X vezes de Y reais',
    'vendi parcelado em X vezes',
    'vendi parcelado em X x',
    'vendi parcelado em X parcelas',
    'vendi parcelado em X parcelas de Y reais',
    'vendi parcelado em X x de Y reais',
    'vendi parcelado em X vezes de Y reais',
    'vendi dividido em X vezes',
    'vendi dividido em X x',
    'vendi dividido em X parcelas',
    'vendi dividido em X parcelas de Y reais',
    'vendi dividido em X x de Y reais',
    'vendi dividido em X vezes de Y reais',
    'venda em X vezes',
    'venda em X x',
    'venda em X parcelas',
    'venda em X parcelas de Y reais',
    'venda em X x de Y reais',
    'venda em X vezes de Y reais',
    'venda parcelada em X vezes',
    'venda parcelada em X x',
    'venda parcelada em X parcelas',
    'venda parcelada em X parcelas de Y reais',
    'venda parcelada em X x de Y reais',
    'venda parcelada em X vezes de Y reais',
    'comprei em X vezes',
    'comprei em X x',
    'comprei em X parcelas',
    'comprei em X parcelas de Y reais',
    'comprei em X x de Y reais',
    'comprei em X vezes de Y reais',
    'compra em X vezes',
    'compra em X x',
    'compra em X parcelas',
    'compra em X parcelas de Y reais',
    'compra em X x de Y reais',
    'compra em X vezes de Y reais',
  ],
}

/**
 * Variações para RECORRÊNCIA
 */
export const RECURRING_VARIATIONS = {
  basic: [
    'recorrente',
    'recorrencia',
    'recorrência',
    'mensal',
    'mensalmente',
    'semanal',
    'semanalmente',
    'trimestral',
    'trimestralmente',
    'todo mês',
    'toda mês',
    'toda semana',
    'toda semana',
    'por mês',
    'por semana',
    'por trimestre',
  ],

  withEndDate: [
    'até',
    'ate',
    'até dia',
    'ate dia',
    'até o dia',
    'ate o dia',
    'até dia X',
    'ate dia X',
    'até o dia X',
    'ate o dia X',
    'até dia X/mês',
    'ate dia X/mes',
    'até o dia X/mês',
    'ate o dia X/mes',
    'até dia X/mês/ano',
    'ate dia X/mes/ano',
    'até o dia X/mês/ano',
    'ate o dia X/mes/ano',
    'termina em',
    'termina dia',
    'termina no dia',
    'termina dia X',
    'termina no dia X',
    'termina dia X/mês',
    'termina no dia X/mês',
    'termina dia X/mês/ano',
    'termina no dia X/mês/ano',
    'acaba em',
    'acaba dia',
    'acaba no dia',
    'acaba dia X',
    'acaba no dia X',
    'acaba dia X/mês',
    'acaba no dia X/mês',
    'acaba dia X/mês/ano',
    'acaba no dia X/mês/ano',
  ],

  fullCombinations: [
    'venda de X reais todo mês',
    'venda de X reais toda mês',
    'venda de X reais mensalmente',
    'venda de X reais por mês',
    'venda de X reais mensal',
    'venda de X reais todo mês até dia Y',
    'venda de X reais toda mês até dia Y',
    'venda de X reais mensalmente até dia Y',
    'venda de X reais por mês até dia Y',
    'venda de X reais mensal até dia Y',
    'venda de X reais todo mês até o dia Y',
    'venda de X reais toda mês até o dia Y',
    'venda de X reais mensalmente até o dia Y',
    'venda de X reais por mês até o dia Y',
    'venda de X reais mensal até o dia Y',
    'venda de X reais todo mês até dia Y/mês',
    'venda de X reais toda mês até dia Y/mês',
    'venda de X reais mensalmente até dia Y/mês',
    'venda de X reais por mês até dia Y/mês',
    'venda de X reais mensal até dia Y/mês',
    'venda de X reais todo mês até o dia Y/mês',
    'venda de X reais toda mês até o dia Y/mês',
    'venda de X reais mensalmente até o dia Y/mês',
    'venda de X reais por mês até o dia Y/mês',
    'venda de X reais mensal até o dia Y/mês',
    'venda de X reais todo mês até dia Y/mês/ano',
    'venda de X reais toda mês até dia Y/mês/ano',
    'venda de X reais mensalmente até dia Y/mês/ano',
    'venda de X reais por mês até dia Y/mês/ano',
    'venda de X reais mensal até dia Y/mês/ano',
    'venda de X reais todo mês até o dia Y/mês/ano',
    'venda de X reais toda mês até o dia Y/mês/ano',
    'venda de X reais mensalmente até o dia Y/mês/ano',
    'venda de X reais por mês até o dia Y/mês/ano',
    'venda de X reais mensal até o dia Y/mês/ano',
    'receita de X reais todo mês',
    'receita de X reais toda mês',
    'receita de X reais mensalmente',
    'receita de X reais por mês',
    'receita de X reais mensal',
    'receita de X reais todo mês até dia Y',
    'receita de X reais toda mês até dia Y',
    'receita de X reais mensalmente até dia Y',
    'receita de X reais por mês até dia Y',
    'receita de X reais mensal até dia Y',
    'despesa de X reais todo mês',
    'despesa de X reais toda mês',
    'despesa de X reais mensalmente',
    'despesa de X reais por mês',
    'despesa de X reais mensal',
    'despesa de X reais todo mês até dia Y',
    'despesa de X reais toda mês até dia Y',
    'despesa de X reais mensalmente até dia Y',
    'despesa de X reais por mês até dia Y',
    'despesa de X reais mensal até dia Y',
  ],
}

/**
 * Função auxiliar para gerar todas as variações possíveis
 * Útil para testes e documentação
 */
export function getAllVariations(): string[] {
  const variations: string[] = []

  // Vendas
  variations.push(...SELL_VARIATIONS.fullCombinations)
  
  // Compras
  variations.push(...BUY_VARIATIONS.fullCombinations)
  
  // Despesas
  variations.push(...EXPENSE_VARIATIONS.fullCombinations)
  
  // Receitas
  variations.push(...INCOME_VARIATIONS.fullCombinations)
  
  // Agendamentos
  variations.push(...SCHEDULE_PAYMENT_VARIATIONS.fullCombinations)
  
  // Parcelamentos
  variations.push(...INSTALLMENT_VARIATIONS.fullCombinations)
  
  // Recorrências
  variations.push(...RECURRING_VARIATIONS.fullCombinations)

  return variations
}

/**
 * Função para gerar exemplos de contexto para o prompt do Claude
 * Retorna uma string formatada com todos os exemplos
 */
export function generateContextExamples(): string {
  const examples: string[] = []

  // Exemplos de vendas com pagamento futuro
  examples.push(
    '// VENDAS COM PAGAMENTO FUTURO:',
    'Comando: "vendi um produto que será pago mês que vem"',
    'Comando: "vendi um produto que receberei mês que vem"',
    'Comando: "vendi um produto pra mês que vem"',
    'Comando: "vendi um produto pra receber mês que vem"',
    'Comando: "vendi um produto que será pago semana que vem"',
    'Comando: "vendi um produto que será pago amanhã"',
    'Comando: "vendi um produto que será pago dia 15"',
    'Comando: "vendi um produto que será pago dia 15/02"',
    'Comando: "vendi um produto que será pago dia 15/02/2025"',
    ''
  )

  // Exemplos de compras com pagamento futuro
  examples.push(
    '// COMPRAS COM PAGAMENTO FUTURO:',
    'Comando: "comprei um produto que será pago mês que vem"',
    'Comando: "comprei um produto pra pagar mês que vem"',
    'Comando: "comprei um produto que será pago semana que vem"',
    ''
  )

  // Exemplos de despesas
  examples.push(
    '// DESPESAS:',
    'Comando: "gastei 50 reais no supermercado hoje"',
    'Comando: "paguei 200 reais de conta de luz"',
    'Comando: "despesa de 100 reais com transporte"',
    ''
  )

  // Exemplos de receitas
  examples.push(
    '// RECEITAS:',
    'Comando: "recebi 500 reais de serviço"',
    'Comando: "ganhei 300 reais hoje"',
    'Comando: "receita de 200 reais"',
    ''
  )

  // Exemplos de parcelamentos
  examples.push(
    '// PARCELAMENTOS:',
    'Comando: "vendi um produto em 3x de 50 reais"',
    'Comando: "vendi em 3 vezes"',
    'Comando: "venda parcelada em 6x"',
    ''
  )

  // Exemplos de recorrências
  examples.push(
    '// RECORRÊNCIAS:',
    'Comando: "venda de 200 reais todo mês"',
    'Comando: "receita de 500 reais mensalmente"',
    'Comando: "despesa de 100 reais todo mês até dia 15"',
    ''
  )

  return examples.join('\n')
}






