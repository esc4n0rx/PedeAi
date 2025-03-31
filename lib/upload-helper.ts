// upload-helper.js
import { v4 as uuidv4 } from 'uuid';


/**
 * Faz upload de uma imagem para o bucket do Supabase
 * 
 * @param {Object} supabase - Instância do cliente Supabase
 * @param {File} file - Arquivo a ser enviado
 * @param {string} bucket - Nome do bucket no storage
 * @param {string} folder - Pasta dentro do bucket
 * @returns {Promise<string|null>} URL pública da imagem ou null em caso de erro
 */
interface SupabaseClient {
    storage: {
        from: (bucket: string) => {
            upload: (path: string, file: File, options: { cacheControl: string, upsert: boolean }) => Promise<{
                data: any;
                error: Error | null;
            }>;
            getPublicUrl: (path: string) => {
                data: {
                    publicUrl: string;
                };
            };
        };
    };
}

export async function uploadImage(
    supabase: SupabaseClient, 
    file: File, 
    bucket: string = 'store-images', 
    folder: string = ''
): Promise<string | null> {
    if (!file) return null;
    
    try {
        // Gerar nome único para o arquivo
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;
        
        // Fazer upload do arquivo
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });
        
        if (error) throw error;
        
        // Obter URL pública
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);
        
        return urlData.publicUrl;
    } catch (error) {
        console.error('Erro ao fazer upload de imagem:', error);
        return null;
    }
}

/**
 * Remove uma imagem do bucket do Supabase
 * 
 * @param {Object} supabase - Instância do cliente Supabase
 * @param {string} url - URL da imagem a ser removida
 * @param {string} bucket - Nome do bucket no storage
 * @returns {Promise<boolean>} - true se sucesso, false se falha
 */
interface RemoveResponse {
    error: Error | null;
}

interface StorageRemoveClient {
    storage: {
        from: (bucket: string) => {
            remove: (paths: string[]) => Promise<RemoveResponse>;
        };
    };
}

export async function removeImage(
    supabase: StorageRemoveClient, 
    url: string, 
    bucket: string = 'store-images'
): Promise<boolean> {
    if (!url) return false;
    
    try {
        // Extrair o caminho do arquivo da URL
        const urlObj = new URL(url);
        const path = urlObj.pathname.split('/').slice(3).join('/');
        
        // Remover o arquivo
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);
        
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error('Erro ao remover imagem:', error);
        return false;
    }
}