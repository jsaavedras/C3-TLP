import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  
  const arriendos = await prisma.arriendos.findMany({
    include: {
      clientes: true,
      vehiculos: {
        include: { tipos_vehiculo: true }
      }
    },
    orderBy: { id: 'desc' }
  })
  
  return arriendos
})
