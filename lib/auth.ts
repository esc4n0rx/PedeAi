import bcrypt from 'bcryptjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import crypto from 'crypto';

// Secret key para assinatura do token (idealmente estaria em variáveis de ambiente)
const TOKEN_SECRET = process.env.NEXT_PUBLIC_TOKEN_SECRET || 'seu-segredo-super-secreto';

// Função para criar hash de senha
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Função para verificar senha
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Gerar token manualmente (similar ao JWT)
function generateToken(payload: any) {
  // Adicionar tempo de expiração (30 dias a partir de agora)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  const data = {
    ...payload,
    exp: expiresAt.getTime(),
    iat: Date.now()
  };
  
  // Converter para string
  const payloadStr = JSON.stringify(data);
  
  // Codificar em base64
  const base64Payload = Buffer.from(payloadStr).toString('base64');
  
  // Criar assinatura
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(base64Payload)
    .digest('base64');
  
  // Retornar token no formato: payload.signature (semelhante ao JWT)
  return `${base64Payload}.${signature}`;
}

// Verificar token
export function verifyToken(token: string) {
  try {
    // Separar payload e assinatura
    const [base64Payload, signature] = token.split('.');
    
    // Verificar assinatura
    const expectedSignature = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(base64Payload)
      .digest('base64');
    
    if (signature !== expectedSignature) {
      return null; // Assinatura inválida
    }
    
    // Decodificar payload
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    
    // Verificar expiração
    if (payload.exp < Date.now()) {
      return null; // Token expirado
    }
    
    return payload;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
}

// Resto do código permanece igual

// Função para registrar usuário
export async function registerUser(userData: {
  email: string
  password: string
  full_name: string
  cpf_cnpj: string
  phone: string
  address: string
}) {
  const supabase = createClientComponentClient()
  
  try {
    console.log('Criando hash para a senha do usuário:', userData.email)
    const hashedPassword = await hashPassword(userData.password)
    
    console.log('Inserindo usuário na tabela de users')
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        password: hashedPassword,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()
    
    if (userError) {
      console.error('Erro ao inserir usuário na tabela de users:', userError)
      throw userError
    }
    // Avatar URL padrão
    const defaultAvatarUrl = "https://ui-avatars.com/api/?name=" + encodeURIComponent(userData.full_name)
    console.log('Inserindo perfil do usuário na tabela de profiles')
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: userData.email,
        full_name: userData.full_name,
        cpf_cnpj: userData.cpf_cnpj,
        phone: userData.phone,
        address: userData.address,
        created_at: new Date().toISOString(),
        plan: 'free',
        avatar_url: defaultAvatarUrl
      })
    
    if (profileError) {
      console.error('Erro ao inserir perfil na tabela de profiles:', profileError)
      throw profileError
    }
    return { user, error: null }
  } catch (error) {
    console.error('Erro ao registrar usuário:', error)
    return { user: null, error }
  }
}

// Função para fazer login
export async function loginUser(email: string, password: string) {
  const supabase = createClientComponentClient()
  
  try {
    // Buscar usuário pelo email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password')
      .eq('email', email)
      .single()
    
    if (userError) throw userError
    
    // Verificar senha
    const isPasswordValid = await verifyPassword(password, user.password)
    
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas')
    }
    
    // Buscar perfil do usuário
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
    
    if (profileError) throw profileError
    
    // Verificar se o perfil existe e obter o primeiro elemento
    const profile = profileData && profileData.length > 0 ? profileData[0] : null
    
    if (!profile) {
      throw new Error('Perfil de usuário não encontrado')
    }
    
    // Dados do usuário para incluir no token
    const userData = {
      id: user.id,
      email: user.email,
      full_name: profile.full_name,
      role: 'user'
    }
    
    // Gerar token personalizado
    const token = generateToken(userData)
    
    // Salvar token no localStorage e cookie
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token)
      
      // Salvar também em cookie para o middleware
      document.cookie = `authToken=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Strict`;
    }
    
    return { token, user: userData, error: null }
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    return { token: null, user: null, error }
  }
}

// Função para fazer logout
export async function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken')
    
    // Remover também o cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
  return { error: null }
}

// Função para obter usuário atual
export function getCurrentUser() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken')
    
    if (!token) return { user: null, error: null }
    
    // Verificar token
    const userData = verifyToken(token)
    
    if (!userData) {
      // Token inválido, remover do localStorage
      localStorage.removeItem('authToken')
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      return { user: null, error: 'Token inválido ou expirado' }
    }
    
    return { user: userData, error: null }
  }
  
  return { user: null, error: null }
}

// Função para verificar autenticação do lado do cliente
export function isAuthenticated() {
  const { user } = getCurrentUser()
  return !!user
}