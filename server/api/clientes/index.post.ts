import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  if (session.user.perfilNombre !== 'administrador' && session.user.perfilNombre !== 'ejecutivo') {
    throw createError({ 
      statusCode: 403, 
      statusMessage: 'No autorizado: Solo administradores y ejecutivos pueden crear clientes' 
    })
  }

  const body = await readBody(event)

  if (
    !body.rut || 
    !body.nombres || 
    !body.apellidos || 
    !body.email || 
    !body.telefono || 
    !body.direccion || 
    !body.licencia_conducir
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Todos los campos del cliente son obligatorios' })
  }

  try {
    const nuevoCliente = await prisma.clientes.create({
      data: {
        rut: body.rut,
        nombres: body.nombres,
        apellidos: body.apellidos,
        email: body.email.toLowerCase(),
        telefono: body.telefono,
        direccion: body.direccion,
        licencia_conducir: body.licencia_conducir,
        activo: true
      }
    })
    
    setResponseStatus(event, 201)
    return { ok: true, mensaje: 'Cliente creado exitosamente', cliente: nuevoCliente }

  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError({ statusCode: 400, statusMessage: 'El RUT o el Email ya están registrados en el sistema' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Error interno del servidor al crear cliente' })
  }
})
