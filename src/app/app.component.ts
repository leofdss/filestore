import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FileService } from './service/file.service';
import { Observable, Subscription } from 'rxjs';
import { FileElement } from './model/element';
import { FileUploader } from 'ng2-file-upload';
import { WebsocketService } from './service/websocket.service';
import { delay } from 'q';
const URL = 'http://localhost:3000/api';

interface Clipboard {
  method: string;
  items: {
    path: string;
    element: FileElement;
  }[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public fileElements: Observable<FileElement[]>;

  constructor(
    public fileService: FileService,
    private websocketService: WebsocketService
  ) { }

  sub: Subscription;

  currentRoot: FileElement;
  currentPath: string;
  canNavigateUp = false;
  loading = false;

  public uploader: FileUploader;
  clipboard: Clipboard;

  @Input() root: string = '';

  ngOnInit() {
    localStorage.setItem('session', '123');
    this.update();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  /** Atualiza itens na tela com o servidor */
  update() {
    if (!this.currentRoot) {
      this.uploader = this.fileService.newFileUploader('/' + this.root);
      this.fileService.clear();
      this.getFiles(this.root + '/', 'root');
    } else {
      this.uploader = this.fileService.newFileUploader('/' + this.root + '/' + this.currentPath);
      this.fileService.delete(this.currentRoot.id);
      this.currentRoot = this.fileService.add(this.fileService.clone(this.currentRoot));
      this.getFiles(this.root + '/' + this.currentPath, this.currentRoot.id);
    }
    this.uploader.onCompleteAll = () => {
      this.update();
    };
    this.sub = this.websocketService.get('copy').pipe().subscribe((message: any) => {
      if (!message.error && message.results) {
        this.update();
      }
    });
  }

  download(element: FileElement) {
    this.loading = true;
    let path = this.getPath([element.name]);
    this.fileService.download(path).subscribe((data: any) => {
      this.loading = false;
      let url = URL + '/download/' + data.key;

      var a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = element.name;
      document.body.appendChild(a);
      a.click();
    }, () => { this.loading = false; });
  }

  downloads(elements: FileElement[]) {
    this.loading = true;
    let paths = [];
    if (elements) {
      for (let element of elements) {
        let path = this.getPath([element.name]);
        paths.push(path);
      }
    }
    this.fileService.downloads(paths).subscribe((data: any) => {
      this.loading = false;
      let url = URL + '/download/' + data.key;

      var a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      document.body.appendChild(a);
      a.click();
    }, () => { this.loading = false; });
  }

  downloadFolder(element: FileElement) {
    this.loading = true;
    let path = this.getPath([element.name]);
    this.fileService.downloadFolder(path).subscribe((data: any) => {
      this.loading = false;
      let url = URL + '/download/' + data.key;

      var a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = element.name;
      document.body.appendChild(a);
      a.click();
    }, () => { this.loading = false; });
  }

  /** Busca arquivos no servidor */
  getFiles(url: string, parent: string) {
    this.loading = true;
    this.fileService.getFiles(url).subscribe(
      (data: any) => {
        this.loading = false;
        if (data.files) {
          for (let item of data.files) {
            if (item != '.@__thumb') {
              let isFolder = true;
              if (item.includes('.')) {
                isFolder = false;
              }
              let element = {
                name: item,
                isFolder: isFolder,
                parent: parent,
                loading: false
              }
              this.fileService.add(element);
            }
          }
          this.updateFileElementQuery();
        }
      }
    );
  }

  /** Adiciona uma nova pasta */
  addFolder(folder: { name: string }) {
    this.loading = true;
    let path = this.getPath([folder.name]);
    this.fileService.createFolder(path)
      .subscribe((data) => {
        this.loading = false;
        this.fileService.add({
          isFolder: true,
          loading: false,
          name: folder.name,
          parent: this.currentRoot ? this.currentRoot.id : 'root'
        });
        this.updateFileElementQuery();
      }, (error) => {
        this.loading = false;
        console.log(error);
      })
  }

  /** Deletar arquivo ou pasta */
  removeElement(elements: FileElement[]) {
    if (elements) {
      for (let element of elements) {
        this.loading = true;
        let path = this.getPath([element.name]);
        this.fileService.deleteFiles(path)
          .subscribe(data => {
            this.loading = false;
            this.fileService.delete(element.id);
            this.updateFileElementQuery();
          }, error => {
            this.loading = false;
            console.log(error);
          });
      }
    }
  }

  /** Entra na pasta selecionada */
  navigateToFolder(element: FileElement) {
    this.currentRoot = element;
    this.updateFileElementQuery();
    this.currentPath = this.pushToPath(this.currentPath, element.name);
    this.canNavigateUp = true;
    if (!element.loading) {
      element.loading = true;
      this.fileService.update(element.id, element);
      this.getFiles(this.root + '/' + this.currentPath, element.id);
    }
    this.uploader = this.fileService.newFileUploader('/' + this.root + '/' + this.currentPath);
    this.uploader.onCompleteAll = () => {
      this.update();
    };
  }

  /** Retorna para pasta pai */
  navigateUp() {
    if (this.currentRoot && this.currentRoot.parent === 'root') {
      this.currentRoot = null;
      this.canNavigateUp = false;
      this.updateFileElementQuery();
    } else {
      this.currentRoot = this.fileService.get(this.currentRoot.parent);
      this.updateFileElementQuery();
    }
    this.currentPath = this.popFromPath(this.currentPath);
    this.uploader = this.fileService.newFileUploader('/' + this.root + '/' + this.currentPath);
    this.uploader.onCompleteAll = () => {
      this.update();
    };
  }

  /** Mover arquivo ou pasta */
  moveElement(event: { element: FileElement; moveTo: FileElement }) {
    this.loading = true;
    let oldPath = this.getPath([event.element.name]);
    let path = this.getPath([event.moveTo.name, event.element.name]);
    this.fileService.renameFiles({
      oldPath: oldPath,
      path: path
    }).subscribe(data => {
      this.loading = false;
      if (event.moveTo.loading) {
        this.fileService.update(event.element.id, { parent: event.moveTo.id });
        this.updateFileElementQuery();
      } else {
        this.fileService.delete(event.element.id);
        this.updateFileElementQuery();
      }
    }, error => {
      this.loading = false;
      console.log(error);
    });
  }

  /** Renomear arquivo ou pasta */
  renameElement(element: FileElement) {
    this.loading = true;
    let name = this.fileService.get(element.id).name;
    let oldPath = this.getPath([name]);
    let path = this.getPath([element.name]);
    this.fileService.renameFiles({
      oldPath: oldPath,
      path: path
    }).subscribe((data) => {
      this.loading = false;
      this.fileService.update(element.id, { name: element.name });
      this.updateFileElementQuery();
    }, (error) => {
      this.loading = false;
      console.error("An error occurred, ", error);
    });
  }

  cut(elements: FileElement[]) {
    if (elements) {
      this.clipboard = {
        method: 'cut',
        items: []
      }
      for (let element of elements) {
        let path = this.getPath([element.name]);
        this.clipboard.items.push({
          path: path,
          element: element
        })
      }
      console.log(this.clipboard);
    }
  }

  copy(elements: FileElement[]) {
    if (elements) {
      this.clipboard = {
        method: 'copy',
        items: []
      }
      for (let element of elements) {
        let path = this.getPath([element.name]);
        this.clipboard.items.push({
          path: path,
          element: element
        })
      }
      console.log(this.clipboard);
    }
  }

  paste(element: FileElement) {
    for (let item of this.clipboard.items) {
      this.loading = true;
      let path = '';
      if (element) {
        path = this.getPath([element.name, item.element.name]);
      } else {
        path = this.getPath([item.element.name]);
      }
      if (this.clipboard.method == 'cut') {
        this.fileService.renameFiles({
          oldPath: item.path,
          path: path
        }).subscribe(data => {
          this.loading = false;
          if (element) {
            if (element.loading) {
              this.fileService.update(item.element.id, { parent: element.id });
              this.updateFileElementQuery();
            } else {
              this.fileService.delete(item.element.id);
              this.updateFileElementQuery();
            }
          } else {
            if (this.currentRoot) {
              this.fileService.update(item.element.id, { parent: this.currentRoot.id });
              this.updateFileElementQuery();
            } else {
              this.fileService.update(item.element.id, { parent: 'root' });
              this.updateFileElementQuery();
            }
          }
        }, error => {
          this.loading = false;
          console.log(error);
        });
      } else if (this.clipboard.method == 'copy') {
        this.fileService.copy({
          oldPath: item.path,
          path: path
        });
      }
    }
    this.clipboard = null;
  }

  /** Atualiza elementos no HTML */
  updateFileElementQuery() {
    this.fileElements = this.fileService.queryInFolder(this.currentRoot ? this.currentRoot.id : 'root');
  }

  pushToPath(path: string, folderName: string) {
    let p = path ? path : '';
    p += `${folderName}/`;
    return p;
  }

  popFromPath(path: string) {
    let p = path ? path : '';
    let split = p.split('/');
    split.splice(split.length - 2, 1);
    p = split.join('/');
    return p;
  }

  getPath(items: string[] = []): string {
    let path = '';
    if (!this.currentPath) {
      path = '/' + this.root;
    } else {
      path = '/' + this.root + '/' + this.currentPath;
    }
    for (let item of items) {
      path += '/' + item;
    }
    while (true) {
      if (path.includes('//')) {
        path = path.replace('//', '/');
      } else {
        break;
      }
    }
    return path;
  }
}
