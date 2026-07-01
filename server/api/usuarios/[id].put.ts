import bcrypt from 'bcryptjs'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  if (session.user.perfilNombre !== 'administrador') {
    throw createError({
      statusCode: 403,
      statusMessage: 'No autorizado: Solo administradores pueden editar usuarios'
    })
  }

  const id = Number(getRouterParam(event, 'id'))
  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID de usuario inválido' })
  }

  const body = await readBody(event)

  if (session.user.id === id && body.perfil_id && Number(body.perfil_id) !== 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Operación denegada: No puedes cambiar tu propio rol de administrador a ejecutivo'
    })
  }

  const dataToUpdate: any = {
    rut: body.rut,
    nombres: body.nombres,
    apellidos: body.apellidos,
    email: body.email?.toLowerCase(),
    perfil_id: body.perfil_id ? Number(body.perfil_id) : undefined,
    activo: typeof body.activo === 'boolean' ? body.activo : undefined
  }

  if (body.password && body.password.trim() !== '') {
    const salt = await bcrypt.genSalt(10)
    dataToUpdate.password_hash = await bcrypt.hash(body.password, salt)
  }

  try {
    const usuarioActualizado = await prisma.usuarios.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        rut: true,
        nombres: true,
        apellidos: true,
        email: true,
        perfil_id: true
      }
    })

    return {
      ok: true,
      mensaje: 'Usuario actualizado con éxito',
      usuario: usuarioActualizado
    }
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError({ statusCode: 400, statusMessage: 'El RUT o el Email ya se encuentran registrados' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Error interno del servidor al actualizar' })
  }
})
