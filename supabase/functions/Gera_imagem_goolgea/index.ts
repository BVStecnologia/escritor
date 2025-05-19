import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Função helper para adicionar cabeçalhos CORS em todas as respostas
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, apikey',
    'Content-Type': 'application/json'
  };
}

serve(async (req) => {
  // CORS handling para preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders(),
      status: 204
    });
  }

  try {
    // Parse request body
    const requestText = await req.text();
    console.log("Request body:", requestText);
    let requestData;
    
    try {
      requestData = JSON.parse(requestText);
    } catch (e) {
      return new Response(JSON.stringify({
        error: 'Invalid JSON in request',
        details: e.message
      }), {
        headers: corsHeaders(),
        status: 400
      });
    }
    
    // Get required parameters
    // A chave API é enviada diretamente no corpo da requisição
    const apiKey = requestData.apiKey;
    const prompt = requestData.prompt || "A robot holding a red skateboard";
    const sampleCount = requestData.sampleCount || 1;
    
    // Verificar se a chave da API foi fornecida
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'Configuração inválida. A chave da API não foi fornecida.',
        details: 'Inclua apiKey no corpo da requisição.'
      }), {
        headers: corsHeaders(),
        status: 400
      });
    }
    
    // URL da API Imagen 3
    // A chave da API é adicionada diretamente à URL da requisição
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
    
    // Corpo da requisição para a API Imagen
    const requestBody = {
      instances: [
        {
          prompt: prompt
        }
      ],
      parameters: {
        sampleCount: sampleCount
      }
    };
    
    // Adicionar log detalhado da requisição (sem mostrar a chave)
    console.log("Enviando requisição para Imagen 3");
    console.log("Corpo da requisição:", JSON.stringify(requestBody));
    
    // Fazer a requisição para a API do Google
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    // Capturar resposta como texto para depuração
    const responseText = await response.text();
    console.log("Status da resposta:", response.status);
    console.log("Resposta (primeiros 500 caracteres):", responseText.substring(0, 500));
    
    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: `Erro na API do Google Imagen: ${response.status}`,
        details: responseText
      }), {
        headers: corsHeaders(),
        status: 500
      });
    }
    
    // Converter resposta para JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Erro ao processar resposta da API',
        details: e.message
      }), {
        headers: corsHeaders(),
        status: 500
      });
    }
    
    // Extrair URLs das imagens da resposta
    const imageUrls = [];
    if (responseData.predictions) {
      for (const prediction of responseData.predictions) {
        if (prediction.bytesBase64Encoded) {
          // Extrair URLs de imagem da resposta em formato data URL
          imageUrls.push(
            `data:image/png;base64,${prediction.bytesBase64Encoded}`
          );
        }
      }
    }
    
    // Verificar se foram geradas imagens
    if (imageUrls.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Não foi possível gerar as imagens',
        details: 'A API não retornou dados de imagem válidos'
      }), {
        headers: corsHeaders(),
        status: 500
      });
    }
    
    // Retornar URLs das imagens geradas
    return new Response(JSON.stringify({
      success: true,
      imageUrls: imageUrls,
      totalImages: imageUrls.length
    }), {
      headers: corsHeaders(),
      status: 200
    });
    
  } catch (error) {
    // Capturar e logar quaisquer erros não tratados
    console.error("Erro ao processar requisição:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno no servidor',
      details: error.message
    }), {
      headers: corsHeaders(),
      status: 500
    });
  }
}); 