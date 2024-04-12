import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private baseUrl = 'http://localhost:8080/'; 
  //private baseUrl = 'https://parag2804stockangular.wl.r.appspot.com/';
  urlPath = ''
  constructor(private http: HttpClient) { }

  // getData(urlPath: string, ticker: string) {
    
  //   return this.http.get(`${this.baseUrl}${urlPath}?ticker=${ticker}`);
  // }


  getcompanyDesc(ticker: string) {
    
    return this.http.get(`${this.baseUrl}companyDesc/${ticker}`);
  }

  getstockPrice(ticker: string) {
    
    return this.http.get(`${this.baseUrl}stockPrice/${ticker}`);
  }

  getcompanyPeers(ticker: string) {
    
    return this.http.get(`${this.baseUrl}companyPeers/${ticker}`);
  }

  getrecommendation(ticker: string) {
    
    return this.http.get(`${this.baseUrl}recommendation/${ticker}`);
  }
  getcompanyEarnings(ticker: string) {
    
    return this.http.get(`${this.baseUrl}companyEarnings/${ticker}`);
  }

  getcompanyNews(ticker: string) {
    
    return this.http.get(`${this.baseUrl}companyNews/${ticker}`);
    
  }


  // getDataHistoric(urlPath: string, ticker: string, fromDate : any, toDate : any) {
    
  //   return this.http.get(`${this.baseUrl}${urlPath}?ticker=${ticker}&fromDate=${fromDate}&toDate=${toDate}`);
  // }

  getDataAutoComplete(queryVal : string) :Observable<any> {
   
    return this.http.get<any>(`${this.baseUrl}autocomplete/${queryVal}`);

  }
  getHourlyData(ticker: string) : Observable<any> {
    return this.http.get<any>(`${this.baseUrl}companyHourly/${ticker}`);

  }

  getMainChartData(ticker: string) : Observable<any> {
    return this.http.get<any>(`${this.baseUrl}historicalChart/${ticker}`);

  }

  getInsiderData(ticker: string) : Observable<any> {
    return this.http.get<any>(`${this.baseUrl}insiderSentiment/${ticker}`);
  
  }

  getCompanyDesc(ticker: string) : Observable<any> {
    return this.http.get<any>(`${this.baseUrl}companyDescript/${ticker}`);
  
  }

  
}
