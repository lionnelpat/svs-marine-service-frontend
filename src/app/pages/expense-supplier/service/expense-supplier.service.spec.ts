import { TestBed } from '@angular/core/testing';

import { ExpenseSupplierService } from './expense-supplier.service';

describe('ExpenseSupplierService', () => {
  let service: ExpenseSupplierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseSupplierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
