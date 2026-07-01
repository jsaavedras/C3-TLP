import prisma from '../../utils/prisma'
 
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.perfilNombre !== 'administrador') throw createError({ statusCode: 403 })
 
  const id = Number(getRouterParam(event, 'id'))
  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
  }
 
  const vehiculo = await prisma.vehiculos.findUnique({ where: { id } })
  if (!vehiculo) {
    throw createError({ statusCode: 404, statusMessage: 'Vehículo no encontrado' })
  }
 
  if (vehiculo.estado === 'arrendado') {
    throw createError({
      statusCode: 409,
      statusMessage: 'No se puede eliminar un vehículo arrendado. Registre la devolución primero.'
    })
  }
 
  await prisma.vehiculos.update({
    where: { id },
    data: { 
      activo: false,
      estado: 'de_baja'
    }
  })
  
  return { ok: true, mensaje: 'Vehículo dado de baja exitosamente' }
})
 
