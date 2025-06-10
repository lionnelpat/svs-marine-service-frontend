import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseSupplierComponent } from './expense-supplier.component';

describe('ExpenseSupplierComponent', () => {
  let component: ExpenseSupplierComponent;
  let fixture: ComponentFixture<ExpenseSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseSupplierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
