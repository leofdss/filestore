import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const URL = environment.server;

@Injectable({
  providedIn: "root",
})
export class WebsocketService {

  private socket;

  constructor() {
    this.socket = io(URL);
  }

  public send(connection: string, message: object) {
    this.socket.emit(connection, message);
  }

  public get(connection) {
    return new Observable((observer) => {
      this.socket.on(connection, (message) => {
        setTimeout(() => {
          observer.next(message);
        }, 2000);
      });
    });
  }
}
