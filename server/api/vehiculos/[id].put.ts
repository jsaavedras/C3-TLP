import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.perfilNombre !== 'administrador') {
    throw createError({ statusCode: 403, statusMessage: 'Solo administradores pueden editar vehículos' })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
  }

  const body = await readBody(event)
  const patente = String(body.patente || '').trim().toUpperCase()
  const tipo_id = Number(body.tipo_id)
  const anio = Number(body.anio)

  if (!patente || !body.marca || !body.modelo || !anio || !body.color || !tipo_id) {
    throw createError({ statusCode: 400, statusMessage: 'Todos los campos del vehículo son obligatorios' })
  }
  if (anio < 1990) {
    throw createError({ statusCode: 400, statusMessage: 'El año del vehículo debe ser 1990 o posterior' })
  }

  try {
    const actualizado = await prisma.vehiculos.update({
      where: { id },
      data: {
        patente,
        marca: body.marca,
        modelo: body.modelo,
        anio,
        color: body.color,
        tipo_id,
        ...(body.foto_url ? { foto_url: body.foto_url } : {})
      }
    })
    return actualizado
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'Ya existe un vehículo registrado con esa patente' })
    }
    if (error.code === 'P2025') {
      throw createError({ statusCode: 404, statusMessage: 'Vehículo no encontrado' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Error interno al actualizar el vehículo' })
  }
})
