import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const arriendo = await prisma.arriendos.findUnique({
    where: { id },
    include: {
      clientes: true,
      vehiculos: true,
      usuarios: { select: { nombres: true, apellidos: true, email: true } }
    }
  })

  if (!arriendo) {
    throw createError({ statusCode: 404, statusMessage: 'Arriendo no encontrado' })
  }

  return arriendo
})
