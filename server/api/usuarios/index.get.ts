import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.perfilNombre !== 'administrador') {
    throw createError({
      statusCode: 403,
      statusMessage: 'No autorizado: Solo administradores pueden ver los usuarios'
    })
  }

  const usuarios = await prisma.usuarios.findMany({
    select: {
      id: true,
      rut: true,
      nombres: true,
      apellidos: true,
      email: true,
      activo: true,
      perfiles: {
        select: {
          nombre: true
        }
      }
    },
    orderBy: { id: 'desc' }
  })
  return usuarios
})
