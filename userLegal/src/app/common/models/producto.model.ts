import { DocumentReference } from '@angular/fire/firestore';

export interface Producto {
  id: string;
nombre: string;
  categoria: DocumentReference;
  descripcion: string;
  imagen: string;
}
