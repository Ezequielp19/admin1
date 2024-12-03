export interface UserI {
  id: string;
  nombre: string;
  apellido: string;
   email: string;
  password: string;
    approved?: boolean; // Agregar esta línea

}
