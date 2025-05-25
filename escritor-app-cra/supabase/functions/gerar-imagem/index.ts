import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Configurações de ambiente
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY não configurada");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Obter dados da requisição
    const { 
      prompt = "A red cube", 
      sampleCount = 1, 
      type = "square", 
      quality = "medium" 
    } = await req.json();

    // Obter usuário autenticado
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        userId = user.id;
      }
    }

    // Configurar tamanho baseado no tipo
    let size = "1024x1024";
    switch(type) {
      case "landscape":
      case "paisagem":
        size = "1536x1024";
        break;
      case "portrait":
      case "retrato":
      case "book-cover":
      case "capa-livro":
        size = "1024x1536";
        break;
      case "square":
      case "quadrado":
      default:
        size = "1024x1024";
        break;
    }

    // Validar qualidade
    const validQualities = ["low", "medium", "high"];
    const finalQuality = validQualities.includes(quality) ? quality : "medium";

    // Calcular créditos estimados (para registro, não cobrança)
    const costs = { low: 50, medium: 100, high: 200 };
    const estimatedCredits = costs[finalQuality as keyof typeof costs] * sampleCount;

    console.log("Gerando imagem:", {
      prompt,
      type,
      size,
      quality: finalQuality,
      estimatedCredits,
      userId
    });

    const imageUrls = [];
    const errors = [];

    // Gerar imagens
    for(let i = 0; i < sampleCount; i++) {
      try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-image-1",
            prompt: prompt,
            n: 1,
            size: size,
            quality: finalQuality
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Erro OpenAI:", errorText);
          errors.push(`Imagem ${i + 1}: ${errorText}`);
          continue;
        }

        const data = await response.json();
        
        if (data.data && data.data[0] && data.data[0].b64_json) {
          console.log(`Salvando imagem ${i + 1}...`);
          
          // Converter base64 para bytes
          const base64 = data.data[0].b64_json;
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for(let j = 0; j < binaryString.length; j++) {
            bytes[j] = binaryString.charCodeAt(j);
          }

          // Gerar nome único
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(7);
          const filename = `generated-${timestamp}-${randomId}.png`;
          const path = `generated-images/${filename}`;

          // Upload para Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('ai-generated-images')
            .upload(path, bytes, {
              contentType: "image/png",
              upsert: false
            });

          if (uploadError) {
            console.error("Erro upload:", uploadError);
            errors.push(`Imagem ${i + 1}: Erro no upload`);
            continue;
          }

          // Obter URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('ai-generated-images')
            .getPublicUrl(path);

          imageUrls.push(publicUrl);
          console.log(`✓ Imagem ${i + 1} salva`);
        }
      } catch (error) {
        console.error(`Erro ao gerar imagem ${i + 1}:`, error);
        errors.push(`Imagem ${i + 1}: ${error.message}`);
      }
    }

    const processingTime = Date.now() - startTime;
    const success = imageUrls.length > 0;

    // Registrar a geração na tabela de tracking (sem cobrar)
    if (userId) {
      try {
        await supabase
          .from('image_generations')
          .insert({
            user_id: userId,
            prompt: prompt,
            type: type,
            quality: finalQuality,
            sample_count: sampleCount,
            image_urls: imageUrls,
            success: success,
            error_message: errors.length > 0 ? errors.join('; ') : null,
            estimated_credits: estimatedCredits,
            processing_time_ms: processingTime
          });
      } catch (trackingError) {
        console.error("Erro ao registrar geração:", trackingError);
        // Não falhar a requisição por erro de tracking
      }
    }

    // Retornar resultado
    return new Response(
      JSON.stringify({
        success: success,
        imageUrls: imageUrls,
        totalImages: imageUrls.length,
        settings: {
          type: type,
          size: size,
          quality: finalQuality
        },
        estimatedCredits: estimatedCredits,
        errors: errors.length > 0 ? errors : undefined,
        processingTimeMs: processingTime
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("Erro geral:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});