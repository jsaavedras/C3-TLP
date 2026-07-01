import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  if (session.user.perfilNombre !== 'administrador') {
    throw createError({ statusCode: 403, statusMessage: 'No autorizado: Solo administradores' })
  }

  const body = await readBody(event)
  const nombre = String(body.nombre || '').trim()
  const valorDiario = Number(body.valor_diario)

  if (!nombre) {
    throw createError({ statusCode: 400, statusMessage: 'El nombre del tipo es obligatorio' })
  }
  if (!valorDiario || valorDiario <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'El valor diario debe ser mayor a cero' })
  }

  try {
    const nuevo = await prisma.tipos_vehiculo.create({
      data: {
        nombre,
        descripcion: body.descripcion || '',
        valor_diario: valorDiario,
        activo: true
      }
    })

    setResponseStatus(event, 201)
    return nuevo
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'Ya existe un tipo de vehículo con ese nombre' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Error interno al crear el tipo de vehículo' })
  }
})
