import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseSupplierListComponent } from './expense-supplier-list.component';

describe('ExpenseSupplierListComponent', () => {
  let component: ExpenseSupplierListComponent;
  let fixture: ComponentFixture<ExpenseSupplierListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseSupplierListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseSupplierListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
