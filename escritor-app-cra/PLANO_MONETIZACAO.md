# 📊 Plano de Monetização - Sistema de Créditos/Tokens

## 🎯 Visão Geral
Sistema de monetização baseado em créditos consumíveis + assinatura mensal que oferece benefícios e créditos inclusos.

## 💳 Estrutura de Planos

### 1. **Plano Gratuito (Free Trial)**
- ✅ 1.000 palavras grátis para testar
- ✅ Acesso ao editor básico
- ✅ 1 livro ativo
- ❌ Sem assistente IA avançado
- ❌ Sem geração de imagens

### 2. **Plano Essencial** - R$ 29,90/mês
- ✅ 5.000 créditos inclusos/mês
- ✅ Editor completo
- ✅ 3 livros ativos
- ✅ Assistente IA básico
- ✅ Salvamento automático
- ✅ Exportação básica

### 3. **Plano Profissional** - R$ 79,90/mês
- ✅ 20.000 créditos inclusos/mês
- ✅ Todos os recursos do Essencial
- ✅ Livros ilimitados
- ✅ Assistente IA avançado
- ✅ Geração de capas (10/mês)
- ✅ Análise de mercado
- ✅ Suporte prioritário
- ✅ 20% desconto em créditos extras

### 4. **Plano Empresarial** - R$ 199,90/mês
- ✅ 50.000 créditos inclusos/mês
- ✅ Todos os recursos do Profissional
- ✅ API access
- ✅ Multi-usuários (até 5)
- ✅ Geração de imagens ilimitada
- ✅ Relatórios avançados
- ✅ 30% desconto em créditos extras
- ✅ Suporte VIP

## 💰 Sistema de Créditos

### Tabela de Consumo
| Ação | Créditos Consumidos |
|------|-------------------|
| Gerar 100 palavras com IA | 10 créditos |
| Autocomplete (por sugestão) | 2 créditos |
| Melhorar parágrafo | 15 créditos |
| Gerar capítulo completo | 500 créditos |
| Gerar capa com IA | 100 créditos |
| Análise de texto | 20 créditos |
| Tradução (por 1000 palavras) | 50 créditos |

### Pacotes de Créditos Avulsos
- 🪙 1.000 créditos = R$ 9,90
- 🪙 5.000 créditos = R$ 39,90 (20% economia)
- 🪙 10.000 créditos = R$ 69,90 (30% economia)
- 🪙 50.000 créditos = R$ 299,90 (40% economia)

## 📊 Sistema de Monitoramento

### 1. **Analytics de Uso**
```typescript
interface UserUsageMetrics {
  userId: string;
  totalCreditsUsed: number;
  creditsRemaining: number;
  usageByFeature: {
    textGeneration: number;
    autocomplete: number;
    imageGeneration: number;
    improvements: number;
  };
  dailyUsage: DailyUsage[];
  peakUsageHours: number[];
}
```

### 2. **Dashboards Necessários**

#### Dashboard do Usuário
- Créditos restantes (visual circular)
- Histórico de consumo (gráfico de linha)
- Previsão de término dos créditos
- Botão rápido para comprar mais

#### Dashboard Admin
- Total de usuários por plano
- Receita recorrente (MRR)
- Consumo médio por feature
- Taxa de conversão free → pago
- Churn rate por plano

### 3. **Alertas e Notificações**
- 🔔 Quando restam 20% dos créditos
- 🔔 Quando créditos acabam
- 🔔 Ofertas especiais baseadas no uso
- 🔔 Upgrade sugerido baseado em padrão

## 🔧 Implementação Técnica

### 1. **Banco de Dados - Novas Tabelas**

```sql
-- Tabela de planos
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  name VARCHAR(50),
  price DECIMAL(10,2),
  credits_included INTEGER,
  features JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de assinaturas
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR(20), -- active, cancelled, expired
  credits_remaining INTEGER,
  billing_cycle_start DATE,
  billing_cycle_end DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de transações de créditos
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount INTEGER, -- positivo para compra, negativo para uso
  transaction_type VARCHAR(50),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de uso detalhado
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  feature VARCHAR(50),
  credits_used INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. **API Endpoints Necessários**

```typescript
// Verificar créditos
GET /api/credits/balance

// Histórico de uso
GET /api/credits/history?start_date=&end_date=

// Comprar créditos
POST /api/credits/purchase
{
  "package": "5000",
  "payment_method": "credit_card"
}

// Analytics
GET /api/analytics/usage?period=30d
GET /api/analytics/credits-forecast
```

### 3. **Middleware de Verificação**

```typescript
// Antes de cada ação que consome créditos
export async function checkCredits(userId: string, requiredCredits: number): Promise<boolean> {
  const balance = await getCreditBalance(userId);
  return balance >= requiredCredits;
}

// Consumir créditos
export async function consumeCredits(userId: string, amount: number, feature: string) {
  // 1. Verificar saldo
  // 2. Deduzir créditos
  // 3. Registrar no log
  // 4. Enviar evento para analytics
}
```

## 📈 Estratégias de Conversão

### 1. **Free → Pago**
- Mostrar "Você economizou R$ X usando o Bookwriter"
- Depoimentos de sucesso após 500 palavras
- Oferta especial no primeiro upgrade (50% no primeiro mês)

### 2. **Upsell para Planos Maiores**
- "Você usou 80% dos seus créditos em 10 dias"
- "Economize 30% upgradeando para Profissional"
- Mostrar features bloqueadas com "Disponível no plano X"

### 3. **Retenção**
- Créditos bônus por indicação
- Desconto por pagamento anual
- Programa de fidelidade (após 6 meses, 10% desconto)

## 🚀 Fases de Implementação

### Fase 1 (2 semanas)
- [ ] Criar tabelas no banco
- [ ] Sistema básico de créditos
- [ ] Contador de créditos no header
- [ ] Bloqueio quando acabam créditos

### Fase 2 (2 semanas)
- [ ] Integração com gateway de pagamento
- [ ] Dashboard de uso do usuário
- [ ] Sistema de notificações
- [ ] Página de compra de créditos

### Fase 3 (1 semana)
- [ ] Analytics avançado
- [ ] Dashboard admin
- [ ] Otimizações de conversão
- [ ] A/B testing de preços

## 💡 Diferenciais Competitivos

1. **Transparência Total**
   - Mostrar exatamente quantos créditos cada ação consome
   - Histórico detalhado de uso

2. **Flexibilidade**
   - Comprar créditos extras a qualquer momento
   - Não perder créditos não usados (acumulam por 3 meses)

3. **Gamificação**
   - Badges por marcos alcançados
   - Créditos bônus por completar livros
   - Ranking de autores mais produtivos

## 📊 Métricas de Sucesso

- **MRR** (Monthly Recurring Revenue)
- **ARPU** (Average Revenue Per User)
- **CAC** (Customer Acquisition Cost)
- **LTV** (Lifetime Value)
- **Churn Rate** por plano
- **Taxa de Conversão** free → pago
- **Uso médio de créditos** por plano

## 🔐 Considerações de Segurança

1. Validação server-side de todos os consumos
2. Rate limiting por usuário
3. Logs de auditoria para todas as transações
4. Backup diário de dados de créditos
5. Alertas para uso anormal (possível abuso)