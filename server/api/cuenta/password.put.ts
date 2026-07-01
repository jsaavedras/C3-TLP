import bcrypt from 'bcryptjs'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)

  const passwordActual = String(body.passwordActual || '')
  const passwordNueva = String(body.passwordNueva || '')
  const passwordNuevaConfirmacion = String(body.passwordNuevaConfirmacion || '')

  if (!passwordActual || !passwordNueva || !passwordNuevaConfirmacion) {
    throw createError({ statusCode: 400, statusMessage: 'Todos los campos de contraseña son obligatorios' })
  }

  if (passwordNueva.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'La nueva contraseña debe tener al menos 6 caracteres' })
  }

  if (passwordNueva !== passwordNuevaConfirmacion) {
    throw createError({ statusCode: 400, statusMessage: 'La confirmación de la nueva contraseña no coincide' })
  }

  const usuario = await prisma.usuarios.findUnique({ where: { id: session.user.id } })
  if (!usuario || !usuario.activo) {
    throw createError({ statusCode: 401, statusMessage: 'Sesión inválida' })
  }

  const passwordValida = await bcrypt.compare(passwordActual, usuario.password_hash)
  if (!passwordValida) {
    throw createError({ statusCode: 400, statusMessage: 'La contraseña actual es incorrecta' })
  }

  const salt = await bcrypt.genSalt(10)
  const nuevoHash = await bcrypt.hash(passwordNueva, salt)

  await prisma.usuarios.update({
    where: { id: usuario.id },
    data: { password_hash: nuevoHash }
  })

  return { ok: true, mensaje: 'Contraseña actualizada correctamente' }
})
