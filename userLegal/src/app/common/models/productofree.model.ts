import { DocumentReference } from '@angular/fire/firestore';

export interface Productoferta {
  id: string;
  nombre: string;
  categoria: DocumentReference;
  descripcion: string;
  imagen: string;
}
