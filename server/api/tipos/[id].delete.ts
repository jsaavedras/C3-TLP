import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.perfilNombre !== 'administrador') throw createError({ statusCode: 403 })

  const id = Number(getRouterParam(event, 'id'))

  await prisma.tipos_vehiculo.update({
    where: { id },
    data: { activo: false }
  })
  return { ok: true, mensaje: 'Tipo de vehículo desactivado' }
})
