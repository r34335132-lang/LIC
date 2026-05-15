"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { mockCourses } from "@/lib/data"
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
  Plus,
  BookOpen
} from "lucide-react"

const contentTypes = [
  { type: "documento", icon: FileText, label: "Documentos", count: 24 },
  { type: "video", icon: Video, label: "Videos", count: 12 },
  { type: "archivo", icon: File, label: "Otros Archivos", count: 8 },
]

const mockContent = [
  { id: 1, name: "Guía de Estudio - Unidad 1", type: "documento", course: "Cálculo Diferencial", size: "2.4 MB", date: "2025-01-15" },
  { id: 2, name: "Video: Introducción a Límites", type: "video", course: "Cálculo Diferencial", size: "156 MB", date: "2025-01-14" },
  { id: 3, name: "Ejercicios Resueltos", type: "documento", course: "Física I", size: "1.8 MB", date: "2025-01-13" },
  { id: 4, name: "Presentación - Tema 3", type: "archivo", course: "Programación I", size: "5.2 MB", date: "2025-01-12" },
  { id: 5, name: "Manual de Laboratorio", type: "documento", course: "Química General", size: "3.1 MB", date: "2025-01-11" },
  { id: 6, name: "Video: Práctica de Laboratorio", type: "video", course: "Química General", size: "245 MB", date: "2025-01-10" },
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

  const canUpload = user?.role === "maestro" || user?.role === "admin"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contenido Educativo</h1>
          <p className="text-muted-foreground">
            {user?.role === "alumno" 
              ? "Accede a los materiales de tus cursos"
              : "Gestiona el contenido de tus cursos"}
          </p>
        </div>
        {canUpload && (
          <Button className="bg-primary hover:bg-primary/90">
            <Upload className="mr-2 h-4 w-4" />
            Subir Contenido
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {contentTypes.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.type} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedType(item.type)}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{item.count}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Biblioteca de Contenido
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Buscar contenido..." 
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setSelectedType}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="documento">Documentos</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="archivo">Otros</TabsTrigger>
            </TabsList>
            <TabsContent value={selectedType} className="mt-4">
              <div className="space-y-3">
                {filteredContent.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontró contenido
                  </div>
                ) : (
                  filteredContent.map((content) => {
                    const Icon = getIcon(content.type)
                    return (
                      <div key={content.id} 
                           className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{content.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <BookOpen className="h-3 w-3" />
                              <span>{content.course}</span>
                              <span>•</span>
                              <span>{content.size}</span>
                              <span>•</span>
                              <span>{content.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {content.type === "documento" ? "PDF" : 
                             content.type === "video" ? "MP4" : "ZIP"}
                          </Badge>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                          {canUpload && (
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
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

      {/* Courses with Content */}
      <Card>
        <CardHeader>
          <CardTitle>Contenido por Curso</CardTitle>
          <CardDescription>Accede al material organizado por asignatura</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockCourses.slice(0, 6).map((course) => (
              <Card key={course.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{course.name}</h3>
                      <p className="text-sm text-muted-foreground">{course.teacher}</p>
                    </div>
                    <Badge variant="outline">{course.code}</Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>8 docs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      <span>4 videos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
