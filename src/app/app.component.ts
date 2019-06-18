import { Component, Input } from '@angular/core';
import { FileService } from './service/file.service';
import { Observable } from 'rxjs';
import { FileElement } from './model/element';
import { FileUploader } from 'ng2-file-upload';
import { WebsocketService } from './service/websocket.service';
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
export class AppComponent {
  public fileElements: Observable<FileElement[]>;

  constructor(
    public fileService: FileService,
    private websocketService: WebsocketService
  ) { }

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
  }

  download(element: FileElement) {
    let path = this.getPath([element.name]);
    this.fileService.download(path).subscribe((data: any) => {
      let url = URL + '/download/' + data.key;

      var a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = element.name;
      document.body.appendChild(a);
      a.click();
    }, () => { });
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
    let path = this.getPath([folder.name]);
    this.fileService.createFolder(path)
      .subscribe((data) => {
        this.fileService.add({
          isFolder: true,
          loading: false,
          name: folder.name,
          parent: this.currentRoot ? this.currentRoot.id : 'root'
        });
        this.updateFileElementQuery();
      }, (error) => {
        console.log(error);
      })
  }

  /** Deletar arquivo ou pasta */
  removeElement(elements: FileElement[]) {
    if (elements) {
      for (let element of elements) {
        let path = this.getPath([element.name]);
        this.fileService.deleteFiles(path)
          .subscribe(data => {
            this.fileService.delete(element.id);
            this.updateFileElementQuery();
          }, error => {
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
    let oldPath = this.getPath([event.element.name]);
    let path = this.getPath([event.moveTo.name, event.element.name]);
    this.fileService.renameFiles({
      oldPath: oldPath,
      path: path
    }).subscribe(data => {
      if (event.moveTo.loading) {
        this.fileService.update(event.element.id, { parent: event.moveTo.id });
        this.updateFileElementQuery();
      } else {
        this.fileService.delete(event.element.id);
        this.updateFileElementQuery();
      }
    }, error => {
      console.log(error);
    });
  }

  /** Renomear arquivo ou pasta */
  renameElement(element: FileElement) {
    let name = this.fileService.get(element.id).name;
    let oldPath = this.getPath([name]);
    let path = this.getPath([element.name]);
    this.fileService.renameFiles({
      oldPath: oldPath,
      path: path
    }).subscribe((data) => {
      this.fileService.update(element.id, { name: element.name });
      this.updateFileElementQuery();
    }, (error) => {
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
    if (this.clipboard.method == 'cut') {
      this.clipboard = null;
    } else if (this.clipboard.method == 'copy') {
      let sub = this.websocketService.get('copy').subscribe((message) => {

        if (!message.error && message.results) {
          if (message.results != '0') {

            for (let i = 0; i < message.results.length; i++) {
              for (let j = 0; j < this.clipboard.items.length; j++) {
                let src = message.results[i].src;
                if (src.includes(this.clipboard.items[j].path)) {
                  this.clipboard.items.splice(j, 1);
                  break;
                }
              }
            }

            if (this.clipboard.items.length == 0) {
              this.loading = false;
              sub.unsubscribe();
              this.clipboard = null;
            }
          }
        } else {
          if (message.code == "EEXIST") {

          }
          this.loading = false;
          sub.unsubscribe();
          this.clipboard = null;
        }
      });
    }
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
