import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
  }

  const cliente = await prisma.clientes.findUnique({
    where: { id },
    include: {
      arriendos: {
        include: {
          vehiculos: { include: { tipos_vehiculo: true } }
        },
        orderBy: { fecha_inicio: 'desc' }
      }
    }
  })

  if (!cliente || !cliente.activo) {
    throw createError({ statusCode: 404, statusMessage: 'Cliente no encontrado' })
  }

  return cliente
})
