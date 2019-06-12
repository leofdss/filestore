import { Injectable } from '@angular/core';

import { v4 } from 'uuid';
import { FileElement } from '../model/element';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { FileUploader } from 'ng2-file-upload';

const URL = 'http://localhost:3000/api';

export interface IFileService {
  add(fileElement: FileElement);
  delete(id: string);
  update(id: string, update: Partial<FileElement>);
  queryInFolder(folderId: string): Observable<FileElement[]>;
  get(id: string): FileElement;
}

@Injectable()
export class FileService implements IFileService {
  private map = new Map<string, FileElement>();

  constructor(
    private http: HttpClient
  ) { }

  newFileUploader(path) {
    console.log(path);
    let uploader = new FileUploader({
      url: URL + '/upload' + path,
      itemAlias: 'storage',
      authToken: localStorage.getItem('session')
    })
    uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    return uploader;
  }

  public download(path: string): Observable<Object> {
    return this.http.post(URL + '/download', {
      path: path
    }, {
        headers: new HttpHeaders({
          'Authorization': localStorage.getItem('session'),
          'Content-Type': 'application/json'
        })
      });
  }

  add(fileElement: FileElement) {
    fileElement.id = v4();
    this.map.set(fileElement.id, this.clone(fileElement));
    return fileElement;
  }

  delete(id: string) {
    this.map.delete(id);
  }

  clear() {
    this.map = new Map<string, FileElement>();
  }

  update(id: string, update: Partial<FileElement>) {
    let element = this.map.get(id);
    element = Object.assign(element, update);
    this.map.set(element.id, element);
  }

  private querySubject: BehaviorSubject<FileElement[]>;
  queryInFolder(folderId: string) {
    const result: FileElement[] = [];
    this.map.forEach(element => {
      if (element.parent === folderId) {
        result.push(this.clone(element));
      }
    });
    if (!this.querySubject) {
      this.querySubject = new BehaviorSubject(result);
    } else {
      this.querySubject.next(result);
    }
    return this.querySubject.asObservable();
  }

  get(id: string) {
    return this.map.get(id);
  }

  getFiles(folder: string) {
    return this.http.get(URL + '/storage' + folder, {
      headers: new HttpHeaders({
        'Authorization': localStorage.getItem('session'),
        'Content-Type': 'application/json'
      })
    });
  }

  renameFiles(options: { oldPath: string, path: string }) {
    return this.http.put(URL + '/storage', {
      oldPath: options.oldPath,
      path: options.path
    }, {
        headers: new HttpHeaders({
          'Authorization': localStorage.getItem('session'),
          'Content-Type': 'application/json'
        })
      });
  }

  createFolder(folder: string) {
    return this.http.post(URL + '/storage', {
      path: folder
    }, {
        headers: new HttpHeaders({
          'Authorization': localStorage.getItem('session'),
          'Content-Type': 'application/json'
        })
      });
  }

  deleteFiles(element: string) {
    return this.http.delete(URL + '/storage' + element, {
      headers: new HttpHeaders({
        'Authorization': localStorage.getItem('session'),
        'Content-Type': 'application/json'
      })
    });
  }

  clone(element: FileElement) {
    return JSON.parse(JSON.stringify(element));
  }
}
