"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { Store, Upload, Bug } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { checkSupabaseConnection, testImageUpload } from "@/lib/supabase-diagnostics"
import { DynamicDebugPanel } from "@/components/dynamic-debug-panel"
import { uploadImage as cloudinaryUpload } from '@/lib/cloudinary-helper';

const logger = {
  info: (message: string, data?: any) => {
    console.log(`%c[INFO] ${message}`, 'color: blue; font-weight: bold', data || '');
  },
  success: (message: string, data?: any) => {
    console.log(`%c[SUCCESS] ${message}`, 'color: green; font-weight: bold', data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`%c[ERROR] ${message}`, 'color: red; font-weight: bold', error || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`%c[WARN] ${message}`, 'color: orange; font-weight: bold', data || '');
  }
};

// Definindo schema de validação com campos adicionais
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Nome da loja deve ter pelo menos 3 caracteres.",
  }),
  description: z.string().min(10, {
    message: "Descrição deve ter pelo menos 10 caracteres.",
  }),
  phone: z.string().min(10, {
    message: "Telefone inválido.",
  }),
  address: z.string().min(5, {
    message: "Endereço deve ter pelo menos 5 caracteres.",
  }),
  logo: z.instanceof(FileList).optional().refine(
    (files) => !files || files.length === 0 || Array.from(files).every(file => file.type.startsWith('image/')), 
    {
      message: "O logo deve ser uma imagem válida.",
    }
  ),
  cover: z.instanceof(FileList).optional().refine(
    (files) => !files || files.length === 0 || Array.from(files).every(file => file.type.startsWith('image/')), 
    {
      message: "A imagem de capa deve ser uma imagem válida.",
    }
  ),
})

interface CreateStoreFormProps {
  userId?: string;
}

export function CreateStoreForm({ userId: propUserId }: CreateStoreFormProps) {
  logger.info('Inicializando componente CreateStoreForm');
  
  const router = useRouter()
  const { toast } = useToast()
  const { supabase } = useSupabase() 
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(propUserId || null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [supabaseDiagnostics, setSupabaseDiagnostics] = useState<any>(null);
  const [debugMode, setDebugMode] = useState(process.env.NODE_ENV === 'development');

  useEffect(() => {
    const runDiagnostics = async () => {
      if (!supabase) {
        logger.error('Cliente Supabase não disponível');
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Não foi possível conectar ao banco de dados.",
        });
        return;
      }
      
      logger.success('Cliente Supabase inicializado com sucesso');
      
      if (debugMode) {
        logger.info('Iniciando diagnóstico do Supabase');
        try {
          const diagnostics = await checkSupabaseConnection(supabase);
          setSupabaseDiagnostics(diagnostics);
        } catch (error) {
          logger.error('Erro ao executar diagnóstico', error);
        }
      }
    };
    
    runDiagnostics();
  }, [supabase, toast, debugMode]);

  useEffect(() => {
    if (propUserId) {
      setUserId(propUserId);
      return;
    }
    
    logger.info('Tentando obter dados do usuário');
    
    const fetchUserData = async () => {
      try {
        const { user, error } = getCurrentUser();
        
        logger.info('Resultado da função getCurrentUser', { user, error });
        
        if (error) {
          logger.error('Erro ao obter usuário', error);
          throw new Error(error);
        }
        
        if (user && user.id) {
          logger.success('Usuário autenticado', { userId: user.id });
          setUserId(user.id);
        } else {
          logger.warn('Usuário não está autenticado');
          toast({
            variant: "destructive",
            title: "Não autorizado",
            description: "Você precisa estar logado para criar uma loja.",
          });
          router.push("/login");
        }
      } catch (error) {
        logger.error('Exceção ao obter dados do usuário', error);
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Ocorreu um erro ao verificar sua autenticação.",
        });
      }
    };

    fetchUserData();
  }, [router, toast, propUserId]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      phone: "",
      address: "",
    },
  })

  // Função para fazer upload de imagem para o bucket do Supabase
  const uploadImage = async (file: File, path: string) => {
    logger.info(`Iniciando upload de imagem para ${path}`, { fileName: file.name, fileSize: file.size });
    
    if (!file) {
      logger.warn('Tentativa de upload sem arquivo');
      return null;
    }
    
    try {
      const imageUrl = await cloudinaryUpload(file, path);
      logger.success('Upload concluído com sucesso', { imageUrl });
      return imageUrl;
    } catch (error) {
      logger.error('Exceção durante o processo de upload', error);
      throw error;
    }
  };


  // Atualizar pré-visualizações quando os arquivos mudarem
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, previewSetter: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0];
    logger.info('Arquivo selecionado para preview', { fileName: file?.name, fileType: file?.type });
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        logger.info('Preview gerado com sucesso');
        previewSetter(reader.result as string);
      };
      reader.onerror = () => {
        logger.error('Erro ao gerar preview do arquivo');
      };
      reader.readAsDataURL(file);
    } else {
      logger.info('Nenhum arquivo selecionado, removendo preview');
      previewSetter(null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    logger.info('Iniciando processo de submissão do formulário', { formValues: { ...values, logo: values.logo ? 'File provided' : 'No file', cover: values.cover ? 'File provided' : 'No file' } });
    
    if (!userId) {
      logger.error('Tentativa de criar loja sem usuário autenticado');
      toast({
        variant: "destructive",
        title: "Erro ao criar loja",
        description: "Você precisa estar logado para criar uma loja.",
      });
      return;
    }

    if (!supabase) {
      logger.error('Cliente Supabase não disponível durante submissão');
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível conectar ao banco de dados.",
      });
      return;
    }

    setIsLoading(true);
    logger.info('Estado de carregamento ativado');

    try {
      // Fazer upload de imagens, se fornecidas
      logger.info('Iniciando processo de upload de imagens');
      
      let logoUrl = null;
      let coverUrl = null;

      if (values.logo && values.logo.length > 0) {
        logger.info('Logo detectado, iniciando upload');
        logoUrl = await uploadImage(values.logo[0], 'logos');
        logger.success('Logo enviado com sucesso', { logoUrl });
      } else {
        logger.info('Nenhum logo fornecido');
      }

      if (values.cover && values.cover.length > 0) {
        logger.info('Imagem de capa detectada, iniciando upload');
        coverUrl = await uploadImage(values.cover[0], 'covers');
        logger.success('Imagem de capa enviada com sucesso', { coverUrl });
      } else {
        logger.info('Nenhuma imagem de capa fornecida');
      }

      // Montar objeto de dados da loja
      const storeData = {
        user_id: userId,
        name: values.name,
        description: values.description,
        phone: values.phone,
        address: values.address,
        logo_url: logoUrl,
        cover_url: coverUrl,
        status: "active",
      };
      
      logger.info('Dados da loja preparados para inserção', storeData);
      
      // Criar loja no Supabase
      logger.info('Iniciando inserção no banco de dados');
      
      const { data, error } = await supabase
        .from("stores")
        .insert(storeData)
        .select();

      if (error) {
        logger.error('Erro ao inserir no banco de dados', error);
        throw error;
      }

      logger.success('Loja criada com sucesso', { storeData: data });

      toast({
        title: "Loja criada com sucesso!",
        description: "Agora você pode começar a adicionar produtos.",
      });

      // Redirecionar para o dashboard
      logger.info('Redirecionando para a página de dashboard');
      router.refresh();
      router.push("/dashboard/store");
    } catch (error: any) {
      logger.error('Exceção durante o processo de criação da loja', error);
      
      toast({
        variant: "destructive",
        title: "Erro ao criar loja",
        description: error.message || "Ocorreu um erro ao criar sua loja. Tente novamente.",
      });
    } finally {
      logger.info('Finalizando processo, desativando estado de carregamento');
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      {/* Botão de debug (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDebugMode(!debugMode)}
            className="flex items-center gap-2"
          >
            <Bug className="h-4 w-4" />
            {debugMode ? "Esconder Debug" : "Mostrar Debug"}
          </Button>
        </div>
      )}
      
      {/* Painel de Debug carregado dinamicamente */}
      {debugMode && <DynamicDebugPanel />}
      
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Store className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-fredoka text-2xl font-bold">Crie sua loja</h1>
        <p className="mt-2 text-muted-foreground">Preencha os dados abaixo para configurar sua loja no PedeAí</p>
        
        {/* Indicador de status de conexão (apenas em debug) */}
        {debugMode && supabaseDiagnostics && (
          <div className={`mt-2 text-xs font-mono ${supabaseDiagnostics.connected ? 'text-green-500' : 'text-red-500'}`}>
            Status da conexão: {supabaseDiagnostics.connected ? 'CONECTADO' : 'COM PROBLEMAS'}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Loja</FormLabel>
                  <FormControl>
                    <Input placeholder="Restaurante do João" {...field} />
                  </FormControl>
                  <FormDescription>Este é o nome que seus clientes verão.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva sua loja em poucas palavras..." {...field} />
                  </FormControl>
                  <FormDescription>Uma breve descrição do seu negócio.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua Exemplo, 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Upload de Logo */}
            <FormField
              control={form.control}
              name="logo"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Logo da Loja</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex w-full items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            onChange(e.target.files);
                            handleFileChange(e, setLogoPreview);
                          }}
                          {...rest}
                        />
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                      {logoPreview && (
                        <div className="mt-2 overflow-hidden rounded-md border">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="h-40 w-40 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>Uma imagem para representar sua loja.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload de Capa */}
            <FormField
              control={form.control}
              name="cover"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Imagem de Capa</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex w-full items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            onChange(e.target.files);
                            handleFileChange(e, setCoverPreview);
                          }}
                          {...rest}
                        />
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                      {coverPreview && (
                        <div className="mt-2 overflow-hidden rounded-md border">
                          <img
                            src={coverPreview}
                            alt="Cover preview"
                            className="h-40 w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>Uma imagem de capa para sua loja (banner).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Loja"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}