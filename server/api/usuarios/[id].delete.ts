import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.perfilNombre !== 'administrador') {
    throw createError({
      statusCode: 403,
      statusMessage: 'No autorizado: Solo administradores pueden desactivar usuarios'
    })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
  }

  if (session.user.id === id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Operación denegada: Administrador no puede desactivar su propia cuenta'
    })
  }

  try {
    await prisma.usuarios.update({
      where: { id },
      data: { activo: false }
    })

    return {
      ok: true,
      mensaje: 'Usuario desactivado exitosamente del sistema'
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno del servidor al intentar desactivar el usuario'
    })
  }
})
