'use strict';
import * as io from 'socket.io-client';
import { config } from '../../socketconfig';

class Socket {
  private _connectionUrl: string;
  private _socket: any;

  constructor() {
    this._connectionUrl = `${config.url}:${config.port}`;
    this._socket = io(this._connectionUrl);

    this._socket.on('connection', function () {
      console.log('connection done');
    });

    this._socket.on('update_time', function (newTime: string) {
      console.log(newTime);
    });

    this._socket.on('open_file', function (data: string) {
      const fileData = JSON.stringify(data);
      console.log(fileData);
    });
  }
}
export default Socket;
