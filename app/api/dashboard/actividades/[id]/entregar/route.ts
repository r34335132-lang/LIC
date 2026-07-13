import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPerfilFromSession, canAccessAlumno } from '@/lib/auth-server'
import type { ActividadEntrega } from '@/types/database'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPerfilFromSession()
    if (!session || !canAccessAlumno(session.perfil.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: actividadId } = await params
    const formData = await request.formData()
    const texto_respuesta =
      typeof formData.get('texto_respuesta') === 'string'
        ? String(formData.get('texto_respuesta')).trim()
        : null
    const link_entrega =
      typeof formData.get('link_entrega') === 'string'
        ? String(formData.get('link_entrega')).trim()
        : null
    const archivo_url =
      typeof formData.get('archivo_url') === 'string'
        ? String(formData.get('archivo_url')).trim()
        : null
    const imagenes = formData
      .getAll('imagenes')
      .filter((value): value is File => value instanceof File && value.size > 0)
    let imagenesExistentes: string[] = []
    try {
      const parsed = JSON.parse(String(formData.get('imagenes_existentes') ?? '[]'))
      if (Array.isArray(parsed)) {
        imagenesExistentes = parsed.filter((value): value is string => typeof value === 'string')
      }
    } catch {
      return NextResponse.json({ error: 'La lista de imagenes no es valida' }, { status: 400 })
    }

    if (imagenes.length + imagenesExistentes.length > 6) {
      return NextResponse.json({ error: 'Puedes adjuntar hasta 6 imagenes' }, { status: 400 })
    }

    const tiposPermitidos = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
    for (const imagen of imagenes) {
      if (!tiposPermitidos.has(imagen.type)) {
        return NextResponse.json({ error: 'Solo se permiten imagenes JPG, PNG, WEBP o HEIC' }, { status: 400 })
      }
      if (imagen.size > 8 * 1024 * 1024) {
        return NextResponse.json({ error: 'Cada imagen debe pesar menos de 8 MB' }, { status: 400 })
      }
    }

    if (!texto_respuesta && !link_entrega && !archivo_url && !imagenes.length && !imagenesExistentes.length) {
      return NextResponse.json(
        { error: 'Debes incluir una respuesta, enlace, archivo o imagen de tu libreta' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: actividad, error: actError } = await admin
      .from('actividades')
      .select('id, materia_id, activo')
      .eq('id', actividadId)
      .maybeSingle()

    if (actError || !actividad) {
      return NextResponse.json({ error: 'Actividad no encontrada' }, { status: 404 })
    }

    if (!actividad.activo) {
      return NextResponse.json({ error: 'La actividad no está activa' }, { status: 400 })
    }

    const { data: inscripcionMateria } = await admin
      .from('alumno_materias')
      .select('id')
      .eq('alumno_id', session.userId)
      .eq('materia_id', actividad.materia_id)
      .maybeSingle()

    if (!inscripcionMateria) {
      return NextResponse.json(
        { error: 'Esta actividad no pertenece a tus materias' },
        { status: 403 }
      )
    }

    const { data: existente } = await admin
      .from('actividad_entregas')
      .select('*')
      .eq('actividad_id', actividadId)
      .eq('alumno_id', session.userId)
      .maybeSingle()

    if (existente?.estado === 'revisada') {
      return NextResponse.json(
        { error: 'Esta entrega ya fue revisada y no puede modificarse' },
        { status: 400 }
      )
    }

    const urlsGuardadas = Array.isArray(existente?.imagenes_urls)
      ? existente.imagenes_urls.filter((value): value is string => typeof value === 'string')
      : []
    imagenesExistentes = imagenesExistentes.filter((url) => urlsGuardadas.includes(url))

    if (!texto_respuesta && !link_entrega && !archivo_url && !imagenes.length && !imagenesExistentes.length) {
      return NextResponse.json(
        { error: 'Debes incluir una respuesta, enlace, archivo o imagen de tu libreta' },
        { status: 400 }
      )
    }

    const imagenesUrls = [...imagenesExistentes]
    for (const [index, imagen] of imagenes.entries()) {
      const extension = imagen.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
      const path = `${session.userId}/${actividadId}/${Date.now()}-${index}.${extension}`
      const { error: uploadError } = await admin.storage
        .from('entregas-imagenes')
        .upload(path, Buffer.from(await imagen.arrayBuffer()), {
          contentType: imagen.type,
          upsert: false,
        })

      if (uploadError) {
        return NextResponse.json({ error: `No se pudo subir ${imagen.name}: ${uploadError.message}` }, { status: 400 })
      }

      const { data } = admin.storage.from('entregas-imagenes').getPublicUrl(path)
      imagenesUrls.push(data.publicUrl)
    }

    const payload = {
      actividad_id: actividadId,
      alumno_id: session.userId,
      texto_respuesta,
      link_entrega,
      archivo_url,
      imagenes_urls: imagenesUrls,
      estado: 'entregada' as const,
      updated_at: new Date().toISOString(),
    }

    const { data: entrega, error: upsertError } = await admin
      .from('actividad_entregas')
      .upsert(payload, { onConflict: 'actividad_id,alumno_id' })
      .select()
      .single()

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 400 })
    }

    return NextResponse.json({ entrega: entrega as ActividadEntrega })
  } catch (error) {
    console.error('Entregar actividad error:', error)
    return NextResponse.json({ error: 'Error al entregar actividad' }, { status: 500 })
  }
}
