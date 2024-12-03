import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OverlayEventDetail } from '@ionic/core/components';
import { FirestoreService } from '../../../../common/services/firestore.service';
import { Producto } from '../../../../common/models/producto.model';
import { FormsModule, FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Marca } from '../../../../common/models/marca.model';
import { Categoria } from '../../../../common/models/categoria.model';
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
  selector: 'app-productos',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
})
export class ProductosPage implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  marcas: Marca[] = [];
  productoForm: FormGroup;
  isModalOpen: boolean = false;
  editMode: boolean = false;
  productoAEditar: Producto | null = null;
  imagenProducto: File | null = null;
  selectedFile: File | null = null;
  searchTerm: string = '';

  isLoading: boolean = false; // Indicador de carga




    @ViewChild(IonModal) modal!: IonModal;


 constructor(
    private firestoreService: FirestoreService,
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.productoForm = this.fb.group({
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


paginatedProductos: Producto[] = [];
currentPage: number = 1;
  pageSize: number = 6;

// getProductosPaginados(): Producto[] {
//     const startIndex = (this.currentPage - 1) * this.pageSize;
//     return this.productos.slice(startIndex, startIndex + this.pageSize);
//   }

getProductosPaginados(): Producto[] {
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



async agregarProducto() {
    if (this.productoForm.invalid) {
      window.alert('Por favor, completa todos los campos requeridos.');
      return;
    }

    this.isLoading = true; // Mostrar el spinner

    const productoData = this.productoForm.value;
    console.log('Descripción del producto:', this.productoForm.get('descripcion')!.value);


    try {
      await this.firestoreService.addProducto(productoData, this.imagenProducto);
      window.alert('Producto guardado con éxito.');
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      window.alert('Error al guardar el producto. Por favor, inténtalo de nuevo.');
    } finally {
      this.isLoading = false; // Ocultar el spinner
      this.closeModal();
      this.cargarProductos();
    }
  }


  async cargarProductos() {
    this.productos = await this.firestoreService.getProductos();
    this.paginatedProductos = this.getProductosPaginados();
    console.log('Productos obtenidos:', this.productos);
    this.changeDetectorRef.detectChanges();
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


  onFileSelected(event: any) {
    this.imagenProducto = event.target.files[0];
  }

  openModal() {
    this.isModalOpen = true;
    this.editMode = false;
    this.productoForm.reset();
  }

  closeModal() {
    this.isModalOpen = false;
    this.productoAEditar = null;
    this.imagenProducto = null;
  }

async agregarOEditarProducto() {
    if (this.productoForm.invalid) {
      return;
    }

    this.isLoading = true;

    const productoData = this.productoForm.value;
    console.log('Descripción del producto:', this.productoForm.get('descripcion')!.value);
    

    try {
      if (this.editMode && this.productoAEditar) {
        productoData.id = this.productoAEditar.id;
        await this.firestoreService.updateProducto(productoData, this.imagenProducto);
      } else {
        await this.firestoreService.addProducto(productoData, this.imagenProducto);
      }
      window.alert('Producto guardado con éxito.');
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      window.alert('Error al guardar el producto. Por favor, inténtalo de nuevo.');
    } finally {
      this.isLoading = false; // Ocultar el spinner
      this.closeModal();
      this.cargarProductos();
    }
  }

  async eliminarProducto(producto: Producto) {
    if (!producto) {
      console.error('El producto es null o undefined.');
      return;
    }

    console.log('Producto a eliminar:', producto);

    if (!producto.id) {
      console.error('El id del producto es null o undefined.');
      return;
    }

    const confirmacion = window.confirm(`¿Estás seguro de que quieres eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`);

    if (confirmacion) {
      this.isLoading = true; // Mostrar el spinner

      try {
        await this.firestoreService.deleteProducto(producto);
        this.productos = this.productos.filter(p => p.id !== producto.id);
        console.log(`Producto eliminado: ${producto.id}`);
        window.alert('El producto se ha eliminado con éxito.');
        this.cargarProductos();
      } catch (error) {
        console.error('Error eliminando el producto:', error);
        window.alert('Error al eliminar el producto. Por favor, inténtalo de nuevo.');
      } finally {
        this.isLoading = false; // Ocultar el spinner
        this.changeDetectorRef.detectChanges();
      }
    }
  }



  editarProducto(producto: Producto) {
    this.productoAEditar = producto;
    this.editMode = true;
    this.productoForm.patchValue(producto);
    this.isModalOpen = true;
  }

  cancelarEdicion() {
    this.productoAEditar = null;
    this.editMode = false;
    this.closeModal();
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.agregarOEditarProducto();
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



}

