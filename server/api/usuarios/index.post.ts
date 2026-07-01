import bcrypt from 'bcryptjs'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.perfilNombre !== 'administrador') {
    throw createError({ statusCode: 403, statusMessage: 'No autorizado' })
  }

  const body = await readBody(event)

  if (!body.rut || !body.nombres || !body.apellidos || !body.email || !body.password || !body.perfil_id) {
    throw createError({ statusCode: 400, statusMessage: 'Todos los campos son obligatorios' })
  }

  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(body.password, salt)

  try {
    const nuevoUsuario = await prisma.usuarios.create({
      data: {
        rut: body.rut,
        nombres: body.nombres,
        apellidos: body.apellidos,
        email: body.email.toLowerCase(),
        password_hash: passwordHash, 
        perfil_id: Number(body.perfil_id),
        activo: true
      }
    })

    setResponseStatus(event, 201)
    
    return {
      ok: true,
      mensaje: 'Usuario creado exitosamente',
      usuarioId: nuevoUsuario.id
    }
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError({ statusCode: 400, statusMessage: 'El RUT o el Email ya están registrados' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Error interno del servidor al crear usuario' })
  }
})
