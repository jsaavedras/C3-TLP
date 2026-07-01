import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.perfilNombre !== 'administrador') throw createError({ statusCode: 403, statusMessage: 'No autorizado' })

  const id = Number(getRouterParam(event, 'id'))
  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
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
    return await prisma.tipos_vehiculo.update({
      where: { id },
      data: {
        nombre,
        descripcion: body.descripcion || '',
        valor_diario: valorDiario
      }
    })
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'Ya existe un tipo de vehículo con ese nombre' })
    }
    if (error.code === 'P2025') {
      throw createError({ statusCode: 404, statusMessage: 'Tipo de vehículo no encontrado' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Error interno al actualizar el tipo de vehículo' })
  }
})
