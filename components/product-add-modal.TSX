"use client"
import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, X } from "lucide-react"
import { uploadImage } from "@/lib/cloudinary-helper"

interface ProductAddModalProps {
  isOpen: boolean
  onClose: () => void
  onProductAdded: () => void
  storeId: string
}

export default function ProductAddModal({ isOpen, onClose, onProductAdded, storeId }: ProductAddModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "",
    stock: "0",
    is_available: true
  })

  const [formErrors, setFormErrors] = useState({
    name: false,
    price: false
  })

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category: "",
      stock: "0",
      is_available: true
    })
    setPreviewImage(null)
    setSelectedFile(null)
    setFormErrors({
      name: false,
      price: false
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpar erro ao editar campo
    if (name === 'name' || name === 'price') {
      setFormErrors(prev => ({ ...prev, [name]: false }))
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_available: checked }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setSelectedFile(file)
      
      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedFile(null)
    setPreviewImage(null)
    setFormData(prev => ({ ...prev, image_url: "" }))
    
    // Resetar o campo de input file
    const fileInput = document.getElementById('add-product-image') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const validateForm = (): boolean => {
    const errors = {
      name: !formData.name.trim(),
      price: !formData.price.trim() || isNaN(parseFloat(formData.price))
    }
    
    setFormErrors(errors)
    return !Object.values(errors).some(error => error)
  }

  const handleCloseModal = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSaving(true)
    
    try {
      let imageUrl = formData.image_url
      
      // Fazer upload da imagem se existir
      if (selectedFile) {
        setIsUploading(true)
        try {
          imageUrl = await uploadImage(selectedFile, `stores/${storeId}/products`)
          console.log('[ADD_PRODUCT] Imagem enviada com sucesso:', imageUrl)
        } catch (error) {
          console.error('[ADD_PRODUCT] Erro ao enviar imagem:', error)
          alert('Erro ao fazer upload da imagem. Tente novamente.')
          setIsUploading(false)
          setIsSaving(false)
          return
        } finally {
          setIsUploading(false)
        }
      }
      
      // Preparar dados para salvar
      const productData = {
        store_id: storeId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: imageUrl,
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        is_available: formData.is_available
      }
      
      // Salvar no banco de dados
      const supabase = createClientComponentClient()
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
      
      if (error) {
        console.error('[ADD_PRODUCT] Erro ao salvar produto:', error)
        alert('Erro ao salvar produto. Tente novamente.')
        return
      }
      
      console.log('[ADD_PRODUCT] Produto salvo com sucesso:', data)
      
      // Resetar formulário
      resetForm()
      
      // Notificar a página principal sobre a adição
      onProductAdded()
      
      // Fechar o modal
      onClose()
      
    } catch (error) {
      console.error('[ADD_PRODUCT] Erro ao processar formulário:', error)
      alert('Ocorreu um erro ao processar o formulário. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Produto</DialogTitle>
          <DialogDescription>
            Preencha as informações do novo produto. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="add-name" className={formErrors.name ? "text-destructive" : ""}>
                Nome do produto <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="add-name"
                name="name"
                placeholder="Digite o nome do produto"
                value={formData.name}
                onChange={handleChange}
                className={formErrors.name ? "border-destructive" : ""}
              />
              {formErrors.name && (
                <p className="text-xs text-destructive">Nome do produto é obrigatório</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-price" className={formErrors.price ? "text-destructive" : ""}>
                Preço <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="add-price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.price}
                onChange={handleChange}
                className={formErrors.price ? "border-destructive" : ""}
              />
              {formErrors.price && (
                <p className="text-xs text-destructive">Preço válido é obrigatório</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-category">Categoria</Label>
              <Select 
                value={formData.category} 
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="add-category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alimentos">Alimentos</SelectItem>
                  <SelectItem value="bebidas">Bebidas</SelectItem>
                  <SelectItem value="roupas">Roupas</SelectItem>
                  <SelectItem value="acessorios">Acessórios</SelectItem>
                  <SelectItem value="eletrônicos">Eletrônicos</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="add-stock">Estoque</Label>
              <Input 
                id="add-stock"
                name="stock"
                type="number"
                min="0"
                placeholder="Quantidade em estoque"
                value={formData.stock}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="add-description">Descrição</Label>
              <Textarea 
                id="add-description"
                name="description"
                placeholder="Descreva seu produto"
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="add-product-image">Imagem do produto</Label>
              
              {previewImage ? (
                <div className="relative w-full h-60 rounded-md overflow-hidden border">
                  <div className="absolute top-2 right-2 z-10 flex gap-2">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center border border-dashed rounded-md h-40 cursor-pointer" onClick={() => document.getElementById('add-product-image')?.click()}>
                  <div className="flex flex-col items-center text-muted-foreground p-4">
                    <Upload className="h-8 w-8 mb-2" />
                    <p className="text-sm font-medium">Clique para fazer upload</p>
                    <p className="text-xs">SVG, PNG, JPG ou GIF (max. 5MB)</p>
                  </div>
                  <input 
                    id="add-product-image" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="add-is_available" 
                checked={formData.is_available}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="add-is_available">Produto disponível para venda</Label>
            </div>
          </div>
          
          <DialogFooter className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseModal}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving || isUploading}
            >
              {(isSaving || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? 'Enviando imagem...' : isSaving ? 'Salvando...' : 'Salvar Produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}