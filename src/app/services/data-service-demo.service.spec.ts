import { TestBed } from '@angular/core/testing';

import { DataServiceDemoService } from './data-service-demo.service';

describe('DataServiceDemoService', () => {
  let service: DataServiceDemoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataServiceDemoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
