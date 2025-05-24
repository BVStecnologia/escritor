-- Tabela para rastrear todas as gerações de imagem
CREATE TABLE image_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados da requisição
  prompt TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- square, landscape, portrait, book-cover
  quality VARCHAR(20) NOT NULL, -- low, medium, high
  sample_count INTEGER NOT NULL DEFAULT 1,
  
  -- Resultado
  image_urls TEXT[], -- Array com URLs das imagens geradas
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  
  -- Custo estimado (para calcular depois)
  estimated_credits INTEGER NOT NULL, -- Calculado: sampleCount * custo_por_qualidade
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  processing_time_ms INTEGER, -- Tempo de processamento em millisegundos
  
  -- Índices para queries
  INDEX idx_user_created (user_id, created_at DESC),
  INDEX idx_success (success)
);

-- Tabela de custos por tipo/qualidade (configurável pelo admin)
CREATE TABLE image_generation_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quality VARCHAR(20) NOT NULL UNIQUE,
  credits_per_image INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Inserir custos padrão
INSERT INTO image_generation_costs (quality, credits_per_image) VALUES
  ('low', 50),
  ('medium', 100),
  ('high', 200);

-- View para analytics do usuário
CREATE VIEW user_image_generation_stats AS
SELECT 
  user_id,
  COUNT(*) as total_generations,
  SUM(sample_count) as total_images,
  SUM(estimated_credits) as total_credits_used,
  AVG(processing_time_ms) as avg_processing_time,
  COUNT(DISTINCT DATE(created_at)) as days_active,
  MAX(created_at) as last_generation
FROM image_generations
WHERE success = true
GROUP BY user_id;

-- View para analytics mensal
CREATE VIEW monthly_image_generation_stats AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_requests,
  SUM(sample_count) as total_images,
  SUM(estimated_credits) as total_credits,
  AVG(processing_time_ms) as avg_processing_time,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_requests
FROM image_generations
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Função para calcular créditos estimados
CREATE OR REPLACE FUNCTION calculate_image_credits(
  p_quality VARCHAR,
  p_sample_count INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_credits_per_image INTEGER;
BEGIN
  SELECT credits_per_image INTO v_credits_per_image
  FROM image_generation_costs
  WHERE quality = p_quality AND active = true
  LIMIT 1;
  
  IF v_credits_per_image IS NULL THEN
    -- Fallback para medium se não encontrar
    v_credits_per_image := 100;
  END IF;
  
  RETURN v_credits_per_image * p_sample_count;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE image_generations ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas suas próprias gerações
CREATE POLICY "Users can view own generations" ON image_generations
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem inserir suas próprias gerações
CREATE POLICY "Users can insert own generations" ON image_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin pode ver tudo
CREATE POLICY "Admins can view all generations" ON image_generations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Comentários explicativos
COMMENT ON TABLE image_generations IS 'Rastreia todas as gerações de imagem para contabilização posterior';
COMMENT ON COLUMN image_generations.estimated_credits IS 'Créditos estimados baseados na tabela de custos - será usado para cobrança';
COMMENT ON TABLE image_generation_costs IS 'Tabela configurável com custos por qualidade de imagem';