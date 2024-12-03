import { Productoferta } from './../../../common/models/productofree.model';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OverlayEventDetail } from '@ionic/core/components';
import { FirestoreService } from '../../../common/services/firestore.service';
// import { Productoferta } from 'src/app/common/models/productofree.model';
import { FormsModule, FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Marca } from 'src/app/common/models/marca.model';
import { Categoria } from 'src/app/common/models/categoria.model';
import {  DocumentData } from '@angular/fire/compat/firestore';
import { DocumentReference } from '@angular/fire/firestore';
import {
  IonItem,
  IonIcon,
  IonButton,
  IonLabel,
  IonInput,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonFooter,
  IonCardTitle,
  IonList,
  IonCardContent,
IonModal,
  IonToolbar,
  IonTitle,
  IonHeader, IonBackButton, IonButtons, IonSpinner, IonSelectOption, IonSelect, IonSearchbar, IonAvatar } from '@ionic/angular/standalone';


@Component({
   standalone: true,
  imports: [ CommonModule, FormsModule, ReactiveFormsModule,IonAvatar, IonSearchbar, IonSpinner, IonButtons, IonBackButton,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonIcon,
    IonInput,
    IonLabel,
    IonContent,
    IonGrid,
    IonFooter,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonModal,
    IonCardTitle,
    IonList,
    IonCardContent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonSelectOption,
    IonSelect,
    IonSearchbar,
    IonButton],
  selector: 'app-oferta-product',
  templateUrl: './oferta-product.component.html',
  styleUrls: ['./oferta-product.component.scss'],
})
export class OfertaProductComponent  implements OnInit {
  productos: Productoferta[] = [];
  categorias: Categoria[] = [];
  marcas: Marca[] = [];
  productoOfertaForm: FormGroup;
  isModalOpen: boolean = false;
  editMode: boolean = false;
  productoAEditar: Productoferta | null = null;
  imagenProducto: File | null = null;
  selectedFile: File | null = null;
  searchTerm: string = '';




    @ViewChild(IonModal) modal!: IonModal;


constructor(
    private firestoreService: FirestoreService,
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.productoOfertaForm = this.fb.group({
      id: [''],
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],

      categoria: [null, Validators.required],

      imagen: ['']
    });




  }

   async ngOnInit() {
    this.cargarProductos();

    this.cargarCategorias();
  }



paginatedProductos: Productoferta[] = [];
currentPage: number = 1;
  pageSize: number = 6;

// getProductosPaginados(): Producto[] {
//     const startIndex = (this.currentPage - 1) * this.pageSize;
//     return this.productos.slice(startIndex, startIndex + this.pageSize);
//   }

getProductosPaginados(): Productoferta[] {
    const filteredProductos = this.productos.filter(producto =>
      (producto.nombre && producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()))

    );
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return filteredProductos.slice(startIndex, startIndex + this.pageSize);
  }


  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginatedProductos = this.getProductosPaginados();
    }
  }

  goToNextPage() {
    const totalPages = Math.ceil(this.productos.length / this.pageSize);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.paginatedProductos = this.getProductosPaginados();
    }
  }


  async cargarProductos() {
    this.productos = await this.firestoreService.getProductofertas();
    this.paginatedProductos = this.getProductosPaginados();
    console.log('Productos obtenidos:', this.productos);
    this.changeDetectorRef.detectChanges();
  }

  async cargarMarcas() {
    this.marcas = await this.firestoreService.getMarcas();
  }

  async cargarCategorias() {
    this.categorias = await this.firestoreService.getCategorias();
  }

  getCategoriaNombre(categoriaRef: DocumentReference<DocumentData>): string {
    if (categoriaRef) {
      const categoria = this.categorias.find(cat => cat.id === categoriaRef.id);
      return categoria ? categoria.nombre : 'Sin categoría';
    }
    return 'Sin categoría';
  }

  getMarcaNombre(marcaRef: DocumentReference<DocumentData>): string {
    if (marcaRef) {
      const marca = this.marcas.find(mar => mar.id === marcaRef.id);
      return marca ? marca.nombre : 'Sin marca';
    }
    return 'Sin marca';
  }

  onFileSelected(event: any) {
    this.imagenProducto = event.target.files[0];
  }

  openModal() {
    this.isModalOpen = true;
    this.editMode = false;
    this.productoOfertaForm.reset();
  }

  closeModal() {
    this.isModalOpen = false;
    this.productoAEditar = null;
    this.imagenProducto = null;
  }


  isLoading: boolean = false; // Indicador de carga


async agregarProducto() {
    if (this.productoOfertaForm.invalid) {
      window.alert('Por favor, completa todos los campos requeridos.');
      return;
    }

    this.isLoading = true; // Mostrar el spinner

    const productoData = this.productoOfertaForm.value;
    console.log('Descripción del producto:', this.productoOfertaForm.get('descripcion')!.value);


    try {
      await this.firestoreService.addProductoferta(productoData, this.imagenProducto);
      window.alert('Disco de corte guardado con éxito.');
    } catch (error) {
      console.error('Error al guardar el disco de corte:', error);
      window.alert('Error al guardar el disco de corte. Por favor, inténtalo de nuevo.');
    } finally {
      this.isLoading = false; // Ocultar el spinner
      this.closeModal();
      this.cargarProductos();
    }
  }

  async actualizarProducto() {
    if (this.productoOfertaForm.invalid) {
      window.alert('Por favor, completa todos los campos requeridos.');
      return;
    }

    this.isLoading = true; // Mostrar el spinner

    const productoData = this.productoOfertaForm.value;
    console.log('Descripción del producto:', this.productoOfertaForm.get('descripcion')!.value);
    productoData.precioFinal = this.productoOfertaForm.get('precioFinal')!.value;

    try {
      await this.firestoreService.updateProductoferta(productoData, this.imagenProducto);
      window.alert('Disco de corte actualizado con éxito.');
    } catch (error) {

      window.alert('Error al actualizar el Disco de corte. Por favor, inténtalo de nuevo.');
    } finally {
      this.isLoading = false; // Ocultar el spinner
      this.closeModal();
      this.cargarProductos();
    }
  }

  async eliminarProducto(producto: Productoferta) {
    if (!producto) {
      console.error('El Disco de corte es null o undefined.');
      return;
    }

    console.log('Producto a eliminar:', producto);

    if (!producto.id) {
      console.error('El id del producto es null o undefined.');
      return;
    }

    const confirmDelete = window.confirm(`¿Estás seguro de que quieres eliminar el Disco de corte "${producto.nombre}"? Esta acción no se puede deshacer.`);

    if (confirmDelete) {
      this.isLoading = true; // Mostrar el spinner

      try {
        await this.firestoreService.deleteProductoferta(producto.id);
        this.productos = this.productos.filter(p => p.id !== producto.id);
        console.log(`Disco de corte eliminado: ${producto.id}`);
        window.alert('El Disco de corte se ha eliminado con éxito.');
        this.cargarProductos();
      } catch (error) {
        console.error('Error eliminando el producto:', error);
        window.alert('Error al eliminar el Disco de corte. Por favor, inténtalo de nuevo.');
      } finally {
        this.isLoading = false; // Ocultar el spinner
        this.changeDetectorRef.detectChanges();
      }
    }
  }




  cancelarEdicion() {
    this.productoAEditar = null;
    this.editMode = false;
    this.closeModal();
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.agregarProducto();
    }
  }



filtrarProductos(event: any) {
  const value = event.target.value;
  if (value) {
    this.searchTerm = value.toLowerCase();
  } else {
    this.searchTerm = '';
  }
  this.currentPage = 1;  // Reset the current page to 1 after filtering
  this.paginatedProductos = this.getProductosPaginados();
}


async editarProducto(producto: Productoferta) {
  this.productoAEditar = producto;
  this.editMode = true;
  this.isModalOpen = true;

  this.productoOfertaForm.patchValue({
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
   
    categoria: producto.categoria,

    imagen: producto.imagen
  });
}





}
