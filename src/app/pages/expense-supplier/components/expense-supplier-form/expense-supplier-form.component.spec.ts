import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseSupplierFormComponent } from './expense-supplier-form.component';

describe('ExpenseSupplierFormComponent', () => {
  let component: ExpenseSupplierFormComponent;
  let fixture: ComponentFixture<ExpenseSupplierFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseSupplierFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseSupplierFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
