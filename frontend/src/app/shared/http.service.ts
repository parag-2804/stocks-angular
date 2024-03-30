import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HttpService {
  //private baseUrl = 'http://localhost:8080/'; 
  private baseUrl = 'https://parag2804stockangular.wl.r.appspot.com/';
  urlPath = ''
  constructor(private http: HttpClient) { }

  getData(urlPath: string, ticker: string) {
    
    return this.http.get(`${this.baseUrl}${urlPath}?ticker=${ticker}`);
  }


  getDataHistoric(urlPath: string, ticker: string, fromDate : any, toDate : any) {
    
    return this.http.get(`${this.baseUrl}${urlPath}?ticker=${ticker}&fromDate=${fromDate}&toDate=${toDate}`);
  }

  getDataAutoComplete(urlPath: string, queryVal : string){
    console.log('URL in Service> '+ `${this.baseUrl}${urlPath}?queryVal=${queryVal}`);
    return this.http.get(`${this.baseUrl}${urlPath}?queryVal=${queryVal}`);
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

  
}
