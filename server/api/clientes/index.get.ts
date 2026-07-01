import prisma from '../../utils/prisma'
 
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  
  return await prisma.clientes.findMany({
    where: { activo: true },
    include: {
      arriendos: {
        where: { NOT: { estado: 'finalizado' } },
        select: { id: true }
      }
    },
    orderBy: { id: 'desc' }
  })
})
 
