import prisma from '../../../utils/prisma'

const ESTADOS_PERMITIDOS_MANUAL = ['disponible', 'en_mantenimiento', 'de_baja']

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
  }

  if (!ESTADOS_PERMITIDOS_MANUAL.includes(body.estado)) {
    throw createError({ statusCode: 400, statusMessage: 'Estado de vehículo inválido' })
  }

  const vehiculo = await prisma.vehiculos.findUnique({ where: { id } })
  if (!vehiculo) {
    throw createError({ statusCode: 404, statusMessage: 'Vehículo no encontrado' })
  }

  if (vehiculo.estado === 'arrendado' && body.estado === 'de_baja') {
    throw createError({
      statusCode: 409,
      statusMessage: 'No se puede dar de baja un vehículo arrendado. Registre la devolución primero.'
    })
  }

  const actualizado = await prisma.vehiculos.update({
    where: { id },
    data: { estado: body.estado }
  })

  return actualizado
})
