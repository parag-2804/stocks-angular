import { Component, OnInit, Input,Injectable, ViewChild, TemplateRef } from '@angular/core';
import {NgbModal, ModalDismissReasons, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import { NgbModalConfig,NgbModalRef } from '@ng-bootstrap/ng-bootstrap'; 


@Component({
  selector: 'app-modal-news',
  templateUrl: './modal-news-component.html'
})

export class ModalNewsComponent implements OnInit {
  @Input() public modalConfig: any;
  @ViewChild('modal') private content: TemplateRef<ModalNewsComponent> | undefined;
  private modalRef: NgbModalRef | undefined;
  public closeResult: string = '';
  

  constructor(private modalService: NgbModal) { }

  open(content : any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ngOnInit(): void {
  }
}


