// supabase-diagnostics.ts
import { SupabaseClient } from '@supabase/supabase-js';

// Utility para diagnóstico do Supabase
export async function checkSupabaseConnection(supabase: SupabaseClient | null) {
  console.log('%c[SUPABASE] Verificando conexão com Supabase', 'color: purple; font-weight: bold');
  
  if (!supabase) {
    console.error('%c[SUPABASE] Cliente Supabase não inicializado', 'color: red; font-weight: bold');
    return {
      connected: false,
      error: 'Cliente Supabase não inicializado',
      details: {}
    };
  }
  
  const diagnostics: any = {
    connected: false,
    tests: {
      ping: { success: false, time: null, error: null },
      auth: { success: false, error: null },
      database: { success: false, error: null },
      storage: { success: false, buckets: [], error: null }
    }
  };
  
  try {
    // Teste 1: Ping simples para verificar conexão
    console.log('%c[SUPABASE] Executando ping...', 'color: purple');
    const startTime = performance.now();
    
    const { data: pingData, error: pingError } = await supabase.from('health_check').select('*').limit(1);
    
    const endTime = performance.now();
    const pingTime = endTime - startTime;
    
    diagnostics.tests.ping.time = pingTime.toFixed(2) + 'ms';
    
    if (pingError) {
      console.error('%c[SUPABASE] Falha no ping:', 'color: red', pingError);
      diagnostics.tests.ping.error = pingError.message;
    } else {
      console.log('%c[SUPABASE] Ping bem-sucedido (' + diagnostics.tests.ping.time + ')', 'color: green');
      diagnostics.tests.ping.success = true;
    }
    
    // Teste 2: Verificar status de autenticação
    console.log('%c[SUPABASE] Verificando autenticação...', 'color: purple');
    const { data: session, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('%c[SUPABASE] Falha na verificação de autenticação:', 'color: red', authError);
      diagnostics.tests.auth.error = authError.message;
    } else {
      console.log('%c[SUPABASE] API de autenticação funcional', 'color: green');
      diagnostics.tests.auth.success = true;
      diagnostics.tests.auth.session = session ? true : false;
    }
    
    // Teste 3: Verificar acesso ao banco de dados
    console.log('%c[SUPABASE] Verificando acesso ao banco de dados...', 'color: purple');
    const { data: dbData, error: dbError } = await supabase
      .from('stores')
      .select('count')
      .limit(1);
    
    if (dbError) {
      console.error('%c[SUPABASE] Falha no acesso ao banco de dados:', 'color: red', dbError);
      diagnostics.tests.database.error = dbError.message;
    } else {
      console.log('%c[SUPABASE] Acesso ao banco de dados funcional', 'color: green');
      diagnostics.tests.database.success = true;
    }
    
    // Teste 4: Verificar acesso ao storage
    console.log('%c[SUPABASE] Verificando acesso ao storage...', 'color: purple');
    const { data: buckets, error: storageError } = await supabase
      .storage
      .listBuckets();
    
    if (storageError) {
      console.error('%c[SUPABASE] Falha no acesso ao storage:', 'color: red', storageError);
      diagnostics.tests.storage.error = storageError.message;
    } else {
      console.log('%c[SUPABASE] Acesso ao storage funcional', 'color: green', buckets);
      diagnostics.tests.storage.success = true;
      diagnostics.tests.storage.buckets = buckets.map(b => b.name);
      
      // Verificar se o bucket store-images existe
      const hasStoreBucket = buckets.some(b => b.name === 'store-images');
      diagnostics.tests.storage.hasStoreBucket = hasStoreBucket;
      
      if (!hasStoreBucket) {
        console.warn('%c[SUPABASE] Bucket "store-images" não encontrado!', 'color: orange; font-weight: bold');
      } else {
        // Verificar permissões do bucket
        try {
          const { data: bucketData, error: bucketError } = await supabase
            .storage
            .getBucket('store-images');
          
          if (bucketError) {
            console.error('%c[SUPABASE] Erro ao verificar bucket "store-images":', 'color: red', bucketError);
          } else {
            console.log('%c[SUPABASE] Bucket "store-images" configuração:', 'color: green', bucketData);
            diagnostics.tests.storage.bucketDetails = bucketData;
          }
        } catch (bucketError) {
          console.error('%c[SUPABASE] Exceção ao verificar bucket "store-images":', 'color: red', bucketError);
        }
      }
    }
    
    // Status geral
    diagnostics.connected = 
      diagnostics.tests.ping.success && 
      diagnostics.tests.auth.success && 
      diagnostics.tests.database.success && 
      diagnostics.tests.storage.success;
    
    const status = diagnostics.connected ? 'CONECTADO' : 'PROBLEMAS DETECTADOS';
    console.log(
      `%c[SUPABASE] DIAGNÓSTICO: ${status}`, 
      `color: ${diagnostics.connected ? 'green' : 'red'}; font-weight: bold; font-size: 14px`
    );
    
    return diagnostics;
  } catch (error) {
    console.error('%c[SUPABASE] Erro grave durante diagnóstico:', 'color: red; font-weight: bold', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      details: diagnostics
    };
  }
}

// Testar upload de uma imagem de teste pequena para o bucket
export async function testImageUpload(supabase: SupabaseClient | null, bucketName = 'store-images') {
  console.log('%c[SUPABASE] Testando upload de imagem...', 'color: purple; font-weight: bold');
  
  if (!supabase) {
    console.error('%c[SUPABASE] Cliente Supabase não inicializado', 'color: red; font-weight: bold');
    return { success: false, error: 'Cliente Supabase não inicializado' };
  }
  
  try {
    // Criar uma pequena imagem de teste (1x1 pixel transparente)
    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: 'image/png' });
    const file = new File([blob], 'test-upload.png', { type: 'image/png' });
    
    // Nome único para o arquivo de teste
    const testFileName = `test-upload-${Date.now()}.png`;
    const testFilePath = `test/${testFileName}`;
    
    console.log('%c[SUPABASE] Enviando arquivo de teste para o bucket:', 'color: purple', {
      bucket: bucketName,
      path: testFilePath,
      size: file.size
    });
    
    // Fazer upload do arquivo de teste
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(testFilePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('%c[SUPABASE] Falha no teste de upload:', 'color: red', error);
      return { success: false, error: error.message };
    }
    
    console.log('%c[SUPABASE] Upload de teste bem-sucedido:', 'color: green', data);
    
    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(testFilePath);
    
    console.log('%c[SUPABASE] URL pública gerada:', 'color: green', urlData.publicUrl);
    
    // Remover o arquivo de teste
    const { error: removeError } = await supabase.storage
      .from(bucketName)
      .remove([testFilePath]);
    
    if (removeError) {
      console.warn('%c[SUPABASE] Falha ao remover arquivo de teste:', 'color: orange', removeError);
    } else {
      console.log('%c[SUPABASE] Arquivo de teste removido com sucesso', 'color: green');
    }
    
    return { 
      success: true, 
      url: urlData.publicUrl,
      details: {
        path: testFilePath,
        size: file.size,
        cleanupSuccess: !removeError
      }
    };
  } catch (error) {
    console.error('%c[SUPABASE] Erro grave durante teste de upload:', 'color: red; font-weight: bold', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}