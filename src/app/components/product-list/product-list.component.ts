import { Component, OnInit } from '@angular/core';
import { Product } from '../../common/product';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchComponent } from '../search/search.component';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule],
  templateUrl: './product-list-grid.component.html',
  //  templateUrl: './product-list-table.component.html',
  // templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit{

  products: Product[] = [];

  // not category id available ... default to category id 1
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  searchMode: boolean = false;

  // new properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;

  previousKeyword: string = "";


  constructor(private productService: ProductService, private cd: ChangeDetectorRef, private route: ActivatedRoute) { }

ngOnInit(): void {

  this.route.paramMap.subscribe(() => {
    this.listProducts();
  });
}
listProducts() {

  this.searchMode = this.route.snapshot.paramMap.has('keyword');

  if(this.searchMode) {
    this.handleSearchProducts();
  }
  else {
    this.handleListProducts();

  }
}

handleSearchProducts(){

  const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

  // if we have a different keyword than previous
  // then set thePageNumber to 1

  if (this.previousKeyword != theKeyword) {
    this.thePageNumber = 1;
  }

  this.previousKeyword = theKeyword;

  console.log(`keyword=${theKeyword}, thePageNumber=${this.thePageNumber}`);

  // now search for the products using keyword
  this.productService.searchProductsPaginate(this.thePageNumber - 1,
                                            this.thePageSize,
                                            theKeyword).subscribe(this.processResult());
}

  handleListProducts() {

  const id = this.route.snapshot.paramMap.get('id');

  if (id !== null) {

    this.currentCategoryId = +id;
  }

  //
  // Check if we have a different category than previous
  // Note: Angular will reuse a component if it is currently being viewed
  //

  // if we have a different category id than previous
  // then set thePAgeNumber back to 1
  if ( this.previousCategoryId != this.currentCategoryId) {
    this.thePageNumber = 1;
  }

  this.previousCategoryId = this.currentCategoryId;

  console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);


  this.productService.getProductListPaginate(this.thePageNumber - 1,
                                            this.thePageSize,
                                            this.currentCategoryId)
                                            .subscribe(this.processResult());
  }

  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize
    this.thePageNumber = 1;
    this.listProducts();
  }

  processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    }
  }
}


