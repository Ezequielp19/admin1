import { Productoferta } from './common/models/productofree.model';
import { Routes,RouterModule } from '@angular/router';

import { HomeComponent } from './views/home/home.component';
import { ProductosPage } from '../app/views/marcas/proucto/producto/producto.component';
import { GestionEtiquetasPage } from '../app/views/marcas/etiquetas/etiquetas.component';
import { CategoriasPage } from '../app/views/marcas/categoria/categoria/categoria.component';
import { MarcasPage } from '../app/views/marcas/marcas.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
   {
    path: 'marcas',
    loadComponent: () => import('../app/views/marcas/marcas.component').then((m) => m.MarcasPage),
  },
   {
    path: 'usuarios',
    loadComponent: () => import('../app/views/marcas/usuarios/usuarios.component').then((m) => m.UsuariosPage),
  },

     {
    path: 'categoria',
    loadComponent: () => import('../app/views/marcas/categoria/categoria/categoria.component').then((m) => m.CategoriasPage),
  },

    {
    path: 'productos',
    loadComponent: () => import('../app/views/marcas/proucto/producto/producto.component').then((m) => m.ProductosPage),
  },
    {
    path: 'productosOferta',
    loadComponent: () => import('../app/views/marcas/oferta-product/oferta-product.component').then((m) => m.OfertaProductComponent),
  },


    {
    path: 'etiquetas',
    loadComponent: () => import('../app/views/marcas/etiquetas/etiquetas.component').then((m) => m.GestionEtiquetasPage),
  },

];
