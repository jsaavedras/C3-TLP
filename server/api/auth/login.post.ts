import bcrypt from 'bcryptjs'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email y contraseña son obligatorios' })
  }

  const usuario = await prisma.usuarios.findUnique({
    where: { email },
    include: { perfiles: true }
  })

  if (!usuario || !usuario.activo) {
    throw createError({ statusCode: 401, statusMessage: 'Credenciales inválidas' })
  }

  const passwordValida = await bcrypt.compare(password, usuario.password_hash)
  if (!passwordValida) {
    throw createError({ statusCode: 401, statusMessage: 'Credenciales inválidas' })
  }

  const user = {
    id: usuario.id,
    rut: usuario.rut,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    email: usuario.email,
    perfilId: usuario.perfil_id,
    perfilNombre: usuario.perfiles.nombre
  }

  await setUserSession(event, { user })
  return { ok: true, user }
})
