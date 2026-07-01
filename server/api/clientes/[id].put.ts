import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  if (session.user.perfilNombre !== 'administrador' && session.user.perfilNombre !== 'ejecutivo') {
    throw createError({ 
      statusCode: 403, 
      statusMessage: 'No autorizado: Solo administradores y ejecutivos pueden editar clientes' 
    })
  }

  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  try {
    const actualizado = await prisma.clientes.update({
      where: { id },
      data: {
        rut: body.rut,
        nombres: body.nombres,
        apellidos: body.apellidos,
        email: body.email.toLowerCase(),
        telefono: body.telefono,
        direccion: body.direccion,
        licencia_conducir: body.licencia_conducir
      }
    })
    
    return { ok: true, mensaje: 'Cliente actualizado', cliente: actualizado }
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'Error interno al actualizar cliente' })
  }
})
