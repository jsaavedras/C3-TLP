import prisma from '../../utils/prisma'

const ESTADOS_VALIDOS = ['disponible', 'arrendado', 'en_mantenimiento', 'de_baja']

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.perfilNombre !== 'administrador') {
    throw createError({ statusCode: 403, statusMessage: 'Solo administradores pueden crear vehículos' })
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
  if (!body.foto_url) {
    throw createError({ statusCode: 400, statusMessage: 'La fotografía del vehículo es obligatoria' })
  }

  const tipo = await prisma.tipos_vehiculo.findUnique({ where: { id: tipo_id } })
  if (!tipo || !tipo.activo) {
    throw createError({ statusCode: 404, statusMessage: 'El tipo de vehículo seleccionado no existe' })
  }

  try {
    const nuevo = await prisma.vehiculos.create({
      data: {
        patente,
        marca: body.marca,
        modelo: body.modelo,
        anio,
        color: body.color,
        tipo_id,
        estado: 'disponible',
        activo: true,
        foto_url: body.foto_url
      }
    })

    setResponseStatus(event, 201)
    return nuevo
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'Ya existe un vehículo registrado con esa patente' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Error interno al crear el vehículo' })
  }
})
