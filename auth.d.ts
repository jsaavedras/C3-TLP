declare module '#auth-utils' {
  interface User {
    id: number
    rut: string
    nombres: string
    apellidos: string
    email: string
    perfilId: number
    perfilNombre: string
  }
}

export {}
