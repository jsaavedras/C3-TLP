import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  
  const tipos = await prisma.tipos_vehiculo.findMany({
    where: { activo: true },
    orderBy: { id: 'desc' }
  })
  return tipos
})
