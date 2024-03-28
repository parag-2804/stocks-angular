import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent Tests', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeAll(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ensures component instantiation', () => {
    expect(component).toBeDefined();
  });
});
