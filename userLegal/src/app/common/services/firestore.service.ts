
import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  setDoc,
  collectionData,
  startAfter, limit, DocumentData
} from '@angular/fire/firestore';
import { Marca } from '../models/marca.model';
import { Categoria } from '../models/categoria.model';
import { Producto } from '../models/producto.model';
import { UserI } from '../models/users.models';
import { Productoferta } from '../models/productofree.model';

import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';


@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore, private storage: Storage) {}

  // Marcas
  async getMarcas(): Promise<Marca[]> {
    const marcasSnapshot = await getDocs(
      query(collection(this.firestore, 'marcas'), orderBy('nombre'))
    );
    const marcas = marcasSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Marca[];
    console.log('Marcas obtenidas:', marcas);
    return marcas;
  }

  // Añadir una nueva marca
  async addMarca(marca: Marca, imagen: File): Promise<Marca> {
    try {
      if (imagen) {
        const storageRef = ref(this.storage, `marcas/${imagen.name}`);
        const uploadTask = uploadBytesResumable(storageRef, imagen);
        await uploadTask;
        marca.imagen = await getDownloadURL(storageRef);
      }
      const id = uuidv4(); // Generar un id único
      const docRef = doc(this.firestore, `marcas/${id}`);
      await setDoc(docRef, { ...marca, id }); // Guardar la marca con el id generado
      console.log(`Marca añadida con id: ${id}`);
      return { ...marca, id };
    } catch (error) {
      console.error('Error añadiendo la marca:', error);
      throw error;
    }
  }

  // Actualizar una marca existente
  async updateMarca(marca: Marca, imagen?: File): Promise<void> {
    try {
      if (!marca.id) {
        throw new Error('La marca debe tener un id para ser actualizada.');
      }

      if (imagen) {
        // Eliminar la imagen anterior si existe
        if (marca.imagen) {
          const storageRef = ref(this.storage, marca.imagen);
          await deleteObject(storageRef);
        }

        // Subir la nueva imagen
        const newStorageRef = ref(this.storage, `marcas/${imagen.name}`);
        const uploadTask = uploadBytesResumable(newStorageRef, imagen);
        await uploadTask;
        marca.imagen = await getDownloadURL(newStorageRef);
      }

      const marcaRef = doc(this.firestore, 'marcas', marca.id);
      await updateDoc(marcaRef, { ...marca });
    } catch (error) {
      console.error('Error actualizando la marca:', error);
    }
  }

  // Eliminar una marca
  async deleteMarca(marca: Marca): Promise<void> {
    try {
      if (!marca || !marca.id) {
        throw new Error('La marca o el id de la marca es null o undefined.');
      }

      console.log(`Intentando eliminar la marca con id: ${marca.id}`);

      // Verificar la existencia de la imagen y eliminarla si existe
      if (marca.imagen) {
        const storageRef = ref(this.storage, marca.imagen);
        await deleteObject(storageRef);
        console.log(`Imagen eliminada: ${marca.imagen}`);
      }

      // Eliminar el documento de la marca
      const marcaRef = doc(this.firestore, 'marcas', marca.id);
      await deleteDoc(marcaRef);
      console.log(`Documento eliminado: ${marca.id}`);
    } catch (error) {
      console.error('Error eliminando la marca:', error);
    }
  }
//Fin Marcas

  // Usuario

  //  Obtener todas las usuarios


    // Eliminar un usuario
  async deleteUser(user: UserI): Promise<void> {
  try {
    if (!user || !user.id) {
      throw new Error('El usuario o el ID de usuario es nulo o no está definido.');
    }
    const userRef = doc(this.firestore, 'usuarios', user.id);
    await deleteDoc(userRef);
    console.log(`Usuario eliminado: ${user.id}`);
  } catch (error) {
    console.error('Error eliminando el usuario:', error);
    throw error;
  }
  }


  // Categorías
   // Obtener todas las categorías
  async getCategorias(): Promise<Categoria[]> {
    const categoriasSnapshot = await getDocs(
      query(collection(this.firestore, 'categorias'), orderBy('nombre'))
    );
    return categoriasSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Categoria[];
  }

// Añadir una nueva categoría sin imagen
async addCategoria(categoria: Categoria): Promise<Categoria> {
  try {
    const id = uuidv4(); // Generar un id único
    const docRef = doc(this.firestore, `categorias/${id}`);
    await setDoc(docRef, { ...categoria, id });
    console.log(`Categoría añadida con id: ${id}`);
    return { ...categoria, id };
  } catch (error) {
    console.error('Error añadiendo la categoría:', error);
    throw error;
  }
}



  // Eliminar una categoría
  async deleteCategoria(categoria: Categoria): Promise<void> {
    try {
      if (!categoria || !categoria.id) {
        throw new Error('La categoría o el id de la categoría es null o undefined.');
      }

      console.log(`Intentando eliminar la categoría con id: ${categoria.id}`);

      const categoriaRef = doc(this.firestore, 'categorias', categoria.id);
      await deleteDoc(categoriaRef);
      console.log(`Categoría eliminada: ${categoria.id}`);
    } catch (error) {
      console.error('Error eliminando la categoría:', error);
    }
  }


  // Productos

  // Obtener todos los productos
  async getProductos(): Promise<Producto[]> {
    const productosSnapshot = await getDocs(
      query(collection(this.firestore, 'productos'), orderBy('nombre'))
    );
    return productosSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data['nombre'],
        descripcion: data['descripcion'],
        categoria: data['categoria'],
        imagen: data['imagen'] || null, // Manejar imagen opcional
      } as Producto;
    });
  }

  // Añadir un nuevo producto
  async addProducto(producto: Producto, imagen: File | null = null): Promise<Producto> {
    try {
      if (imagen) {
        const storageRef = ref(this.storage, `productos/${imagen.name}`);
        const uploadTask = uploadBytesResumable(storageRef, imagen);
        await uploadTask;
        producto.imagen = await getDownloadURL(storageRef);
      }
      const id = uuidv4(); // Generar un id único
      const docRef = doc(this.firestore, `productos/${id}`);
      await setDoc(docRef, { ...producto, id });
      console.log(`Producto añadido con id: ${id}`);
      return { ...producto, id };
    } catch (error) {
      console.error('Error añadiendo el producto:', error);
      throw error;
    }
  }

// OFERTA

   // Añadir un nuevo producto OFERTA
 async addProductoferta(productoferta: Productoferta, imagen: File | null = null): Promise<Productoferta> {
  try {
    if (imagen) {
      const storageRef = ref(this.storage, `productofertas/${imagen.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imagen);
      await uploadTask;
      productoferta.imagen = await getDownloadURL(storageRef);
    }
    const id = uuidv4(); // Generar un id único
    const docRef = doc(this.firestore, `productofertas/${id}`);
    await setDoc(docRef, { ...productoferta, id });
    console.log(`Producto en oferta añadido con id: ${id}`);
    return { ...productoferta, id };
  } catch (error) {
    console.error('Error añadiendo el producto en oferta:', error);
    throw error;
  }
}



 async getProductofertas(): Promise<Productoferta[]> {
  const ofertasSnapshot = await getDocs(
    query(collection(this.firestore, 'productofertas'), orderBy('nombre'))
  );
  return ofertasSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      nombre: data['nombre'],
      descripcion: data['descripcion'],

      imagen: data['imagen'] || null,
    } as Productoferta;
  });
}

async updateProductoferta(productoferta: Productoferta, imagen: File | null = null): Promise<Productoferta> {
  try {
    if (imagen) {
      const storageRef = ref(this.storage, `productofertas/${imagen.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imagen);
      await uploadTask;
      productoferta.imagen = await getDownloadURL(storageRef);
    }
    const docRef = doc(this.firestore, `productofertas/${productoferta.id}`);
    await setDoc(docRef, { ...productoferta });
    console.log(`Producto en oferta actualizado con id: ${productoferta.id}`);
    return productoferta;
  } catch (error) {
    console.error('Error actualizando el producto en oferta:', error);
    throw error;
  }
}

async deleteProductoferta(id: string): Promise<void> {
  try {
    const docRef = doc(this.firestore, `productofertas/${id}`);
    await deleteDoc(docRef);
    console.log(`Producto en oferta eliminado con id: ${id}`);
  } catch (error) {
    console.error('Error eliminando el producto en oferta:', error);
    throw error;
  }
}



// FIN OFERTA



async updateProducto(producto: Producto, imagen?: File): Promise<void> {
  try {
    if (!producto.id) {
      throw new Error('El producto debe tener un id para ser actualizado.');
    }

    if (imagen) {
      // Eliminar la imagen anterior si existe
      if (producto.imagen) {
        const storageRef = ref(this.storage, producto.imagen);
        await deleteObject(storageRef);
      }

      // Subir la nueva imagen
      const newStorageRef = ref(this.storage, `productos/${imagen.name}`);
      const uploadTask = uploadBytesResumable(newStorageRef, imagen);
      await uploadTask;
      producto.imagen = await getDownloadURL(newStorageRef);
    }

    // Filtrar las propiedades undefined o null antes de actualizar
    const productoToUpdate: any = Object.fromEntries(
      Object.entries(producto).filter(([_, v]) => v !== undefined && v !== null)
    );

    // Actualizar el documento con el objeto filtrado
    const productoRef = doc(this.firestore, 'productos', producto.id);
    await updateDoc(productoRef, productoToUpdate); // Utilizamos productoToUpdate aquí

    console.log(`Producto actualizado con éxito: ${producto.id}`);
  } catch (error) {
    console.error('Error actualizando el producto:', error);
    throw error;
  }
}









  // Eliminar un producto
  async deleteProducto(producto: Producto): Promise<void> {
    try {
      if (!producto || !producto.id) {
        throw new Error('El producto o el id del producto es null o undefined.');
      }

      console.log(`Intentando eliminar el producto con id: ${producto.id}`);

      if (producto.imagen) {
        const storageRef = ref(this.storage, producto.imagen);
        await deleteObject(storageRef);
        console.log(`Imagen eliminada: ${producto.imagen}`);
      }

      const productoRef = doc(this.firestore, 'productos', producto.id);
      await deleteDoc(productoRef);
      console.log(`Producto eliminado: ${producto.id}`);
    } catch (error) {
      console.error('Error eliminando el producto:', error);
    }
  }

async getEtiquetas(): Promise<string[]> {
    const productosRef = collection(this.firestore, 'productos');
    const snapshot = await getDocs(productosRef);
    const etiquetas = new Set<string>();
    snapshot.forEach(doc => {
      const data = doc.data() as Producto;

    });
    return Array.from(etiquetas);
  }

  async actualizarPreciosPorEtiqueta(etiqueta: string, porcentaje: number): Promise<void> {
  const productosRef = collection(this.firestore, 'productos');
  const q = query(productosRef, where('etiqueta', '==', etiqueta));
  const snapshot = await getDocs(q);
  const batch = writeBatch(this.firestore);

  snapshot.forEach(docSnap => {
    const data = docSnap.data() as Producto;

    const docRef = doc(this.firestore, 'productos', docSnap.id);

  });

  await batch.commit();
}







 async getMarcasEtiqueta(): Promise<Marca[]> {
    const marcasRef = collection(this.firestore, 'marcas');
    const snapshot = await getDocs(marcasRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Marca[];
  }


}




