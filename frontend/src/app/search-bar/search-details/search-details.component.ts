import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  OnChanges,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from 'src/app/shared/http.service';
import { Subject, timer } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import {
  NgbModal,
  ModalDismissReasons,
  NgbModalOptions,
} from '@ng-bootstrap/ng-bootstrap';
import {
  faTwitter,
  faFacebookSquare,
} from '@fortawesome/free-brands-svg-icons';
import { debounceTime } from 'rxjs/operators';

import { Router } from '@angular/router';
import IndicatorCore from 'highcharts/indicators/indicators';
import vbp from 'highcharts/indicators/volume-by-price';
import StockModule from 'highcharts/modules/stock';
import HStockModule from 'highcharts/modules/stock-tools';
StockModule(Highcharts);
HStockModule(Highcharts);
IndicatorCore(Highcharts);
vbp(Highcharts);


@Component({
  selector: 'app-search-details',
  templateUrl: './search-details.component.html',
  styleUrls: ['./search-details.component.css'],
})
export class SearchDetailsComponent implements OnInit {
  faTwitter = faTwitter;
  faFacebook = faFacebookSquare;


  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  chartOptionsHistorical: Highcharts.Options = {};
  chartOptionsMain: Highcharts.Options = {};
  chartOptionsSummary: Highcharts.Options = {};
  wishlist_add = false;
  watchlistAddMessage = '';
  watchlistRemoveMessage = '';
  wishlist_remove = false;
  display_filled_star = false;
  display_star = false;
  addMessage = '';
  removeMessage = '';
  buyMessage = '';
  sellMessage = '';
  invalidTicker = false;
  enteredQuantity: number = 0;
  enteredQuantitySell: number = 0;
  totalPrice: string = '0.00';
  Current_Price: any;
  buy_button = false;
  sell_button = false;
  fetchSubscribe: any;
  @Input() changing!: Subject<string>;
  @Input('tickerSymbol') tickerSymbol = '';
  @Output() getResponse = new EventEmitter();
  private route1Path: any = [];
  public companyDesc: any = [];
  public historicalData: any = [];
  public stockPrice: any = [];
  public autoComplete: any = [];
  public companyNews: any = [];
  public recommendation: any = [];
  public insiderSentiment: any = [];
  public companyPeers: any = [];
  public companyEarnings: any = [];
  private recomPeriod: any = [];
  private dataForRecomm: any = [];
  private epsSurpriseDataX: any = [];
  private epsSurpriseDataY: any = [];
  public newsData20: any = [];
  public newLenCard = 10;
  public hourlydata: any = [];
  isChartLoaded = false;
  isChartLoadedHistorical = false;
  isNewsLoaded = false;
  public closeResult: string = '';
  public currentNews: any;
  public mainChartData: any = [];
  moneyInWallet: any;
  marketMessage = 'Market is Closed';
  public aggregatedInsiderData: any = {
    totalMspr: 0,
    positiveMspr: 0,
    negativeMspr: 0,
    totalChange: 0,
    positiveChange: 0,
    negativeChange: 0,
  };
  
  cName: any;
  public changeInPort = 0;
  
  public showMainChart = false;
  change_percent = false;
  market_open = false;
  curr_time: any;
  date_today_6: any;
  unix_date: any;
  unix_date_6: any;
  curr_date: any;
  timestamp: any;
  showChart = false;
  private _watchlistAdd = new Subject<string>();
  private _watchlistRemove = new Subject<string>();
  private _buySuccess = new Subject<string>();
  private _sellSuccess = new Subject<string>();
  closeModal = '';
  stockBuy = false;
  stockLeft: any;
  spinner = false;
  stockPriceC: any;
  portfolioStockDataMap: any;
  

  constructor(
    private http: HttpClient,
    private httpService: HttpService,
    private modalService: NgbModal,
    private router: Router
  ) {}
  open(content: any, newsData: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
    this.currentNews = newsData;
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
    
    this.tickerSymbol = this.tickerSymbol.toUpperCase();
    this.changing.subscribe((v) => {
      console.log('value is changing', v);
      this.tickerSymbol = v.toUpperCase();
      this.fetchAPI();
      this.getWatchlist();
      this.enableSellButton();
    });
    this.fetchAPI();
    this.getWatchlist();

    this.alertMessageDisplay();
    this.setWalletMoney();
    this.enableSellButton();
  }

  setWalletMoney() {
    this.moneyInWallet = localStorage.getItem('moneyInWallet'); 
    if (!this.moneyInWallet) {
      localStorage.setItem('moneyInWallet', '25000.00');
    }
  }

  alertMessageDisplay() {
    
    this._buySuccess.subscribe((message) => (this.buyMessage = message));
    this._buySuccess
      .pipe(debounceTime(50000))
      .subscribe(() => (this.buyMessage = ''));

    this._sellSuccess.subscribe((message) => (this.sellMessage = message));
    this._sellSuccess
      .pipe(debounceTime(50000))
      .subscribe(() => (this.sellMessage = ''));

    this._watchlistAdd.subscribe((message) => (this.addMessage = message));
    this._watchlistAdd
      .pipe(debounceTime(50000))
      .subscribe(() => (this.addMessage = ''));

    this._watchlistRemove.subscribe(
      (message) => (this.removeMessage = message)
    );
    this._watchlistRemove
      .pipe(debounceTime(50000))
      .subscribe(() => (this.removeMessage = ''));

    let money: any = localStorage.getItem('moneyInWallet');
    this.moneyInWallet = localStorage.getItem('moneyInWallet'); 
    
  }

  fetchAPICombined() {
    let companyDesc = this.httpService.getData(
      'companyDesc',
      this.tickerSymbol
    );
    let latestStockPrice = this.httpService.getData(
      'stockPrice',
      this.tickerSymbol
    );
    let companyPeers = this.httpService.getData(
      'companyPeers',
      this.tickerSymbol
    );

    this.timeManipulation();

    
    let newsData = this.httpService.getData('companyNews', this.tickerSymbol);
    let companyRecomm = this.httpService.getData(
      'recommendation',
      this.tickerSymbol
    );
    
    let earnings = this.httpService.getData(
      'companyEarnings',
      this.tickerSymbol
    );
    this.spinner = true;

    
  }

  fetchAPI() {
    console.log('fetchAPI method starts');
    this.spinner = true;

    this.httpService
      .getData('companyDesc', this.tickerSymbol)
      .subscribe((res) => {
        this.companyDesc = res;
        console.log('companyDesc> ' + JSON.stringify(res));
        this.spinner = false;
        if (Object.keys(this.companyDesc).length === 0) {
          this.invalidTicker = true;
        } else {
          this.invalidTicker = false;
          this.buy_button = true;
        }
      });
    if (!this.invalidTicker) {
      this.httpService.getMainChartData(this.tickerSymbol)
        .subscribe((res) => {
          console.log('historicalData> ' + JSON.stringify(res));
          this.mainChartData = res;
          this.showMainChart = true;
          this.mainChart();
        });

      
      this.httpService
        .getData('stockPrice', this.tickerSymbol)
        .subscribe((res) => {
          this.stockPrice = res;
          this.Current_Price = this.stockPrice.c;

          
          this.timeManipulation();
        

          this.httpService.getHourlyData(this.tickerSymbol)
          .subscribe((res) => {
          //console.log("Testttttt", res)
          this.hourlydata = res;
          this.showChart = true
          this.hourlyChart();
          })

        });
      
      this.httpService
        .getData('companyNews', this.tickerSymbol)
        .subscribe((res) => {
          this.companyNews = res;
          this.loadDataForNews(this.companyNews);
          this.isNewsLoaded = true;
        });

      this.httpService
        .getData('recommendation', this.tickerSymbol)
        .subscribe((res) => {
          this.recommendation = res;
          this.loadDataForRecomChart(this.recommendation);
          this.isChartLoaded = true;
          this.recomChart();
        });
      this.httpService.getInsiderData(this.tickerSymbol)
        .subscribe((res) => {
          this.insiderSentiment = res;
          this.loadValuesForInsider(this.insiderSentiment);
        });
      this.httpService
        .getData('companyPeers', this.tickerSymbol)
        .subscribe((res) => {
          this.companyPeers = res;
        });

      this.httpService
        .getData('companyEarnings', this.tickerSymbol)
        .subscribe((res) => {
          this.companyEarnings = res;
          this.loadEPSChartData(this.companyEarnings);
          this.isChartLoadedHistorical = true;
          this.EPSChart();
        });
    }

    this.fetchSubscribe = timer(0, 15000).subscribe(() => {
      this.httpService
        .getData('companyDesc', this.tickerSymbol)
        .subscribe((res) => {
          this.companyDesc = res;
        });
      
      this.httpService
        .getData('stockPrice', this.tickerSymbol)
        .subscribe((res) => {
          this.stockPrice = res;
          this.Current_Price = this.stockPrice.c;

        })
    });
  }

  buyStock() {
    this._buySuccess.next('Message successfully changed.');
    
    if (this.enteredQuantity > 0) {
      let total = this.Current_Price * this.enteredQuantity;
      
      let val: any = localStorage.getItem('moneyInWallet');
      let wallet: any = parseFloat(val);
      wallet = wallet - total;
      
      localStorage.setItem('moneyInWallet', wallet.toFixed(2).toString());
      
      if (localStorage.getItem(this.tickerSymbol + "-Portfolio")) {
        console.log(this.tickerSymbol)
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

      else {
        console.log(this.tickerSymbol +'Success')
        localStorage.setItem(
          this.tickerSymbol + '-Portfolio',
          JSON.stringify({
            ticker: this.tickerSymbol,
            qty: this.enteredQuantity,
            amount: total,
          })
        );
      }

      let stockValJson: any = localStorage.getItem(
        this.tickerSymbol + '-Portfolio'
      );
      let stockVal = JSON.parse(stockValJson);
      
      if (stockVal.qty > 0) {
        this.sell_button = true;
        
      }

      
    }

    this.modalService.dismissAll();
  }
  
  sellStock() {
    this._sellSuccess.next('Message successfully changed.');
    
    if (this.enteredQuantitySell > 0) {
      let total = this.Current_Price * this.enteredQuantitySell;
      console.log(total);
      let val: any = localStorage.getItem('moneyInWallet');
      let wallet: any = parseFloat(val);
      wallet = wallet + total;
      localStorage.setItem('moneyInWallet', wallet.toFixed(2).toString());
      let stockValJson: any = localStorage.getItem(
        this.tickerSymbol + '-Portfolio'
      );
      let stockVal = JSON.parse(stockValJson);
      let stockQ = stockVal.qty - this.enteredQuantitySell;
      total = stockVal.totalPrice - total;
      localStorage.setItem(
        this.tickerSymbol + '-Portfolio',
        JSON.stringify({
          ticker: this.tickerSymbol,
          qty: stockQ,
          amount: total,
        })
      );
      if (stockQ > 0) {
        this.sell_button = true;
        
      } else {
        this.sell_button = false;
        localStorage.removeItem(this.tickerSymbol + '-Portfolio');
      }
    }
    this.modalService.dismissAll();
  }
  enableSellButton() {
    if (localStorage.getItem(this.tickerSymbol + '-Portfolio')) {
      let stockValJson: any = localStorage.getItem(
        this.tickerSymbol + '-Portfolio'
      );
      let stockVal = JSON.parse(stockValJson);
      let stockQ = stockVal.qty;
      if (stockQ > 0) {
        this.sell_button = true;
      } else {
        this.sell_button = false;
        
      }
    }
  }

  
  peerCall(peer: any) {
    

    this.router.navigate(['/search', peer]);
    this.changing.next(peer);
    this.tickerSymbol = peer;
    
    this.fetchAPI();
  }

  timeManipulation() {
    this.curr_date = new Date();
    
    this.curr_time = new Date(this.stockPrice.t * 1000);
  
    // Determine if the market is open.
    this.market_open = this.curr_time > this.curr_date - 5 * 60 * 1000;

    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    // Format the current date
    const formattedDate = [
      this.curr_date.getFullYear(),
      ('0' + (this.curr_date.getMonth() + 1)).slice(-2), 
      ('0' + this.curr_date.getDate()).slice(-2) 
    ].join('-');
    
    const fixedTime = '13:00:00';
  
    if (this.market_open) {
      
      this.marketMessage = 'Market is Open';
    } else {
      
      this.curr_time = new Date(); 
      this.marketMessage = `Market Closed on ${formattedDate} ${fixedTime}`;
    }
  
    
    this.timestamp =
      this.curr_time.getFullYear() +
      '-' +
      (this.curr_time.getMonth() + 1 < 10 ? '0' : '') +
      (this.curr_time.getMonth() + 1) +
      '-' +
      (this.curr_time.getDate() < 10 ? '0' : '') +
      this.curr_time.getDate() +
      ' ' +
      (this.curr_time.getHours() < 10 ? '0' : '') +
      this.curr_time.getHours() +
      ':' +
      (this.curr_time.getMinutes() < 10 ? '0' : '') +
      this.curr_time.getMinutes() +
      ':' +
      (this.curr_time.getSeconds() < 10 ? '0' : '') +
      this.curr_time.getSeconds();
  
    
    if (this.stockPrice.dp >= 0) {
      this.change_percent = true;
    }
  
    
    if (this.market_open) {
      this.unix_date = Math.floor(Date.now() / 1000);
      this.date_today_6 = this.curr_date.setHours(this.curr_date.getHours() - 6);
      this.unix_date_6 = Math.floor(this.date_today_6 / 1000);
    } else {
      
      this.unix_date = Math.floor(Date.now() / 1000);
      this.date_today_6 = this.curr_time.setHours(this.curr_time.getHours() - 6);
      this.unix_date_6 = Math.floor(this.date_today_6 / 1000);
    }
  }
  
  

loadValuesForInsider(insiderData: any) {
  
  this.aggregatedInsiderData = {
    totalMspr: 0,
    positiveMspr: 0,
    negativeMspr: 0,
    totalChange: 0,
    positiveChange: 0,
    negativeChange: 0,
  };
  const data = insiderData.data;

  
  data.forEach((sentiment: any) => {
    const mspr = sentiment.mspr;
    const change = sentiment.change;

    this.aggregatedInsiderData.totalMspr += mspr;
    this.aggregatedInsiderData.totalChange += change;

    if (mspr > 0) {
      this.aggregatedInsiderData.positiveMspr += mspr;
    } else if (mspr < 0) {
      this.aggregatedInsiderData.negativeMspr += mspr;
    }

    if (change > 0) {
      this.aggregatedInsiderData.positiveChange += change;
    } else if (change < 0) {
      this.aggregatedInsiderData.negativeChange += change;
    }
  });
  Object.keys(this.aggregatedInsiderData).forEach(key => {
    this.aggregatedInsiderData[key] = parseFloat(this.aggregatedInsiderData[key].toFixed(2));
  });

}


  loadDataForNews(newsVal: any) {
    this.newsData20 = [];
    let newsLen = 20;
    let tempNewsData = [];
    if (this.companyNews < 20) {
      newsLen = this.companyNews.length;
    }

    let k = 0;
    for (let item of newsVal) {
      if (
        item.image != '' &&
        item.image != undefined &&
        item.headline != '' &&
        item.headline != undefined &&
        item.url != '' &&
        item.url != undefined
      ) {
        
        item.datetime = this.convertDateFromUnix(item.datetime);
        tempNewsData.push(item);
        k += 1;
      }
      if (k == newsLen) {
        break;
      }
    }

    let finalNewsLen = tempNewsData.length;
    let j = 0;

    while (j < finalNewsLen - 1) {
      let tempList = [];
      tempList.push(tempNewsData[j]);
      tempList.push(tempNewsData[j + 1]);
      this.newsData20.push(tempList);
      j += 2;
    }
    let tempList1 = [];
    if (j < finalNewsLen) {
      tempList1.push(tempNewsData[finalNewsLen - 1]);
      tempList1.push([]);
      this.newsData20.push(tempList1);
    }
  }

  convertDateFromUnix(unixDate: any) {
   
    let date = new Date(unixDate * 1000);
    let months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
   
    let reqDate =
      months[date.getMonth()] + ' ' + date.getDay() + ',' + date.getFullYear();
    return reqDate;
  }

  
  openPortfolioBuy(portfolioModalBuy: any, stockDeal: any) {
    if (stockDeal === 'buy') {
      this.stockBuy = true;
    } else {
      this.stockBuy = false;
    }
    let money: any = localStorage.getItem('moneyInWallet');
    this.moneyInWallet = parseFloat(money);

    this.modalService
      .open(portfolioModalBuy, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeModal = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeModal = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  openPortfolioSell(portfolioModalSell: any, stockDeal: any) {
    if (stockDeal === 'buy') {
      this.stockBuy = true;
    } else {
      this.stockBuy = false;
    }

    let money: any = localStorage.getItem('moneyInWallet');
    this.moneyInWallet = parseFloat(money);
    let stockValJson: any = localStorage.getItem(
      this.tickerSymbol + '-Portfolio'
    );
    let stockVal = JSON.parse(stockValJson);

    this.stockLeft = stockVal.qty;

    this.modalService
      .open(portfolioModalSell, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeModal = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeModal = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }


  loadDataForRecomChart(dataRecom: any) {
    
    let recomPeriod: any[] = [];
    let strongBuy: any[] = [];
    let buy: any[] = [];
    let hold: any[] = [];
    let sell: any[] = [];
    let strongSell: any[] = [];
    
    
    dataRecom.forEach((item: { period: string; strongBuy: any; buy: any; hold: any; sell: any; strongSell: any; }) => {
      
      recomPeriod.push(item.period.substring(0, 7));
      
      
      strongBuy.push(item.strongBuy);
      buy.push(item.buy);
      hold.push(item.hold);
      sell.push(item.sell);
      strongSell.push(item.strongSell);
    });
  
    
    this.recomPeriod = recomPeriod;
    this.dataForRecomm = [strongBuy, buy, hold, sell, strongSell];
  }
  
  

  recomChart() {
    
    
    this.chartOptions = {
      chart: { type: 'column' },
      title: {
        text: 'Recommendation Trends',
        style: {
          fontSize: '15px',
          color: '#29363E',
        },
      },
      xAxis: { categories: this.recomPeriod },
      yAxis: {
        min: 0,
        title: { text: '#Analysis', align: 'high' },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color:
              
              (Highcharts.defaultOptions.title?.style &&
                Highcharts.defaultOptions.title.style.color) ||
              'gray',
          },
        },
      },
      legend: {
        align: 'center',
        x: -24,
        
        y: 0,
        
        backgroundColor:
          Highcharts.defaultOptions.legend?.backgroundColor || 'white',
        
        shadow: false,
        itemStyle: {
          fontSize: '7px',
        },
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: true,
          },
        },
      },
      series: [
        {
          
          name: 'Strong Buy',
          type: 'column',
          data: this.dataForRecomm[0],
          color: '#186F37',
          pointWidth: 38,
        },
        {
          name: 'Buy',
          type: 'column',
          data: this.dataForRecomm[1],
          color: '#1CB955',
          pointWidth: 38,
        },
        {
          name: 'Hold',
          type: 'column',
          data: this.dataForRecomm[2],
          color: '#B98B1D',
          pointWidth: 38,
        },
        {
          name: 'Sell',
          type: 'column',
          data: this.dataForRecomm[3],
          color: 'rgb(255,0,0)',
          pointWidth: 38,
        },
        {
          name: 'Strong Sell',
          type: 'column',
          data: this.dataForRecomm[4],
          color: '#803131',
          pointWidth: 38,
        },
      ],
    };
  }

  loadEPSChartData(dataHistoric: any) {
    
    this.epsSurpriseDataX = [];
    let actualData: any[][] = [];
    let estimateData: any[][] = [];
  
    
    dataHistoric.forEach((item: { period: any; surprise: any; actual: any; estimate: any; }) => {
      
      let label = `${item.period} Surprise: ${item.surprise}`;
      
      
      this.epsSurpriseDataX.push(label);
      
      
      actualData.push([label, item.actual]);
      estimateData.push([label, item.estimate]);
    });
  
    
    this.epsSurpriseDataY = [actualData, estimateData];
  }
  

  EPSChart() {
    this.chartOptionsHistorical = {
      title: {
        text: 'Historical EPS Surprises',
        style: {
          fontSize: '15px',
          color: '#29363E',
        },
      },

      yAxis: {
        title: {
          text: 'Quarterly EPS',
        },
      },

      

      xAxis: {
        type: 'category',
        categories: this.epsSurpriseDataX,

        labels: {
          rotation: 0,
          useHTML: true,
          allowOverlap: true,
          style: {
            
            fontSize: '10px',
            wordBreak: 'break-all',
            textAlign: 'center',
            textOverflow: 'allow',
          },
        },
      },

      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
      },

      plotOptions: {
        series: {
          label: {
            connectorAllowed: false,
          },
          pointStart: 2010,
        },
      },

      series: [
        {
          name: 'Actual',
          type: 'spline',
          data: this.epsSurpriseDataY[0],
        },
        {
          name: 'Estimate',
          type: 'spline',
          data: this.epsSurpriseDataY[1],
        },
      ],

      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
            chartOptions: {
              legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
              },
            },
          },
        ],
      },
    };
  }

  
  mainChart() {
    
    let ohlc = [],
      volume = [];

    
    let groupingUnits: any = [
      [
        'week', 
        [1], 
      ],
      ['month', [1, 2, 3, 4, 6]],
    ];

    for (var i = 0; i < this.mainChartData.results.length; i++) {
      ohlc[i] = [
        this.mainChartData.results[i]['t'],
        this.mainChartData.results[i]['o'],
        this.mainChartData.results[i]['h'],
        this.mainChartData.results[i]['l'],
        this.mainChartData.results[i]['c'],
      ];

      volume[i] = [
        this.mainChartData.results[i]['t'],
        this.mainChartData.results[i]['v'],
        
      ];
    }
    
    Highcharts.setOptions({
      time: {
        timezoneOffset: 7 * 60,
      },
    });
    this.chartOptionsMain = {
      
      title: {
        text: this.tickerSymbol + ' Historical',
        style: {
          
          fontSize: '15',
        },
      },
      legend: { enabled: false },
      subtitle: {
        text: 'With SMA and Volume by Price technical indicators',
        style: {
          color: '#9e9e9f',
          fontSize: '12',
        },
      },

      rangeSelector: {
        buttons: [
          {
            type: 'month',
            count: 1,
            text: '1m',
          },
          {
            type: 'month',
            count: 3,
            text: '3m',
          },
          {
            type: 'month',
            count: 6,
            text: '6m',
          },
          {
            type: 'ytd',
            text: 'YTD',
          },
          {
            type: 'year',
            count: 1,
            text: '1y',
          },
          {
            type: 'all',
            text: 'All',
          },
        ],
        selected: 2,
        enabled: true,
        inputEnabled: true,
        
        allButtonsEnabled: true,
      },
      navigator: {
        enabled: true,
      },
      xAxis: {
        ordinal: true,
        

        type: 'datetime',
      },

      yAxis: [
        {
          startOnTick: false,
          endOnTick: false,
          labels: {
            align: 'right',
            x: -3,
          },
          title: {
            text: 'OHLC',
          },
          height: '60%',
          lineWidth: 2,
          resize: {
            enabled: true,
          },
          opposite: true,
        },
        {
          labels: {
            align: 'right',
            x: -3,
          },
          title: {
            text: 'Volume',
          },
          top: '65%',
          height: '35%',
          offset: 0,
          lineWidth: 2,
          opposite: true,
        },
      ],

      tooltip: {
        split: true,
      },

      plotOptions: {
        series: {
          dataGrouping: {
            units: groupingUnits,
          },
        },
      },

      series: [
        {
          type: 'candlestick',
          name: 'AAPL',
          id: 'aapl',
          zIndex: 2,
          data: ohlc,
        },
        {
          type: 'column',
          name: 'Volume',
          id: 'volume',
          data: volume,
          yAxis: 1,
        },
        {
          type: 'vbp',
          linkedTo: 'aapl',
          params: {
            volumeSeriesID: 'volume',
          },
          dataLabels: {
            enabled: false,
          },
          zoneLines: {
            enabled: false,
          },
        },
        {
          type: 'sma',
          linkedTo: 'aapl',
          zIndex: 1,
          marker: {
            enabled: false,
          },
        },
      ],
    };
    this.showMainChart = true;
    console.log(this.showMainChart);
  }

  hourlyChart() {
    var list1 = [];

    for (var i = 0; i < this.hourlydata.results.length; i++) {
      var tempList1 = [
        this.hourlydata.results[i]['t'], 
        this.hourlydata.results[i]['c'],        
      ];
      list1.push(tempList1); 
    }

    Highcharts.setOptions({
     
    });

    this.chartOptionsSummary = {
      title: {
        text: this.tickerSymbol + ' Hourly Price Variation',
        style: {
          color: '#9e9e9f',
          fontSize: '15',
        },
      },
      legend: { enabled: false },
      yAxis: [
        {
          title: {
            text: '',
          },
          opposite: true,
        },
      ],
      xAxis: [
        {
      
          type: 'datetime',

          title: {
            text: '',
          },
        },
      ],
      series: [
        {
          data: list1,
          type: 'line',
          color: this.change_percent ? '#28a745' : '#de3345',
          marker: {
            enabled: false
          }
        },
      ],
    };
    this.showChart = true;
  }
  

  
  getWatchlist() {
    
    if (
      this.tickerSymbol ===
      localStorage.getItem(this.tickerSymbol + '-Watchlist')
    ) {
      
      this.display_filled_star = true;
      this.display_star = false;
    } else {
      this.display_filled_star = false;
      this.display_star = true;
    }
    
  }

  addToWatchlist() {
    if (this.display_star === true) {
      this.display_star = false;
      this.display_filled_star = true;
      this.wishlist_add = true;
      this.wishlist_remove = false;
      localStorage.setItem(this.tickerSymbol + '-Watchlist', this.tickerSymbol);
    } else {
      this.display_star = true;
      this.display_filled_star = false;
      this.wishlist_add = false;
      this.wishlist_remove = true;
      localStorage.removeItem(this.tickerSymbol + '-Watchlist');
    }
  }
  

  ngOnDestroy() {
    this.fetchSubscribe.unsubscribe();
  }
}

