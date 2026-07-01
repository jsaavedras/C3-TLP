import { writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  
  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No se recibió ningún archivo' })
  }

  const uploadedFile = formData.find(f => f.name === 'file')
  if (!uploadedFile || !uploadedFile.filename) {
    throw createError({ statusCode: 400, statusMessage: 'Archivo inválido' })
  }

  const nombreUnico = `${Date.now()}-${uploadedFile.filename.replace(/\s+/g, '-')}`
  
  const rutaDestino = join(process.cwd(), 'public', 'uploads', nombreUnico)

  await mkdir(dirname(rutaDestino), { recursive: true })
  await writeFile(rutaDestino, uploadedFile.data)

  return { 
    ok: true, 
    url: `/uploads/${nombreUnico}` 
  }
})
