import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../shared/http.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  moneyInWallet: any;
  public closeResult: string = '';
  isBuyStock = false;
  stockPrice: any;
  companyDesc: any;
  tickerSymbol: string = '';
  portfolioStockDataMap = new Map();
  tickerVal = ''
  currentStockModal = '';
  currentStockModalData = '';
  stockPriceC: any;
  cName: any;
  public changeInPort = 0;

  private _buySuccess = new Subject<string>();
  private _sellSuccess = new Subject<string>();
  buyMessage = '';
  sellMessage = '';
  alertPortfolio = false;
  stockBuy: any = false;
  public closeModal: string = '';
  countItem: any = 0;
  enteredQuantity: number = 0;
  enteredQuantitySell: number = 0;
  totalPrice: string = "0.00";
  removePortfolio = false;
  stockLeft: any;
  portfolio_add: any;
  portfolio_remove: any;

  constructor(private modalService: NgbModal, private httpService: HttpService) { }

  ngOnInit(): void {

    // if (localStorage.getItem('moneyInWallet')) {
    //   let money: any = localStorage.getItem('moneyInWallet')
    //   this.moneyInWallet = parseFloat(money);
    // }
    
      localStorage.setItem('moneyInWallet', "25000.00");
      this.moneyInWallet = localStorage.getItem('moneyInWallet')
    

    // this.loadPortfolioStockData();

    this.loadPortfolioStockData();
    console.log('portfolioStockDataMap11>>' + JSON.stringify(this.portfolioStockDataMap));

    this.showAlerts();



  }

  showAlerts() {

    if (this.countItem === 0) {
      this.alertPortfolio = true;
    }

    this._buySuccess.subscribe(
      (message) => (this.buyMessage = message)
    );
    this._buySuccess
      .pipe(debounceTime(5000))
      .subscribe(() => (this.buyMessage = ''));

    this._sellSuccess.subscribe(
      (message) => (this.sellMessage = message)
    );
    this._sellSuccess
      .pipe(debounceTime(5000))
      .subscribe(() => (this.sellMessage = ''));
  }

  loadPortfolioStockData() {
    Object.keys(localStorage).forEach(data => {
      if (data.includes('-Portfolio')) {
        // this.companyDesc = [];
        this.stockPrice = [];
        this.countItem += 1;
        let item: any = localStorage.getItem(data);
        // let portData = item;
        let itemParsed = JSON.parse(item);
        console.log('itemmm> ', itemParsed.qty != null && itemParsed.amount != null);
        if (itemParsed.qty != null && itemParsed.amount != null) {
          console.log('ssssssss');
          console.log('JSON.parse(item).ticker>' + JSON.parse(item).ticker);
          this.httpService.getData('companyDesc', itemParsed.ticker).subscribe(res => {
            this.companyDesc = res;
            console.log('resMe> '+JSON.stringify(res));
            this.cName = this.companyDesc.name;
            console.log('resMe> '+this.companyDesc.name);

            console.log('this.companyDescMap>' + JSON.stringify(this.companyDesc));
            this.httpService.getData('stockPrice', JSON.parse(item).ticker).subscribe(res => {
              console.log('resYouu> '+this.companyDesc.name);
              let tickerVal = itemParsed.ticker;
              let quantity = itemParsed.qty;
              let amt = itemParsed.amount;
              this.stockPrice = res;
              this.stockPriceC = this.stockPrice.c;
              this.cName = this.companyDesc.name;
              this.changeInPort = Math.round(((this.stockPriceC - amt / quantity) + Number.EPSILON) * 100) / 100;
              console.log('this.companyDescMapMEE>' + this.cName);
              this.portfolioStockDataMap.set(tickerVal, {
                tickerVal: tickerVal,
                companyName: this.cName,
                currentPrice: this.stockPriceC,
                quantity: quantity,
                totalCost: amt,
                changeInPort: this.changeInPort

              });

              console.log('portfolioStockDataMapAA>>' + (JSON.stringify(this.portfolioStockDataMap.get(tickerVal))));
              
            });
          });

        }


      }
    });
  }


  openPortfolioBuy(portfolioModalBuy: any, stockDeal: any, val_port: any) {
    console.log('stockDeal> ' + stockDeal);
    console.log('val_port> ' + val_port);
    this.enteredQuantity = 0
    if (stockDeal === 'buy') {
      this.stockBuy = true;
    }
    else {
      this.stockBuy = false;
    }
    this.tickerSymbol = val_port;
    
    let money: any = localStorage.getItem('moneyInWallet')
    this.moneyInWallet = parseFloat(money);

    this.modalService.open(portfolioModalBuy, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeModal = `Closed with: ${result}`;
    }, (reason) => {
      this.closeModal = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  openPortfolioSell(portfolioModalSell: any, stockDeal: any, val_port: any) {
    this.enteredQuantitySell = 0
    if (stockDeal === 'buy') {
      this.stockBuy = true;
    }
    else {
      this.stockBuy = false;
    }
    
    this.tickerSymbol = val_port;
    let money: any = localStorage.getItem('moneyInWallet')
    this.moneyInWallet = parseFloat(money);
    let stockValJson: any = localStorage.getItem(this.tickerSymbol + "-Portfolio");
    let stockVal = JSON.parse(stockValJson);
    this.stockLeft = stockVal.qty;

    this.modalService.open(portfolioModalSell, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeModal = `Closed with: ${result}`;
    }, (reason) => {
      this.closeModal = `Dismissed ${this.getDismissReason(reason)}`;
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




  buyStock(tickerSymbol: any) {
    
    this._buySuccess.next('Message successfully changed.');
    this.portfolio_add = true;
    this.tickerSymbol = tickerSymbol;
    if (this.enteredQuantity > 0) {
      let total = this.stockPriceC * this.enteredQuantity;
      console.log(total);
      let val: any = localStorage.getItem('moneyInWallet')
      let wallet: any = parseFloat(val);
      wallet = wallet - total;
      localStorage.setItem('moneyInWallet', wallet.toFixed(2).toString());
      //console.log(localStorage.getItem(this.tickerSymbol))
    
      if (localStorage.getItem(this.tickerSymbol + "-Portfolio")) {
        
        let stockValJson: any = localStorage.getItem(this.tickerSymbol + "-Portfolio");
        let stockVal = JSON.parse(stockValJson);
        
        let quantity = this.enteredQuantity + stockVal.qty;
        total = total + stockVal.amount;
        localStorage.setItem(this.tickerSymbol + "-Portfolio", JSON.stringify({ "ticker": this.tickerSymbol, "qty": quantity, "amount": total }))
        this.changeInPort = Math.round(((this.stockPriceC - total / quantity) + Number.EPSILON) * 100) / 100;
        let portfolData = this.portfolioStockDataMap.get(this.tickerSymbol);
        this.cName = portfolData.companyName;
        this.portfolioStockDataMap.set(this.tickerSymbol, {
          tickerVal: this.tickerSymbol,
          companyName: this.cName,
          currentPrice: this.stockPriceC,
          quantity: quantity,
          totalCost: total,
          changeInPort: this.changeInPort
        })
        
      }
    }
    let money: any = localStorage.getItem('moneyInWallet')
    this.moneyInWallet = parseFloat(money);

    this.modalService.dismissAll();

  }

  sellStock(tickerSymbol: any) {
    this._sellSuccess.next('Message successfully changed.');
    this.portfolio_remove = true;
    this.tickerSymbol = tickerSymbol;
    if (this.enteredQuantitySell > 0) {
      let total = this.stockPriceC * this.enteredQuantitySell;
      console.log(total);
      let val: any = localStorage.getItem('moneyInWallet')
      let wallet: any = parseFloat(val);
      wallet = wallet + total;
      localStorage.setItem('moneyInWallet', wallet.toFixed(2).toString());
      let stockValJson: any = localStorage.getItem(this.tickerSymbol + "-Portfolio");
      let stockVal = JSON.parse(stockValJson);
      
      let quantity = stockVal.qty - this.enteredQuantitySell;
      total = stockVal.amount - total
      localStorage.setItem(this.tickerSymbol + "-Portfolio", JSON.stringify({ "ticker": this.tickerSymbol, "qty": quantity, "amount": total }))
      //To update the cards
      stockValJson = localStorage.getItem(this.tickerSymbol + "-Portfolio");
      stockVal = JSON.parse(stockValJson);
      
      this.changeInPort = Math.round(((this.stockPriceC - total / quantity) + Number.EPSILON) * 100) / 100;
      

      if (quantity > 0) {
        let portfolData = this.portfolioStockDataMap.get(this.tickerSymbol);
        this.cName = portfolData.companyName;
        this.portfolioStockDataMap.set(this.tickerSymbol, {
          tickerVal: this.tickerSymbol,
          companyName: this.cName,
          currentPrice: this.stockPriceC,
          quantity: quantity,
          totalCost: total,
          changeInPort: this.changeInPort
        })
      }
      else {
        
        this.removePortfolio = true;
        localStorage.removeItem(this.tickerSymbol + "-Portfolio")
        this.portfolioStockDataMap.delete(this.tickerSymbol)
        

      }
      if (this.portfolioStockDataMap.size === 0) {
        this.alertPortfolio = true;
      }
      let money: any = localStorage.getItem('moneyInWallet')
      this.moneyInWallet = parseFloat(money);
    }
    this.modalService.dismissAll();
  }


}


