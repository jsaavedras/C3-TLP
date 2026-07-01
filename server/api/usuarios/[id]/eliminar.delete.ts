import prisma from '../../../utils/prisma'

// Eliminación PERMANENTE de un usuario (distinto de desactivar en
// server/api/usuarios/[id].delete.ts, que solo marca activo = false).
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  if (session.user.perfilNombre !== 'administrador') {
    throw createError({
      statusCode: 403,
      statusMessage: 'No autorizado: Solo administradores pueden eliminar usuarios'
    })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
  }

  // Restricción PDF: "Un administrador no puede borrar su propia cuenta."
  if (session.user.id === id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Operación denegada: No puedes eliminar tu propia cuenta'
    })
  }

  const usuario = await prisma.usuarios.findUnique({ where: { id } })
  if (!usuario) {
    throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
  }

  try {
    await prisma.usuarios.delete({ where: { id } })

    return {
      ok: true,
      mensaje: 'Usuario eliminado permanentemente del sistema'
    }
  } catch (error: any) {
    // El usuario tiene arriendos asociados (FK ON DELETE RESTRICT en arriendos.usuario_id)
    if (error.code === 'P2003') {
      throw createError({
        statusCode: 409,
        statusMessage: 'No se puede eliminar: el usuario tiene arriendos registrados a su nombre. Puedes desactivarlo en su lugar.'
      })
    }
    if (error.code === 'P2025') {
      throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Error interno del servidor al eliminar el usuario' })
  }
})
