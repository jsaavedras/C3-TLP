import prisma from '../../utils/prisma'
 
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
 
  if (session.user.perfilNombre !== 'administrador' && session.user.perfilNombre !== 'ejecutivo') {
    throw createError({ 
      statusCode: 403, 
      statusMessage: 'No autorizado: Solo administradores y ejecutivos pueden dar de baja clientes' 
    })
  }
 
  const id = Number(getRouterParam(event, 'id'))
 
  const cliente = await prisma.clientes.findUnique({
    where: { id },
    include: {
      arriendos: {
        where: { NOT: { estado: 'finalizado' } },
        select: { id: true }
      }
    }
  })
 
  if (!cliente) {
    throw createError({ statusCode: 404, statusMessage: 'Cliente no encontrado' })
  }
 
  if (cliente.arriendos.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'No se puede eliminar un cliente con arriendos no finalizados.'
    })
  }
 
  try {
    await prisma.clientes.update({
      where: { id },
      data: { activo: false }
    })
    
    return { ok: true, mensaje: 'Cliente dado de baja exitosamente' }
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'Error interno al dar de baja' })
  }
})
