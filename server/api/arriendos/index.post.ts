import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)

  const cliente_id = Number(body.cliente_id)
  const vehiculo_id = Number(body.vehiculo_id)
  const fecha_inicio = body.fecha_inicio
  const fecha_termino = body.fecha_termino

  if (!cliente_id || !vehiculo_id || !fecha_inicio || !fecha_termino || !body.fotos_entrega) {
    throw createError({ statusCode: 400, statusMessage: 'Cliente, vehículo, fechas y fotografía de entrega son obligatorios' })
  }

  const f1 = new Date(fecha_inicio)
  const f2 = new Date(fecha_termino)
  if (Number.isNaN(f1.getTime()) || Number.isNaN(f2.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Las fechas ingresadas no son válidas' })
  }
  if (f2 < f1) {
    throw createError({ statusCode: 400, statusMessage: 'La fecha de término no puede ser anterior a la fecha de inicio' })
  }

  const cliente = await prisma.clientes.findUnique({ where: { id: cliente_id } })
  if (!cliente || !cliente.activo) {
    throw createError({ statusCode: 404, statusMessage: 'El cliente seleccionado no existe o está inactivo' })
  }

  const vehiculo = await prisma.vehiculos.findUnique({
    where: { id: vehiculo_id },
    include: { tipos_vehiculo: true }
  })

  if (!vehiculo || !vehiculo.activo) {
    throw createError({ statusCode: 404, statusMessage: 'El vehículo seleccionado no existe' })
  }

  if (vehiculo.estado !== 'disponible') {
    throw createError({ statusCode: 409, statusMessage: 'El vehículo no está disponible para arriendo' })
  }

  const dias_arriendo = Math.max(1, Math.ceil((f2.getTime() - f1.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  const valor_diario_aplicado = vehiculo.tipos_vehiculo.valor_diario
  const valor_total = valor_diario_aplicado * dias_arriendo

  const fotos_entrega = typeof body.fotos_entrega === 'object'
    ? JSON.stringify(body.fotos_entrega)
    : String(body.fotos_entrega)

  const fecha_hora_entrega = body.fecha_hora_entrega ? new Date(body.fecha_hora_entrega) : new Date()

  const resultado = await prisma.$transaction(async (tx) => {
    const arriendo = await tx.arriendos.create({
      data: {
        cliente_id,
        vehiculo_id,
        usuario_id: Number(session.user.id),
        fecha_inicio: f1,
        fecha_termino: f2,
        fecha_hora_entrega,
        valor_diario_aplicado,
        dias_arriendo,
        valor_total,
        estado: 'vigente',
        fotos_entrega
      }
    })

    await tx.vehiculos.update({
      where: { id: vehiculo_id },
      data: { estado: 'arrendado' }
    })

    return arriendo
  })

  setResponseStatus(event, 201)
  return resultado
})
