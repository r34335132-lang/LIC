"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
// CORRECCIÓN 1: Importamos 'cursos' y no 'mockCourses'
import { cursos, getProfesorByCurso } from "@/lib/data" 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Video, 
  File, 
  Upload, 
  Search, 
  FolderOpen,
  Download,
  Eye,
  Trash2,
  BookOpen,
  Sparkles,
  Layers
} from "lucide-react"

const contentTypes = [
  { type: "documento", icon: FileText, label: "Documentos", count: 24 },
  { type: "video", icon: Video, label: "Videos", count: 12 },
  { type: "archivo", icon: File, label: "Otros Archivos", count: 8 },
]

// Mantenemos tu contenido de prueba para los archivos
const mockContent = [
  { id: 1, name: "Guía de Estudio - Unidad 1", type: "documento", course: "Introducción al Derecho", size: "2.4 MB", date: "2025-01-15" },
  { id: 2, name: "Video: Introducción a Límites", type: "video", course: "Psicología General", size: "156 MB", date: "2025-01-14" },
  { id: 3, name: "Ejercicios Resueltos", type: "documento", course: "Pedagogía Contemporánea", size: "1.8 MB", date: "2025-01-13" },
  { id: 4, name: "Presentación - Tema 3", type: "archivo", course: "Inglés Básico", size: "5.2 MB", date: "2025-01-12" },
]

export default function ContenidoPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")

  const filteredContent = mockContent.filter(content => {
    const matchesSearch = content.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.course.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || content.type === selectedType
    return matchesSearch && matchesType
  })

  const getIcon = (type: string) => {
    switch (type) {
      case "documento": return FileText
      case "video": return Video
      default: return File
    }
  }

  // CORRECCIÓN 2: Evaluamos user.rol (en español), no user.role
  const canUpload = user?.rol === "maestro" || user?.rol === "admin"

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black border border-border/50 p-8 shadow-sm">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 opacity-10 pointer-events-none">
          <FolderOpen className="w-64 h-64 text-brand-primary" />
        </div>
        
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Biblioteca Virtual</span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground md:text-4xl tracking-tight">
              Contenido Educativo
            </h1>
            <p className="text-muted-foreground text-base max-w-xl">
              {user?.rol === "alumno" 
                ? "Accede y descarga todos los materiales de estudio de tus clases."
                : "Sube, organiza y gestiona el material didáctico para tus estudiantes."}
            </p>
          </div>
          
          {canUpload && (
            <Button className="shrink-0 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20 h-12 px-6 transition-all hover:scale-105">
              <Upload className="mr-2 h-5 w-5" />
              Subir Material
            </Button>
          )}
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid gap-6 md:grid-cols-3">
        {contentTypes.map((item) => {
          const Icon = item.icon
          const isSelected = selectedType === item.type

          return (
            <Card 
              key={item.type} 
              className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-white/60 dark:bg-black/40 backdrop-blur-md border-border/40 ${
                isSelected ? 'ring-2 ring-brand-primary shadow-lg shadow-brand-primary/10' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedType(item.type)}
            >
              <CardContent className="flex items-center gap-5 p-6">
                <div className={`rounded-2xl p-4 transition-colors ${isSelected ? 'bg-brand-primary text-white' : 'bg-brand-primary/10 text-brand-primary'}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-3xl font-black text-foreground">{item.count}</p>
                  <p className="text-sm font-semibold text-muted-foreground">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Buscador y Tabla de Contenido */}
      <Card className="border-border/40 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-xl overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-border/50 bg-gray-50/50 dark:bg-gray-900/50 pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Layers className="h-6 w-6 text-brand-primary" />
              Archivos Recientes
            </CardTitle>
            <div className="relative w-full max-w-sm group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
              <Input 
                placeholder="Buscar por nombre o curso..." 
                className="pl-11 h-11 rounded-full bg-white dark:bg-black border-border/50 focus:border-brand-primary focus:ring-brand-primary/20 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" value={selectedType} onValueChange={setSelectedType} className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg font-medium">Todos</TabsTrigger>
                <TabsTrigger value="documento" className="rounded-lg font-medium">Documentos</TabsTrigger>
                <TabsTrigger value="video" className="rounded-lg font-medium">Videos</TabsTrigger>
                <TabsTrigger value="archivo" className="rounded-lg font-medium">Otros</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value={selectedType} className="mt-0">
              <div className="divide-y divide-border/50">
                {filteredContent.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <File className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-semibold text-foreground">No se encontró contenido</p>
                    <p className="text-sm text-muted-foreground">Prueba buscando con otras palabras.</p>
                  </div>
                ) : (
                  filteredContent.map((content) => {
                    const Icon = getIcon(content.type)
                    return (
                      <div key={content.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 hover:bg-muted/30 transition-colors gap-4">
                        <div className="flex items-center gap-4">
                          <div className="rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-highlight/10 p-3 shadow-sm border border-brand-primary/10">
                            <Icon className="h-6 w-6 text-brand-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-base mb-1">{content.name}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                              <Badge variant="secondary" className="bg-brand-primary/5 text-brand-primary border-0 hover:bg-brand-primary/10 transition-colors">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {content.course}
                              </Badge>
                              <span>•</span>
                              <span>{content.size}</span>
                              <span>•</span>
                              <span>{content.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="hidden sm:flex border-border/50 bg-background font-semibold">
                            {content.type === "documento" ? "PDF" : content.type === "video" ? "MP4" : "ZIP"}
                          </Badge>
                          <Button variant="ghost" size="icon" className="hover:text-brand-primary hover:bg-brand-primary/10 rounded-full h-9 w-9">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:text-brand-highlight hover:bg-brand-highlight/10 rounded-full h-9 w-9">
                            <Download className="h-4 w-4" />
                          </Button>
                          {canUpload && (
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-full h-9 w-9">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tarjetas de Cursos (CORRECCIÓN 3: Aquí estaba el error de mockCourses) */}
      <div className="pt-4">
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-brand-primary" />
          Directorios por Curso
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* AQUÍ ESTÁ LA CORRECCIÓN CLAVE: Usamos 'cursos' de tu base de datos */}
          {cursos.slice(0, 6).map((curso) => {
            const profe = getProfesorByCurso(curso.id)
            
            return (
              <Card key={curso.id} className="group cursor-pointer border-border/40 bg-white/60 dark:bg-black/40 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl hover:border-brand-primary/30 transition-all overflow-hidden rounded-2xl">
                <div className="h-1.5 w-full bg-gradient-to-r from-brand-primary to-brand-highlight opacity-50 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg leading-tight group-hover:text-brand-primary transition-colors">
                        {curso.nombre}
                      </h3>
                      {/* Aquí usamos el nombre del profesor que sacamos de la base de datos */}
                      <p className="text-sm text-muted-foreground mt-1">
                        {profe?.nombre || 'Sin profesor asignado'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Etiqueta del ID del programa */}
                  <Badge variant="secondary" className="mb-4 bg-muted text-muted-foreground">
                    {curso.programaId}
                  </Badge>

                  <div className="flex items-center gap-4 text-sm font-semibold text-foreground/80 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-brand-primary" />
                      <span>8 Docs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Video className="h-4 w-4 text-brand-highlight" />
                      <span>4 Videos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}