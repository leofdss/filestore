import { Injectable } from '@angular/core';

import { v4 } from 'uuid';
import { FileElement } from '../model/element';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { FileUploader } from 'ng2-file-upload';

const URL = 'http://localhost:3000/api/';

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
    let uploader = new FileUploader({
      url: URL + 'upload/' + path,
      itemAlias: 'storage',
      authToken: '123'
    })
    uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    return uploader;
  }

  public download(path: string): Observable<Object> {
    const req = new HttpRequest('GET', URL + 'download/' + path, {
      responseType: 'blob',
      reportProgress: true,
      headers: new HttpHeaders({
        'Authorization': '123',
        'Content-Type': 'application/json'
      })
    });
    return this.http.request(req);
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
    return this.http.get(URL + 'storage/' + folder);
  }

  renameFiles(options: { oldPath: string, path: string }) {
    return this.http.put(URL + 'storage/', {
      oldPath: options.oldPath,
      path: options.path
    });
  }

  createFolder(folder: string) {
    return this.http.post(URL + 'storage/', {
      path: folder
    });
  }

  deleteFiles(element: string) {
    return this.http.delete(URL + 'storage/' + element);
  }

  clone(element: FileElement) {
    return JSON.parse(JSON.stringify(element));
  }
}
