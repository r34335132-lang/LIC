const MAX_ANCHO = 1920
const CALIDAD_JPEG = 0.82
const MAX_BYTES_SIN_COMPRIMIR = 900 * 1024

function extensionJpeg(nombre: string) {
  return nombre.replace(/\.[^.]+$/, '') + '.jpg'
}

export async function comprimirImagenEntrega(archivo: File): Promise<File> {
  if (archivo.size <= MAX_BYTES_SIN_COMPRIMIR && archivo.type === 'image/jpeg') {
    return archivo
  }

  try {
    const bitmap = await createImageBitmap(archivo)
    const escala = Math.min(1, MAX_ANCHO / Math.max(bitmap.width, 1))
    const width = Math.max(1, Math.round(bitmap.width * escala))
    const height = Math.max(1, Math.round(bitmap.height * escala))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return archivo
    }
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', CALIDAD_JPEG)
    })

    if (!blob || blob.size === 0) return archivo
    return new File([blob], extensionJpeg(archivo.name), { type: 'image/jpeg' })
  } catch {
    return archivo
  }
}

export async function comprimirImagenesEntrega(archivos: File[]) {
  return Promise.all(archivos.map(comprimirImagenEntrega))
}
