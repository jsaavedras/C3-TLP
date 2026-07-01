import prisma from '../../../utils/prisma'

const ESTADOS_FINALES_PERMITIDOS = ['disponible', 'en_mantenimiento']

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
  }

  if (!body.fotos_recepcion) {
    throw createError({ statusCode: 400, statusMessage: 'La fotografía de recepción es obligatoria' })
  }

  const estado_vehiculo_final = body.estado_vehiculo_final || 'disponible'
  if (!ESTADOS_FINALES_PERMITIDOS.includes(estado_vehiculo_final)) {
    throw createError({ statusCode: 400, statusMessage: 'Estado final de vehículo inválido. Use disponible o en_mantenimiento' })
  }

  const arriendo = await prisma.arriendos.findUnique({ where: { id } })
  if (!arriendo) {
    throw createError({ statusCode: 404, statusMessage: 'Arriendo no encontrado' })
  }
  if (arriendo.estado !== 'vigente') {
    throw createError({ statusCode: 409, statusMessage: 'El arriendo ya fue finalizado anteriormente' })
  }

  const fotos_recepcion = typeof body.fotos_recepcion === 'object'
    ? JSON.stringify(body.fotos_recepcion)
    : String(body.fotos_recepcion)

  const resultado = await prisma.$transaction(async (tx) => {
    const devuelto = await tx.arriendos.update({
      where: { id },
      data: {
        estado: 'finalizado',
        fecha_hora_recepcion: new Date(),
        fotos_recepcion
      }
    })

    await tx.vehiculos.update({
      where: { id: arriendo.vehiculo_id },
      data: { estado: estado_vehiculo_final }
    })

    return devuelto
  })

  return resultado
})
